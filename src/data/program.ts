import type { Program } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const program: Program = {
  id: "wi",
  title: "Wirtschaftsinformatik (B. Sc.)",
  university: "TH Mannheim",
  totalEcts: 210,
  regularSemesters: 7,
  foundationSemesters: 3,
  citation: {
    document: "Studienverlaufsplan Wirtschaftsinformatik",
    summary: "210 ECTS in 7 Semestern; Grundstudium in Fachsemester 1–3.",
    verified: false,
  },
};
