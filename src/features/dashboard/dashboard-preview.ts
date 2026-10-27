import type { IllustrationKind } from "./ModuleIllustration";
/** Presentation fixture from INHALTE §3–7 and KONZEPT §8 S1 / §10.4. Replaced by selectors in P3-02. */
export interface PreviewModule {
  id: string;
  name: string;
  description: string;
  exam: string;
  room: string;
  progress: string;
  percent: number;
  winterOnly: boolean;
  art: IllustrationKind;
}

export interface DashboardPreviewData {
  name: string;
  semester: string;
  semesterNumber: number;
  behindTarget: number;
  deadline: {
    title: string;
    day: string;
    date: string;
    remaining: string;
    source: string;
  };
  milestone: {
    title: string;
    description: string;
    requirement: string;
    source: string;
  };
  earned: number;
  total: number;
  target: number;
  earnedPercent: number;
  targetPercent: number;
  forecast: string;
  modules: readonly PreviewModule[];
  inbox: readonly { id: string; channel: string; title: string }[];
  grades: readonly { name: string; grade: string }[];
}

export const dashboardPreview: DashboardPreviewData = {
  name: "Niklas",
  semester: "WS 2026/27",
  semesterNumber: 3,
  behindTarget: 12,
  deadline: {
    title: "Abmeldung Statistik",
    day: "Morgen · 26. Januar",
    date: "Di, 26.01.2027 · 23:59 Uhr",
    remaining: "Noch 1 Tag, 4 Std. 29 Min.",
    source: "SPO Wirtschaftsinformatik; POS",
  },
  milestone: {
    title: "Praxissemester · WS 2027/28",
    description:
      "Noch offen: 7 Module des Grundstudiums. 5 davon sind in diesem Semester angemeldet.",
    requirement: "Voraussetzung: alle Module des Grundstudiums bestanden.",
    source: "SPO Wirtschaftsinformatik",
  },
  earned: 48,
  total: 210,
  target: 60,
  earnedPercent: 22.86,
  targetPercent: 28.57,
  forecast: "78 von 90 ECTS – wenn du alle angemeldeten Prüfungen bestehst.",
  modules: [
    {
      id: "m-stat",
      name: "Statistik",
      description: "Verteilungen, Schätzen und Testen",
      exam: "Mi, 27.01.2027 · 10:30",
      room: "A 210",
      progress: "Übungsblätter 5/12",
      percent: 42,
      winterOnly: true,
      art: "chart",
    },
    {
      id: "m-db",
      name: "Datenbanken",
      description: "Relationale Modelle und SQL",
      exam: "Fr, 29.01.2027 · 08:30",
      room: "B 104",
      progress: "Übungsblätter 11/12",
      percent: 92,
      winterOnly: true,
      art: "database",
    },
    {
      id: "m-se1",
      name: "Software Engineering 1",
      description: "Gemeinsam Software entwerfen",
      exam: "Di, 02.02.2027 · 10:30",
      room: "A 210",
      progress: "Projektbericht abgegeben",
      percent: 100,
      winterOnly: true,
      art: "books",
    },
    {
      id: "m-gpm",
      name: "Geschäftsprozessmanagement",
      description: "Prozesse verstehen und verbessern",
      exam: "Do, 04.02.2027 · 13:30",
      room: "C 012",
      progress: "Übungen 9/10",
      percent: 90,
      winterOnly: false,
      art: "process",
    },
    {
      id: "m-mkt",
      name: "Marketing",
      description: "Märkte, Menschen und Strategien",
      exam: "Mo, 08.02.2027 · 10:30",
      room: "B 104",
      progress: "Fallstudien 4/6",
      percent: 67,
      winterOnly: false,
      art: "globe",
    },
  ],
  inbox: [
    {
      id: "i-01",
      channel: "Moodle",
      title: "Statistik: Übungsblatt 12 und Lösungen online",
    },
    {
      id: "i-02",
      channel: "Mail",
      title: "Raumänderung: Klausur Statistik in A 210",
    },
    {
      id: "i-04",
      channel: "Mail",
      title: "Infoveranstaltung Praxissemester WS 2027/28",
    },
  ],
  grades: [
    { name: "Kosten- und Leistungsrechnung", grade: "2,3" },
    { name: "Betriebssysteme und Rechnernetze", grade: "2,0" },
    { name: "Mathematik 2", grade: "3,3" },
  ],
};
