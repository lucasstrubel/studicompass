import type { IllustrationKind } from "./ModuleIllustration";

// Presentation only: which local line drawing stands next to which module (KONZEPT §12.4).
const MODULE_ART: Record<string, IllustrationKind> = {
  "m-stat": "chart",
  "m-db": "database",
  "m-se1": "books",
  "m-gpm": "process",
  "m-mkt": "globe",
};

export function moduleArt(moduleId: string): IllustrationKind {
  return MODULE_ART[moduleId] ?? "books";
}
