import type { AssistantEntry } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const assistantCatalog: AssistantEntry[] = [
  {
    id: "A-01",
    question: "Bis wann kann ich mich von einer Prüfung abmelden?",
    suggested: true,
    keywords: [
      "abmelden",
      "abmeldung",
      "abmeldefrist",
      "prüfung absagen",
      "nicht antreten",
      "bis wann",
    ],
    shortAnswer:
      "**Bis zum Vortag der Prüfung um 23:59 Uhr** – ohne Angabe von Gründen, im POS.",
    ruleIds: ["DR-5"],
    officeIds: ["o-pa"],
    actions: [
      {
        label: "Folgen-Check für Statistik öffnen",
        href: "/entscheidung/e-stat-ws26",
      },
    ],
    followUpIds: ["A-02", "A-04"],
    resolver: "nextWithdrawalDeadline",
    personalExample:
      "Für Statistik heißt das: bis morgen, Di 26.01., 23:59 Uhr.",
    details:
      "Eine Abmeldung zählt nicht als Prüfungsversuch. Nach Ablauf der Frist ist ein Rücktritt nur noch aus wichtigem Grund möglich, zum Beispiel mit ärztlichem Attest.",
  },
  {
    id: "A-02",
    question: "Was passiert, wenn ich Statistik schiebe?",
    suggested: true,
    keywords: [
      "statistik",
      "schieben",
      "verschieben",
      "abmelden",
      "später schreiben",
      "nicht schreiben",
    ],
    shortAnswer:
      "**Statistik gibt es nur im Wintersemester.** Meldest du dich ab, ist der nächste Termin im WS 2027/28 – dann ist dein Grundstudium nicht rechtzeitig vor dem Praxissemester abgeschlossen.",
    ruleIds: ["DR-4", "DR-6"],
    officeIds: ["o-pa", "o-prakt"],
    actions: [
      {
        label: "Folgen-Check öffnen",
        href: "/entscheidung/e-stat-ws26",
      },
    ],
    followUpIds: ["A-03", "A-01"],
    resolver: "decisionSummary:e-stat-ws26",
    personalExample:
      "Voraussichtlich verschiebt sich dein Praxissemester auf das SS 2028 und dein Abschluss auf das SS 2029.",
  },
  {
    id: "A-03",
    question: "Was brauche ich für die Zulassung zum Praxissemester?",
    suggested: true,
    keywords: [
      "praxissemester",
      "praktisches studiensemester",
      "praktikum",
      "zulassung",
      "voraussetzung",
    ],
    shortAnswer:
      "**Alle Module des Grundstudiums (Fachsemester 1–3) müssen bestanden sein**, bevor das Praxissemester beginnt.",
    ruleIds: ["DR-6"],
    officeIds: ["o-prakt"],
    actions: [],
    followUpIds: ["A-02", "A-05"],
    resolver: "openFoundationModules",
    personalExample:
      "Offen sind noch Programmieren 2, Wirtschaftsprivatrecht und die fünf Module dieses Semesters.",
    details:
      "Den Antrag stellst du beim Praktikantenamt. Frist für das WS 2027/28: Fr, 14.05.2027.",
  },
  {
    id: "A-04",
    question: "Wie viele Versuche habe ich für eine Prüfung?",
    suggested: true,
    keywords: [
      "versuch",
      "versuche",
      "wiederholen",
      "wiederholung",
      "durchgefallen",
      "nicht bestanden",
    ],
    shortAnswer:
      "**Jede Prüfung kannst du höchstens dreimal ablegen.** Eine Abmeldung zählt nicht als Versuch.",
    ruleIds: ["DR-8"],
    officeIds: ["o-pa"],
    actions: [],
    followUpIds: ["A-01", "A-06"],
    resolver: "attemptsOverview",
    personalExample:
      "Wirtschaftsprivatrecht: Versuch 1 nicht bestanden – nächster Versuch im SS 2027 (Versuch 2 von 3).",
  },
  {
    id: "A-05",
    question:
      "Darf ich ins Hauptstudium, wenn noch Prüfungen aus dem Grundstudium offen sind?",
    suggested: true,
    keywords: ["hauptstudium", "grundstudium", "offene prüfungen", "vorziehen"],
    shortAnswer:
      "**Ja, solange höchstens drei Prüfungen des Grundstudiums offen sind.**",
    ruleIds: ["DR-7"],
    officeIds: ["o-pa"],
    actions: [],
    followUpIds: ["A-03"],
    resolver: "openFoundationAfterTerm",
    personalExample:
      "Nach diesem Semester wären bei dir zwei offen – vorausgesetzt, du bestehst alle angemeldeten Prüfungen.",
  },
  {
    id: "A-06",
    question: "Wie viele ECTS fehlen mir noch?",
    suggested: true,
    keywords: [
      "ects",
      "credits",
      "leistungspunkte",
      "punkte",
      "stand",
      "fehlen",
    ],
    shortAnswer:
      "**Du hast 48 von 210 ECTS.** Laut Regelverlauf wären nach zwei Semestern 60 vorgesehen – du liegst 12 ECTS zurück (Status: Knapp).",
    ruleIds: ["DR-1", "DR-2"],
    officeIds: [],
    actions: [
      {
        label: "Studienverlauf öffnen",
        href: "/verlauf",
      },
    ],
    followUpIds: ["A-03", "A-07"],
    resolver: "progressSummary",
  },
  {
    id: "A-07",
    question: "Wie wird mein Notenschnitt berechnet?",
    suggested: false,
    keywords: ["notenschnitt", "durchschnitt", "gesamtnote", "schnitt"],
    shortAnswer:
      "**Als nach ECTS gewichteter Durchschnitt deiner bestandenen Module**; berücksichtigt wird nur die erste Nachkommastelle, es wird nicht gerundet.",
    ruleIds: ["DR-9"],
    officeIds: ["o-pa"],
    actions: [],
    followUpIds: [],
    resolver: "gradeAverage",
    personalExample: "Dein aktueller Schnitt: 2,4 aus 8 Modulen (48 ECTS).",
  },
  {
    id: "A-08",
    question: "Wann wird Statistik angeboten?",
    suggested: false,
    keywords: [
      "angeboten",
      "angebot",
      "wintersemester",
      "sommersemester",
      "wann",
      "statistik",
    ],
    shortAnswer: "**Statistik wird nur im Wintersemester angeboten.**",
    ruleIds: ["DR-4"],
    officeIds: ["o-sd"],
    actions: [],
    followUpIds: [],
    personalExample:
      "Wenn du dieses Semester nicht antrittst, ist der nächste Termin im WS 2027/28.",
  },
  {
    id: "A-09",
    question: "An wen wende ich mich mit meiner Frage?",
    suggested: false,
    keywords: [
      "zuständig",
      "zuständige stelle",
      "an wen",
      "wende ich mich",
      "ansprechpartner",
      "ansprechperson",
      "anlaufstelle",
      "kontakt",
      "wer hilft",
    ],
    shortAnswer:
      "**Das hängt vom Thema ab:** Prüfungen, Fristen und Zulassungen klärt das Prüfungsamt, das Praxissemester das Praktikantenamt, deine Studienplanung die Studienberatung und Wahlpflichtmodule das Studiendekanat.",
    details:
      "Alle Stellen mit Zuständigkeiten, Kontakt und Sprechzeiten stehen unter Anlaufstellen. Bei Sonderfällen hilft „Anfrage vorbereiten“.",
    personalExample:
      "Unter Anlaufstellen findest du die passende Stelle mit Kontakt und Sprechzeiten.",
    ruleIds: [],
    citations: [
      {
        document: "Website der Hochschule, Seite „Ansprechpartner“",
        summary: "Zuständige Stellen nach Thema (Beispiel).",
        verified: false,
      },
    ],
    officeIds: ["o-pa", "o-prakt", "o-sb", "o-sd"],
    actions: [{ label: "Anlaufstellen öffnen", href: "/anlaufstellen" }],
    followUpIds: ["A-01", "A-03"],
  },
];
