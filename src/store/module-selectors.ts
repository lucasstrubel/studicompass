import type { DemoState } from "./demo-store";
import { selectAcademicState } from "./selectors";
import type { Module } from "@/domain/types";
import { passedModuleRecords } from "@/domain/progress";

export function selectPassedModuleCount(state: DemoState) {
  return passedModuleRecords(selectAcademicState(state)?.exams ?? []).size;
}

export function selectModuleRecord(state: DemoState, module: Module) {
  const exams =
    selectAcademicState(state)?.exams.filter(
      (exam) => exam.moduleId === module.id,
    ) ?? [];
  return passedModuleRecords(exams).get(module.id) ?? exams.at(-1) ?? null;
}
