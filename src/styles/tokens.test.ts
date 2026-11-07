import { describe, expect, it } from "vitest";
import globalsCss from "@/styles/globals.css?raw";

// Colours may change freely as long as these contrast minimums and token rules hold; this file contains
// no colour values of its own. The prototype has only the light design, so there is one palette: :root.

// --- Tokens in globals.css ---------------------------------------------------------------------------

function rootBlock(): Map<string, string> {
  const body = /^:root \{([^}]*)\}/m.exec(globalsCss)?.[1] ?? "";
  const tokens = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }
  return tokens;
}

const CSS_TOKENS = rootBlock();

/** Value of a token as an uppercase hex colour, with var(--…) aliases resolved. */
function token(name: string): string {
  let value = CSS_TOKENS.get(name);
  for (let depth = 0; value?.startsWith("var(") && depth < 5; depth++) {
    const reference = /^var\((--[\w-]+)\)$/.exec(value)?.[1] ?? "";
    value = CSS_TOKENS.get(reference);
  }
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`${name} does not resolve to a colour: ${value}`);
  }
  return value.toUpperCase();
}

// --- WCAG 2 contrast ---------------------------------------------------------------------------------

function channels(hex: string): number[] {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex)
    .map((channel) => channel / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/** Colour of `foreground` at `alpha` over `background` (e.g. bg-destructive/10). */
function blend(foreground: string, alpha: number, background: string): string {
  const back = channels(background);
  return `#${channels(foreground)
    .map((channel, index) =>
      Math.round(channel * alpha + back[index] * (1 - alpha)),
    )
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

describe("design tokens", () => {
  // Pairs that arise from mapping the tokens onto shadcn (text 4.5:1, controls 3:1).
  it("mapped shadcn states keep AA contrast", () => {
    for (const surface of ["--background", "--card", "--muted"]) {
      expect(
        contrast(token("--ring"), token(surface)),
        `focus ring on ${surface}`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrast(token("--accent-strong"), token(surface)),
        `link on ${surface}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    // Button and badge "destructive": tint 10 % at rest and 15 % on hover (button.tsx, badge.tsx).
    for (const surface of ["--background", "--card"]) {
      for (const alpha of [0.1, 0.15]) {
        const tint = blend(token("--destructive"), alpha, token(surface));
        expect(
          contrast(token("--destructive"), tint),
          `destructive/${alpha * 100} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("secondary text, progress and control outlines stay distinguishable", () => {
    for (const surface of ["--background", "--card", "--muted"]) {
      expect(
        contrast(token("--muted-foreground"), token(surface)),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token("--input"), token(surface))).toBeGreaterThanOrEqual(
        3,
      );
    }
    expect(
      contrast(token("--accent-strong"), token("--muted")),
    ).toBeGreaterThanOrEqual(3);
    // Colour family: lines, bars and strokes on every surface they appear on; ink on the soft tones.
    for (const tone of ["violet", "teal", "blue", "plum", "slate"]) {
      for (const surface of ["--background", "--card", "--muted"]) {
        expect(
          contrast(token(`--tone-${tone}`), token(surface)),
          `${tone} on ${surface}`,
        ).toBeGreaterThanOrEqual(3);
      }
      expect(
        contrast(token("--foreground"), token(`--tone-${tone}-soft`)),
        `ink on ${tone}-soft`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    // Ink on mandarin: the assistant button.
    expect(
      contrast(token("--accent-foreground"), token("--accent")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("the dark hero surface keeps text, line and focus ring readable", () => {
    for (const surface of ["--hero", "--hero-raised"]) {
      for (const text of ["--hero-foreground", "--hero-muted"]) {
        expect(
          contrast(token(text), token(surface)),
          `${text} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
    // The line colour doubles as link and focus ring inside .surface-hero.
    expect(
      contrast(token("--hero-line"), token("--hero")),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(token("--hero-target"), token("--hero")),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrast(token("--accent"), token("--hero")),
      "needle on hero",
    ).toBeGreaterThanOrEqual(3);
  });

  it("status text stays readable on its soft surface", () => {
    for (const status of ["on-track", "tight", "critical", "info"]) {
      expect(
        contrast(
          token(`--status-${status}-foreground`),
          token(`--status-${status}-soft`),
        ),
        status,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

// --- Static checks over the source files -------------------------------------------------------------

const SOURCES = import.meta.glob<string>(
  ["/src/**/*.{ts,tsx,css}", "!/src/styles/globals.css"],
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

describe("token usage in the source files", () => {
  it("finds the source files", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(20);
  });

  it("has no hex colours outside globals.css", () => {
    // chart.tsx selects the stroke attributes in which Recharts writes its default colours; selectors, no values.
    const rechartsSelector = /\[(?:stroke|fill)='#[0-9a-f]{3,6}'\]/gi;
    for (const [path, source] of Object.entries(SOURCES)) {
      const hexColours =
        source.replace(rechartsSelector, "").match(/#[0-9a-f]{3,8}\b/gi) ?? [];
      expect(hexColours, path).toEqual([]);
    }
  });

  it("leaves the focus ring to globals.css", () => {
    for (const [path, source] of Object.entries(SOURCES)) {
      if (!path.endsWith(".tsx") || path.includes(".test.")) continue;
      const ownFocusStyles =
        source.match(
          /focus-visible:(?:ring|border-ring|outline-(?:none|hidden))\S*/g,
        ) ?? [];
      expect(ownFocusStyles, path).toEqual([]);
    }
  });
});
