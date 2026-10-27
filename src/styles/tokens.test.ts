import { describe, expect, it } from "vitest";
import konzept from "../../docs/KONZEPT.md?raw";
import globalsCss from "@/styles/globals.css?raw";

// KONZEPT §12.2 is the oracle for the colour tokens: the values are read from its tables, so this file
// contains no colour values of its own; the contrast ratios below are the ones documented there.
// The prototype has only the light design (P5-06), so there is one palette: the :root block.

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

// --- Token tables in KONZEPT §12.2 -------------------------------------------------------------------

function between(text: string, start: string, end: string): string {
  const from = text.indexOf(start);
  const to = text.indexOf(end, from + start.length);
  if (from < 0 || to < 0) throw new Error(`"${start}" … "${end}" not found`);
  return text.slice(from + start.length, to);
}

function tableRows(table: string): string[][] {
  return table
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|[\s|:-]+\|$/.test(line))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
}

const quoted = (cell: string, pattern: RegExp) =>
  [...cell.matchAll(pattern)].map((match) => match[1].toUpperCase());
const tokenNames = (cell: string) =>
  [...cell.matchAll(/`(--[\w-]+)`/g)].map((m) => m[1]);
const colours = (cell: string) => quoted(cell, /`(#[0-9a-f]{6})`/gi);

/** Rows like "| `--primary` / `--primary-foreground` | `…` / `…` | …" (first colours = the tokens). */
function tokenTable(table: string): Map<string, string> {
  const expected = new Map<string, string>();
  for (const [names = "", values = ""] of tableRows(table)) {
    tokenNames(names).forEach((name, index) => {
      expected.set(name, colours(values)[index]);
    });
  }
  return expected;
}

const STATUS_KEYS: Record<string, string> = {
  "Im Plan": "on-track",
  Knapp: "tight",
  Kritisch: "critical",
  Info: "info",
};

/** Status rows: surface/icon · text · soft surface. */
function statusTable(table: string): Map<string, string> {
  const expected = new Map<string, string>();
  for (const [status = "", values = ""] of tableRows(table)) {
    const key = STATUS_KEYS[status];
    if (!key) continue;
    const [surface, text, soft] = colours(values);
    expected.set(`--status-${key}`, surface);
    expected.set(`--status-${key}-foreground`, text);
    expected.set(`--status-${key}-soft`, soft);
  }
  return expected;
}

const SECTION = between(konzept, "### 12.2", "### 12.3");
const KONZEPT_TOKENS = new Map([
  ...tokenTable(between(SECTION, "**Grundfarben**", "**Statusfarben**")),
  ...statusTable(between(SECTION, "**Statusfarben**", "Regeln:")),
]);

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

// Pairs documented in KONZEPT §12.2: [text or graphic, surface, ratio as given there].
const DOCUMENTED_PAIRS: [string, string, number][] = [
  ["--foreground", "--background", 16.7],
  ["--muted-foreground", "--background", 7.3],
  ["--muted-foreground", "--card", 7.7],
  ["--muted-foreground", "--muted", 6.4],
  ["--input", "--card", 4.2],
  ["--primary-foreground", "--primary", 16.7],
  ["--accent", "--background", 2.96],
  ["--accent-foreground", "--accent", 5.6],
  ["--card", "--accent", 3.1],
  ["--accent-strong", "--background", 5.6],
  ["--accent-strong", "--card", 5.9],
  ["--accent-soft-foreground", "--accent-soft", 5.4],
  ["--sidebar-foreground", "--sidebar", 12.1],
  ["--sidebar-muted", "--sidebar", 6.9],
  ["--accent", "--sidebar-active", 4.7],
  ["--sidebar-foreground", "--sidebar-active", 10.0],
  ["--status-on-track", "--card", 3.7],
  ["--status-on-track-foreground", "--card", 5.8],
  ["--status-on-track-foreground", "--status-on-track-soft", 5.0],
  ["--status-tight", "--card", 3.7],
  ["--status-tight-foreground", "--card", 5.9],
  ["--status-tight-foreground", "--status-tight-soft", 5.2],
  ["--status-critical", "--card", 4.8],
  ["--status-critical-foreground", "--card", 6.5],
  ["--status-critical-foreground", "--status-critical-soft", 5.3],
  ["--status-info-foreground", "--card", 6.0],
  ["--status-info-foreground", "--status-info-soft", 5.0],
];

const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

/**
 * True if `ratio` rounds to the value given in KONZEPT, to as many decimals as given there (at least one).
 * Two values in §12.2 were rounded via two decimals first (4.646 → 4.65 → 4.7, 5.449 → 5.45 → 5.5);
 * that reading counts as a match too.
 */
function matchesDocumented(ratio: number, documented: number): boolean {
  const decimals = Math.max(
    1,
    documented.toString().split(".")[1]?.length ?? 0,
  );
  return (
    round(ratio, decimals) === documented ||
    round(round(ratio, decimals + 1), decimals) === documented
  );
}

describe("design tokens (KONZEPT §12.2)", () => {
  it("every token has the value from the KONZEPT tables", () => {
    // 18 base tokens plus 3 per status; fails if the tables can no longer be read.
    expect(KONZEPT_TOKENS.size).toBe(30);
    for (const [name, value] of KONZEPT_TOKENS) {
      expect(token(name), name).toBe(value);
    }
  });

  it("contrast pairs match KONZEPT §12.2", () => {
    for (const [foreground, background, documented] of DOCUMENTED_PAIRS) {
      const ratio = contrast(token(foreground), token(background));
      expect(
        matchesDocumented(ratio, documented),
        `${foreground} on ${background}: ${ratio.toFixed(3)}:1, KONZEPT ${documented}:1`,
      ).toBe(true);
    }
  });

  // Pairs that arise from mapping the tokens onto shadcn (Q-4: text 4.5:1, controls 3:1).
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
    for (const surface of ["--sidebar", "--sidebar-active"]) {
      expect(
        contrast(token("--sidebar-ring"), token(surface)),
        `sidebar focus ring on ${surface}`,
      ).toBeGreaterThanOrEqual(3);
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
    // The prominent card uses ink for text and focus on terracotta.
    expect(
      contrast(token("--accent-foreground"), token("--accent")),
    ).toBeGreaterThanOrEqual(4.5);
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

  it("has no hex colours outside globals.css (ROADMAP P1-03)", () => {
    // chart.tsx selects the stroke attributes in which Recharts writes its default colours; selectors, no values.
    const rechartsSelector = /\[(?:stroke|fill)='#[0-9a-f]{3,6}'\]/gi;
    for (const [path, source] of Object.entries(SOURCES)) {
      const hexColours =
        source.replace(rechartsSelector, "").match(/#[0-9a-f]{3,8}\b/gi) ?? [];
      expect(hexColours, path).toEqual([]);
    }
  });

  it("leaves the focus ring to globals.css (KONZEPT §12.4)", () => {
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
