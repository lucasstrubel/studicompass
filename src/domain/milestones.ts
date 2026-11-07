import type { Module } from "./types";

/** Milestone markers of the planner. */
export type MilestoneKind =
  "foundationEnd" | "internship" | "project" | "thesis";

export interface MilestoneModules {
  /** Rule that defines the assignment; null for the end of the foundation phase (study plan). */
  ruleId: "DR-6" | "DR-11" | "DR-12" | null;
  moduleIds: string[];
}

/**
 * Modules that belong to a milestone (P5-08): the foundation modules for the end of the foundation phase,
 * the internship (DR-6) and the project (DR-11), everything planned for the first five semesters for the
 * thesis (DR-12).
 */
export function milestoneModules(
  kind: MilestoneKind,
  modules: Module[],
): MilestoneModules {
  const ids = (predicate: (module: Module) => boolean) =>
    modules.filter(predicate).map((module) => module.id);
  switch (kind) {
    case "foundationEnd":
      return {
        ruleId: null,
        moduleIds: ids((module) => module.phase === "foundation"),
      };
    case "internship":
      return {
        ruleId: "DR-6",
        moduleIds: ids((module) => module.phase === "foundation"),
      };
    case "project":
      return {
        ruleId: "DR-11",
        moduleIds: ids((module) => module.phase === "foundation"),
      };
    case "thesis":
      return {
        ruleId: "DR-12",
        moduleIds: ids((module) => module.plannedSemester <= 5),
      };
  }
}
