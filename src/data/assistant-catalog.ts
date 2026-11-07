import type { AssistantEntry } from "@/domain/types";

// Regelaussagen aus der StuPO, persönliche Beispiele aus den Demodaten von Niklas.
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
      "**Bei Erstversuchen bis zum Tag vor der Prüfung**, im POS. Wiederholungsprüfungen und Continuous Assessments kannst du nur auf Antrag abmelden.",
    ruleIds: ["DR-5", "DR-15"],
    officeIds: ["o-pa"],
    actions: [
      {
        label: "Folgen-Check für Programmierung 2 öffnen",
        href: "/entscheidung/e-pr2-ws26",
      },
    ],
    followUpIds: ["A-02", "A-11"],
    resolver: "nextWithdrawalDeadline",
    personalExample:
      "Für Programmierung 2 heißt das: bis morgen, Di 26.01., 23:59 Uhr.",
    details:
      "Eine Abmeldung zählt nicht als Prüfungsversuch. Nach Ablauf der Frist ist ein Rücktritt nur noch aus triftigem Grund möglich, zum Beispiel mit ärztlichem Attest.",
  },
  {
    id: "A-02",
    question: "Was passiert, wenn ich Programmierung 2 schiebe?",
    suggested: true,
    keywords: [
      "programmierung 2",
      "pr2",
      "schieben",
      "verschieben",
      "abmelden",
      "später schreiben",
      "nicht schreiben",
    ],
    shortAnswer:
      "**Die Bachelorvorprüfung ist dann im SS 2027 noch offen.** Das Unternehmensinformatikprojekt setzt sie voraus und läuft nur im Sommersemester, startet also erst im SS 2028.",
    ruleIds: ["DR-11", "DR-4"],
    officeIds: ["o-sd", "o-pa"],
    actions: [
      {
        label: "Folgen-Check öffnen",
        href: "/entscheidung/e-pr2-ws26",
      },
    ],
    followUpIds: ["A-03", "A-01"],
    resolver: "decisionSummary:e-pr2-ws26",
    personalExample:
      "Voraussichtlich verschiebt sich dein Unternehmensinformatikprojekt auf das SS 2028 und dein Abschluss auf das SS 2029.",
    details:
      "Der Studiendekan kann eine Ausnahme genehmigen. Laut Modulhandbuch werden fehlende Voraussetzungen in der ersten Vorlesungswoche individuell geprüft.",
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
      "**Die abgeschlossene Bachelorvorprüfung und mindestens 30 ECTS aus dem Hauptstudium.** Die Praktikantenamtsleitung kann eine Ausnahme genehmigen.",
    ruleIds: ["DR-6"],
    officeIds: ["o-prakt"],
    actions: [],
    followUpIds: ["A-02", "A-05"],
    resolver: "openFoundationModules",
    personalExample:
      "Offen sind noch Programmierung 2 und Betriebswirtschaftslehre 2.",
    details:
      "Den Platz suchst du dir selbst, das Praktikantenamt genehmigt die Stelle. Es sind 100 Arbeitstage in Vollzeit, in der Regel im fünften Semester.",
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
      "**Drei: Eine nicht bestandene Prüfung kannst du zweimal wiederholen.** Die Abmeldung vom Erstversuch zählt nicht als Versuch.",
    ruleIds: ["DR-8", "DR-15"],
    officeIds: ["o-pa"],
    actions: [],
    followUpIds: ["A-01", "A-06"],
    resolver: "attemptsOverview",
    personalExample:
      "Betriebswirtschaftslehre 2: Versuch 1 nicht bestanden, die Wiederholung (Versuch 2 von 3) ist in diesem Prüfungszeitraum angemeldet.",
    details:
      "Wiederholungen in Pflichtmodulen legst du im folgenden Prüfungszeitraum ab, die Anmeldung erfolgt von Amts wegen. Für den Drittversuch empfiehlt die Prüfungsverwaltung eine Studienfachberatung, nachweisen musst du sie seit dem WS 2026/27 nicht mehr.",
  },
  {
    id: "A-05",
    question:
      "Darf ich ins Hauptstudium, wenn noch Prüfungen aus dem Grundstudium offen sind?",
    suggested: true,
    keywords: [
      "hauptstudium",
      "grundstudium",
      "offene prüfungen",
      "vorziehen",
      "bachelorvorprüfung",
    ],
    shortAnswer:
      "**Ja, solange zur Bachelorvorprüfung höchstens drei Prüfungsleistungen fehlen.** Weitere Ausnahmen genehmigt der Prüfungsausschuss.",
    ruleIds: ["DR-7"],
    officeIds: ["o-pax"],
    actions: [],
    followUpIds: ["A-03", "A-10"],
    resolver: "openFoundationAfterTerm",
    personalExample:
      "Nach diesem Semester wären bei dir keine mehr offen – vorausgesetzt, du bestehst alle angemeldeten Prüfungen.",
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
      "**Du hast 45 von 210 ECTS.** Laut Regelstudienplan wären nach zwei Semestern 60 vorgesehen – du liegst 15 ECTS zurück (Status: Knapp).",
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
    personalExample: "Dein aktueller Schnitt: 2,3 aus 8 Modulen (45 ECTS).",
    details:
      "In die Gesamtnote der Bachelorprüfung zählen nur die Module des Hauptstudiums und die Bachelorarbeit. Die Bachelorvorprüfung hat eine eigene Gesamtnote.",
  },
  {
    id: "A-08",
    question: "Wann wird Programmierung 2 angeboten?",
    suggested: false,
    keywords: [
      "angeboten",
      "angebot",
      "wintersemester",
      "sommersemester",
      "wann",
      "häufigkeit",
    ],
    shortAnswer:
      "**Programmierung 2 wird jedes Semester angeboten.** Nur im Sommer laufen zum Beispiel Wirtschaftsinformatik 2, Betriebswirtschaftslehre 2 und das Unternehmensinformatikprojekt.",
    ruleIds: ["DR-4"],
    officeIds: ["o-sd"],
    actions: [],
    followUpIds: [],
    personalExample:
      "Wenn du dieses Semester nicht antrittst, ist der nächste Termin im SS 2027.",
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
      "**Das hängt vom Thema ab:** An- und Abmeldungen und Rücktritte klärt die Zentrale Prüfungsverwaltung, Anerkennungen und Ausnahmen der Prüfungsausschuss, das Praxissemester das Praktikantenamt, deine Studienplanung die Studienberatung und Wahlpflichtmodule das Studiendekanat.",
    details:
      "Alle Stellen mit Zuständigkeiten, Kontakt und Sprechzeiten stehen unter Anlaufstellen. Bei Sonderfällen hilft „Anfrage vorbereiten“.",
    personalExample:
      "Unter Anlaufstellen findest du die passende Stelle mit Kontakt und Sprechzeiten.",
    ruleIds: [],
    citations: [
      {
        document: "StuPO Bachelor (ab 01.09.2026)",
        section: "§ 16, § 18",
        summary:
          "Zuständigkeiten von Prüfungsausschuss und Prüfungsverwaltung.",
        verified: true,
      },
    ],
    officeIds: ["o-pa", "o-pax", "o-prakt", "o-sb", "o-sd"],
    actions: [{ label: "Anlaufstellen öffnen", href: "/anlaufstellen" }],
    followUpIds: ["A-01", "A-03"],
  },
  {
    id: "A-10",
    question: "Bis wann muss die Bachelorvorprüfung geschafft sein?",
    suggested: false,
    keywords: ["frist", "bachelorvorprüfung", "vorprüfung", "prüfungsanspruch"],
    shortAnswer:
      "**Geplant bis zum Ende des zweiten Semesters, spätestens bis zum Ende des vierten.** Danach erlischt der Prüfungsanspruch, außer du hast die Überschreitung nicht zu vertreten.",
    ruleIds: ["DR-14"],
    officeIds: ["o-pa"],
    actions: [],
    followUpIds: ["A-05"],
    resolver: "openFoundationModules",
    personalExample:
      "Offen sind noch Programmierung 2 und Betriebswirtschaftslehre 2.",
    details:
      "Bei einer Überschreitung stellst du fristgerecht einen Antrag auf Studienzeitverlängerung. Die Prüfungsverwaltung informiert dich mindestens zwei Wochen vor Fristende.",
  },
  {
    id: "A-11",
    question: "Was gilt, wenn ich krank bin und nicht zur Prüfung kann?",
    suggested: false,
    keywords: ["krank", "attest", "rücktritt", "versäumt", "triftiger grund"],
    shortAnswer:
      "**Zeige den Grund unverzüglich schriftlich an und lege bei Krankheit ein ärztliches Attest vor.** Ohne triftigen Grund gilt die Prüfung als nicht bestanden (5,0).",
    ruleIds: ["DR-16"],
    officeIds: ["o-pa"],
    actions: [],
    followUpIds: ["A-01"],
    personalExample:
      "Aus dem Attest muss hervorgehen, woraus sich die Prüfungsunfähigkeit ergibt.",
  },
  {
    id: "A-12",
    question: "Wann darf ich mit der Bachelorarbeit anfangen?",
    suggested: false,
    keywords: ["bachelorarbeit", "thesis", "abschlussarbeit", "thema"],
    shortAnswer:
      "**Frühestens im sechsten Semester, nach dem Praktischen Studiensemester und mit allen Leistungen der ersten fünf Semester.** Mit 150 ECTS ist eine Zulassung auf Antrag möglich.",
    ruleIds: ["DR-12"],
    officeIds: ["o-pax"],
    actions: [],
    followUpIds: ["A-03"],
    personalExample:
      "Die Bearbeitungszeit beträgt drei Monate und lässt sich auf Antrag um höchstens zwei Monate verlängern.",
  },
];
