import type { Student } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const student: Student = {
  id: "niklas",
  firstName: "Niklas",
  lastName: "Brandt",
  matriculationNo: "3012458",
  email: "niklas.brandt@stud.hochschule.example",
  startTerm: {
    season: "WS",
    year: 2025,
  },
  goalRegularTime: true,
  jobHoursPerWeek: 15,
};
