import type { ExamStatus, Offering } from "@/domain/types";

export const EXAM_STATUS: Record<ExamStatus, string> = {
  passed: "Bestanden",
  failed: "Nicht bestanden",
  registered: "Angemeldet",
  withdrawn: "Abgemeldet",
};

export const OFFERING: Record<Offering, string> = {
  WS: "nur WS",
  SS: "nur SS",
  BOTH: "jedes Semester",
};
