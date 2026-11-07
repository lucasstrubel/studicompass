import type { CSSProperties } from "react";
import {
  BookOpen,
  ChartColumn,
  Database,
  Globe,
  Workflow,
  type LucideIcon,
} from "lucide-react";

// Presentation only: which icon and which colour of the family stand next to which module.
const MODULE_ICONS: Record<string, LucideIcon> = {
  "m-stat": ChartColumn,
  "m-db": Database,
  "m-se1": BookOpen,
  "m-gpm": Workflow,
  "m-mkt": Globe,
};

export type ModuleTone = "violet" | "teal" | "blue" | "plum" | "slate";

const TONES: readonly ModuleTone[] = [
  "violet",
  "teal",
  "blue",
  "plum",
  "slate",
];

// The modules of the overview: this semester's exams and the recent grades, each in its own colour.
const MODULE_TONES: Record<string, ModuleTone> = {
  "m-stat": "violet",
  "m-db": "teal",
  "m-se1": "blue",
  "m-gpm": "plum",
  "m-mkt": "slate",
  "m-klr": "teal",
  "m-bsrn": "blue",
  "m-mathe2": "violet",
};

export function moduleIcon(moduleId: string): LucideIcon {
  return MODULE_ICONS[moduleId] ?? BookOpen;
}

/** Fixed colour per module; modules without an entry get a stable one from their id. */
export function moduleTone(moduleId: string): ModuleTone {
  const sum = [...moduleId].reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  return MODULE_TONES[moduleId] ?? TONES[sum % TONES.length];
}

/** Sets --module-tone and --module-tone-soft for the icon, progress bar or grade below. */
export function moduleToneStyle(moduleId: string): CSSProperties {
  const tone = moduleTone(moduleId);
  return {
    "--module-tone": `var(--tone-${tone})`,
    "--module-tone-soft": `var(--tone-${tone}-soft)`,
  } as CSSProperties;
}
