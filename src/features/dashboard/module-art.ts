import type { CSSProperties } from "react";
import type { IllustrationKind } from "./ModuleIllustration";

// Presentation only: which line drawing and which colour of the family stand next to which module.
const MODULE_ART: Record<string, IllustrationKind> = {
  "m-stat": "chart",
  "m-db": "database",
  "m-se1": "books",
  "m-gpm": "process",
  "m-mkt": "globe",
};

export type ModuleTone = "violet" | "teal" | "blue" | "plum" | "slate";

const TONES: readonly ModuleTone[] = [
  "violet",
  "teal",
  "blue",
  "plum",
  "slate",
];

// The modules of the overview, each in its own colour.
const MODULE_TONES: Record<string, ModuleTone> = {
  "m-stat": "violet",
  "m-db": "teal",
  "m-se1": "blue",
  "m-gpm": "plum",
  "m-mkt": "slate",
};

export function moduleArt(moduleId: string): IllustrationKind {
  return MODULE_ART[moduleId] ?? "books";
}

/** Fixed colour per module; modules without an entry get a stable one from their id. */
export function moduleTone(moduleId: string): ModuleTone {
  const sum = [...moduleId].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  return MODULE_TONES[moduleId] ?? TONES[sum % TONES.length];
}

/** Sets --module-tone and --module-tone-soft for the drawing, progress bar or grade below. */
export function moduleToneStyle(moduleId: string): CSSProperties {
  const tone = moduleTone(moduleId);
  return {
    "--module-tone": `var(--tone-${tone})`,
    "--module-tone-soft": `var(--tone-${tone}-soft)`,
  } as CSSProperties;
}
