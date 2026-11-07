import type { CSSProperties } from "react";
import type { IllustrationKind } from "./ModuleIllustration";

// Presentation only: which line drawing and which colour of the family stand next to which module.
const MODULE_ART: Record<string, IllustrationKind> = {
  "m-pr1": "code",
  "m-pr2": "code",
  "m-dm": "database",
  "m-web": "globe",
  "m-wi1": "process",
  "m-wi2": "process",
  "m-wi3": "process",
  "m-bwl1": "chart",
  "m-bwl2": "chart",
  "m-bwl3": "chart",
  "m-ma1": "chart",
  "m-ma2": "chart",
  "m-ma3": "chart",
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
  "m-pr2": "violet",
  "m-dm": "teal",
  "m-web": "blue",
  "m-bwl2": "plum",
  "m-wi3": "slate",
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
