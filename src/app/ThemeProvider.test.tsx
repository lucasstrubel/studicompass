import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { useTheme } from "@/app/theme-context";
import { ThemeProvider } from "@/app/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/config/demo";

afterEach(() => {
  vi.restoreAllMocks();
});

// Replaces the matchMedia stub from setupTests with a system theme that can change during the test.
function mockSystemTheme(initiallyDark: boolean) {
  let dark = initiallyDark;
  const listeners = new Set<EventListenerOrEventListenerObject>();
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    get matches() {
      return dark;
    },
    media: query,
    onchange: null,
    addEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      listeners.add(listener);
    },
    removeEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      listeners.delete(listener);
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));

  return {
    setDark(next: boolean) {
      dark = next;
      const event = new Event("change");
      for (const listener of listeners) {
        if (typeof listener === "function") listener(event);
        else listener.handleEvent(event);
      }
    },
  };
}

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <>
      <p>{`${theme} → ${resolvedTheme}`}</p>
      <button type="button" onClick={() => setTheme("light")}>
        Hell
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        Dunkel
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        System
      </button>
    </>
  );
}

const isDark = () => document.documentElement.classList.contains("dark");

describe("ThemeProvider", () => {
  it("follows the system theme by default, also when it changes", () => {
    const system = mockSystemTheme(false);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText("system → light")).toBeInTheDocument();
    expect(isDark()).toBe(false);

    act(() => system.setDark(true));

    expect(screen.getByText("system → dark")).toBeInTheDocument();
    expect(isDark()).toBe(true);
  });

  it("starts with the stored choice", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText("dark → dark")).toBeInTheDocument();
    expect(isDark()).toBe(true);
  });

  it("stores the choice and applies it regardless of the system theme", async () => {
    const user = userEvent.setup();
    mockSystemTheme(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Hell" }));
    expect(screen.getByText("light → light")).toBeInTheDocument();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(isDark()).toBe(false);

    await user.click(screen.getByRole("button", { name: "System" }));
    expect(screen.getByText("system → dark")).toBeInTheDocument();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(isDark()).toBe(true);
  });

  it("passes the resolved theme to the toaster", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <AppProviders>
        <p>Übersicht</p>
      </AppProviders>,
    );

    act(() => {
      toast("Abmeldung von Statistik simuliert");
    });

    expect(
      await screen.findByText("Abmeldung von Statistik simuliert"),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-sonner-toaster]")).toHaveAttribute(
      "data-sonner-theme",
      "dark",
    );
  });
});
