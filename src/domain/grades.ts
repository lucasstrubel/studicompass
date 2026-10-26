import type { ExamRecord, Module } from "./types";
import { passedModuleRecords } from "./progress";

/** DR-1/DR-9: ECTS-weighted passed grades truncated to one decimal; null if none. */
export function gradeAverage(
  modules: Module[],
  exams: ExamRecord[],
): number | null {
  const passed = passedModuleRecords(exams);
  let totalEcts = 0;
  let weightedTenths = 0;
  for (const module of modules) {
    const grade = passed.get(module.id)?.grade;
    if (grade === undefined) continue;
    totalEcts += module.ects;
    // Grade tenths avoid floating-point underflow at exact boundaries such as 2.4.
    weightedTenths += grade * 10 * module.ects;
  }
  return totalEcts === 0 ? null : Math.floor(weightedTenths / totalEcts) / 10;
}
