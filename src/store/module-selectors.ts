import type { DemoState } from "./demo-store";
import { selectAcademicState } from "./selectors";
import type { ExamRecord, Module } from "@/domain/types";
import { passedModuleRecords } from "@/domain/progress";

export function selectPassedModuleCount(state: DemoState) {
  return passedModuleRecords(selectAcademicState(state)?.exams ?? []).size;
}

/** The exam that describes a module: the passing one, otherwise the latest. */
export function moduleRecord(
  exams: ExamRecord[],
  module: Module,
): ExamRecord | null {
  const own = exams.filter((exam) => exam.moduleId === module.id);
  return passedModuleRecords(own).get(module.id) ?? own.at(-1) ?? null;
}

export function selectModuleRecord(state: DemoState, module: Module) {
  return moduleRecord(selectAcademicState(state)?.exams ?? [], module);
}
