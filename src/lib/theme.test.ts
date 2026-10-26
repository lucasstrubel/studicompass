import { afterEach, describe, expect, it, vi } from "vitest";
import indexHtml from "../../index.html?raw";
import { THEME_STORAGE_KEY } from "@/config/demo";
import {
  applyTheme,
  isThemePreference,
  readStoredTheme,
  resolveTheme,
  writeStoredTheme,
} from "@/lib/theme";

afterEach(() => {
  vi.restoreAllMocks();
});

function stubSystemTheme(dark: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: dark,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

function blockStorage() {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("storage blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("storage blocked");
  });
}

const isDark = () => document.documentElement.classList.contains("dark");

describe("resolveTheme", () => {
  it.each([
    ["system", false, "light"],
    ["system", true, "dark"],
    ["light", false, "light"],
    ["light", true, "light"],
    ["dark", false, "dark"],
    ["dark", true, "dark"],
  ] as const)(
    "%s with a dark system theme = %s shows %s",
    (preference, systemDark, expected) => {
      expect(resolveTheme(preference, systemDark)).toBe(expected);
    },
  );
});

describe("stored theme", () => {
  it("is system when nothing or an unknown value is stored", () => {
    expect(readStoredTheme()).toBe("system");

    localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    expect(readStoredTheme()).toBe("system");
  });

  it("is written and read under the theme key", () => {
    writeStoredTheme("dark");

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(readStoredTheme()).toBe("dark");
  });

  it("falls back to system when the storage is blocked", () => {
    blockStorage();

    expect(() => writeStoredTheme("dark")).not.toThrow();
    expect(readStoredTheme()).toBe("system");
  });

  it("accepts only system, light and dark", () => {
    expect(["system", "light", "dark"].every(isThemePreference)).toBe(true);
    expect([null, "", "sepia", 1].some(isThemePreference)).toBe(false);
  });
});

describe("applyTheme", () => {
  it("switches the dark class on <html>", () => {
    applyTheme("dark");
    expect(isDark()).toBe(true);

    applyTheme("light");
    expect(isDark()).toBe(false);
  });
});

// index.html sets the theme before React renders (no light flash); it must decide like resolveTheme.
describe("theme script in index.html", () => {
  const script = /<script>([\s\S]*?)<\/script>/.exec(indexHtml)?.[1] ?? "";

  function runScript() {
    // The plugin in vite.config.ts fills the key the same way.
    const source = script.replaceAll("%THEME_STORAGE_KEY%", THEME_STORAGE_KEY);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- runs the exact inline script from index.html
    const run = new Function(source) as () => void;
    run();
  }

  it("runs in the head before the app module and reads the theme key", () => {
    expect(script).toContain("%THEME_STORAGE_KEY%");
    expect(indexHtml.indexOf("<script>")).toBeLessThan(
      indexHtml.indexOf("</head>"),
    );
    expect(indexHtml.indexOf("<script>")).toBeLessThan(
      indexHtml.indexOf('<script type="module"'),
    );
  });

  it.each([
    [null, false],
    [null, true],
    ["system", true],
    ["light", false],
    ["light", true],
    ["dark", false],
    ["dark", true],
    ["sepia", true],
  ])("stored %s with a dark system theme = %s", (stored, systemDark) => {
    if (stored !== null) localStorage.setItem(THEME_STORAGE_KEY, stored);
    stubSystemTheme(systemDark);

    runScript();

    const preference = isThemePreference(stored) ? stored : "system";
    expect(isDark()).toBe(resolveTheme(preference, systemDark) === "dark");
  });

  it("follows the system theme when the storage is blocked", () => {
    blockStorage();
    stubSystemTheme(true);

    runScript();

    expect(isDark()).toBe(true);
  });
});
