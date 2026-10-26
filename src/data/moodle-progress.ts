import type { MoodleProgress } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const moodleProgress: MoodleProgress[] = [
  {
    moduleId: "m-stat",
    label: "Übungsblätter 5/12",
    completed: 5,
    total: 12,
    detail: "letzte Aktivität vor 16 Tagen",
  },
  {
    moduleId: "m-db",
    label: "Übungsblätter 11/12",
    completed: 11,
    total: 12,
    detail: "Probeklausur verfügbar",
  },
  {
    moduleId: "m-se1",
    label: "Projektbericht abgegeben",
    detail: "Feedback online",
  },
  {
    moduleId: "m-gpm",
    label: "Übungen 9/10",
    completed: 9,
    total: 10,
  },
  {
    moduleId: "m-mkt",
    label: "Fallstudien 4/6",
    completed: 4,
    total: 6,
    detail: "Fallstudie 5 bis 31.01.",
  },
];
