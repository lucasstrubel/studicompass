import type { ExamRecord, Module } from "./types";
import { compare } from "./terms";

/** DR-1: status and grade must both confirm a passed exam. */
export function isPassedExam(exam: ExamRecord): boolean {
  return (
    exam.status === "passed" &&
    exam.grade !== undefined &&
    Number.isFinite(exam.grade) &&
    exam.grade <= 4
  );
}

/** A module contributes once; retain the earliest valid passing event. */
export function passedModuleRecords(
  exams: ExamRecord[],
): Map<string, ExamRecord> {
  const passed = new Map<string, ExamRecord>();
  for (const exam of exams) {
    if (!isPassedExam(exam)) continue;
    const previous = passed.get(exam.moduleId);
    if (!previous || compare(exam.term, previous.term) < 0)
      passed.set(exam.moduleId, exam);
  }
  return passed;
}

/** DR-5/DR-8: completed attempts only; registrations and withdrawals consume none. */
export function usedAttempts(exams: ExamRecord[], moduleId: string): number {
  const completed = exams.filter(
    (exam) =>
      exam.moduleId === moduleId &&
      (exam.status === "failed" || exam.status === "passed"),
  );
  return completed.reduce(
    (used, exam) => Math.max(used, exam.attempt ?? 0),
    completed.length,
  );
}

/** DR-1: ECTS of unique modules with a passed exam and grade <= 4.0. */
export function earnedEcts(modules: Module[], exams: ExamRecord[]): number {
  const passed = passedModuleRecords(exams);
  return modules
    .filter((module) => passed.has(module.id))
    .reduce((sum, module) => sum + module.ects, 0);
}

/** DR-2: curriculum ECTS through the given semester (inclusive). */
export function targetEcts(modules: Module[], semester: number): number {
  return modules
    .filter((module) => module.plannedSemester <= semester)
    .reduce((sum, module) => sum + module.ects, 0);
}

/** DR-6/DR-7: foundation modules without a passed exam. */
export function openFoundationModules(
  modules: Module[],
  exams: ExamRecord[],
): Module[] {
  const passed = passedModuleRecords(exams);
  return modules.filter(
    (module) => module.phase === "foundation" && !passed.has(module.id),
  );
}
