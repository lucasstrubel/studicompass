import type { Coursework, ExamAdmission } from "./types";

/**
 * Admission to the exam from the module's Prüfungsvorleistungen (DR-13, P5-13): none entered → "none";
 * one not achieved → "notAdmitted"; all achieved → "admitted"; otherwise "open". Display only – the
 * projection does not use it (KONZEPT §10.3).
 */
export function examAdmission(items: Coursework[]): ExamAdmission {
  if (items.length === 0) return "none";
  if (items.some((item) => item.status === "failed")) return "notAdmitted";
  if (items.every((item) => item.status === "done")) return "admitted";
  return "open";
}
