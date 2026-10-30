import type { Rule } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const rules: Rule[] = [
  {
    id: "DR-1",
    title: "Zu deinen ECTS zählen nur bestandene Prüfungen.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary: "Zu deinen ECTS zählen nur bestandene Prüfungen.",
      verified: false,
    },
    officeId: "o-pa",
    params: {},
  },
  {
    id: "DR-2",
    title: "Der Regelverlauf sieht 30 ECTS pro Semester vor.",
    citation: {
      document: "Studienverlaufsplan Wirtschaftsinformatik",
      summary: "Der Regelverlauf sieht 30 ECTS pro Semester vor.",
      verified: false,
    },
    officeId: "o-sd",
    params: {},
  },
  {
    id: "DR-3",
    title: "Ampel nach ECTS-Rückstand und Meilensteinverschiebung.",
    citation: {
      document: "StudiCompass – Berechnungsregel",
      summary:
        "Bis 6 ECTS im Plan, 7–23 knapp, ab 24 kritisch; verschobene Meilensteine sind kritisch.",
      verified: false,
    },
    params: {
      onTrackMaxDeficit: 6,
      criticalMinDeficit: 24,
    },
  },
  {
    id: "DR-4",
    title: "Statistik wird nur im Wintersemester angeboten.",
    citation: {
      document: "Modulhandbuch Wirtschaftsinformatik, Modul Statistik",
      summary: "Statistik wird nur im Wintersemester angeboten.",
      verified: false,
    },
    officeId: "o-sd",
    params: {},
  },
  {
    id: "DR-5",
    title:
      "Von einer angemeldeten Prüfung kannst du dich bis zum Vortag, 23:59 Uhr, ohne Angabe von Gründen abmelden. Die Abmeldung zählt nicht als Versuch.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary:
        "Von einer angemeldeten Prüfung kannst du dich bis zum Vortag, 23:59 Uhr, ohne Angabe von Gründen abmelden. Die Abmeldung zählt nicht als Versuch.",
      verified: false,
    },
    officeId: "o-pa",
    params: {},
  },
  {
    id: "DR-6",
    title:
      "Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary:
        "Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind.",
      verified: false,
    },
    officeId: "o-prakt",
    params: {},
  },
  {
    id: "DR-7",
    title:
      "Prüfungen des Hauptstudiums darfst du nur ablegen, wenn höchstens drei Prüfungen des Grundstudiums offen sind.",
    citation: {
      document: "SPO Wirtschaftsinformatik (Hinweis aus Interview I1)",
      summary:
        "Prüfungen des Hauptstudiums darfst du nur ablegen, wenn höchstens drei Prüfungen des Grundstudiums offen sind.",
      verified: false,
    },
    officeId: "o-pa",
    params: {
      maxOpenFoundation: 3,
    },
  },
  {
    id: "DR-8",
    title: "Jede Prüfung kannst du höchstens dreimal ablegen.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary: "Jede Prüfung kannst du höchstens dreimal ablegen.",
      verified: false,
    },
    officeId: "o-pa",
    params: {
      maxAttempts: 3,
    },
  },
  {
    id: "DR-9",
    title:
      "Dein Notenschnitt ist der nach ECTS gewichtete Durchschnitt; berücksichtigt wird nur die erste Nachkommastelle.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary:
        "Dein Notenschnitt ist der nach ECTS gewichtete Durchschnitt; berücksichtigt wird nur die erste Nachkommastelle.",
      verified: false,
    },
    officeId: "o-pa",
    params: {},
  },
  {
    id: "DR-10",
    title: "Mehr als 36 geplante ECTS: hohe Belastung.",
    citation: {
      document: "StudiCompass – Berechnungsregel",
      summary:
        "Bei mehr als 36 geplanten ECTS zeigt StudiCompass einen Belastungshinweis mit Nebenjob-Stunden.",
      verified: false,
    },
    params: {
      maxRegularLoad: 36,
    },
  },
  // P5-08: example rules that only mark the modules of a milestone in the planner; the projection does
  // not use them (KONZEPT §10.3).
  {
    id: "DR-11",
    title:
      "Zum Projektsemester wirst du zugelassen, wenn du das Praxissemester bestanden hast.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary:
        "Zum Projektsemester wirst du zugelassen, wenn du das Praxissemester bestanden hast.",
      verified: false,
    },
    officeId: "o-pa",
    params: {},
  },
  {
    id: "DR-12",
    title:
      "Zur Bachelorarbeit wirst du zugelassen, wenn du Praxis- und Projektsemester bestanden hast.",
    citation: {
      document: "SPO Wirtschaftsinformatik",
      summary:
        "Zur Bachelorarbeit wirst du zugelassen, wenn du Praxis- und Projektsemester bestanden hast.",
      verified: false,
    },
    officeId: "o-pa",
    params: {},
  },
  {
    id: "DR-13",
    title:
      "Sieht ein Modul eine Prüfungsvorleistung vor, wirst du zur Prüfung erst zugelassen, wenn du sie erbracht hast.",
    citation: {
      document: "Modulhandbuch Wirtschaftsinformatik",
      summary:
        "Sieht ein Modul eine Prüfungsvorleistung vor, wirst du zur Prüfung erst zugelassen, wenn du sie erbracht hast.",
      verified: false,
    },
    officeId: "o-pa",
    params: {},
  },
];
