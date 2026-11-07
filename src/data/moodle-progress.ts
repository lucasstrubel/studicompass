import type { MoodleProgress } from "@/domain/types";

// Beispieldaten: Fortschritt in den Pflichtübungen.
export const moodleProgress: MoodleProgress[] = [
  {
    moduleId: "m-pr2",
    label: "Übungsblätter 5/12",
    completed: 5,
    total: 12,
    detail: "letzte Aktivität vor 16 Tagen",
  },
  {
    moduleId: "m-dm",
    label: "Übungsblätter 11/12",
    completed: 11,
    total: 12,
    detail: "Probeklausur verfügbar",
  },
  {
    moduleId: "m-web",
    label: "Pflichtübung abgegeben",
    detail: "Feedback online",
  },
  {
    moduleId: "m-bwl2",
    label: "Übungen 9/10",
    completed: 9,
    total: 10,
    detail: "zweiter Versuch",
  },
  {
    moduleId: "m-wi3",
    label: "Pflichtübungen 4/6",
    completed: 4,
    total: 6,
    detail: "Übung 5 bis 31.01.",
  },
];
