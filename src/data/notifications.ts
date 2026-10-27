import type { Notification } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const notifications: Notification[] = [
  {
    id: "n-01",
    createdAt: "2027-01-25T18:00:00+01:00",
    type: "decision",
    href: "/entscheidung/e-stat-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Statistik endet morgen um 23:59 Uhr. Statistik wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben.",
      direct:
        "Morgen um 23:59 ist Schluss. Meldest du dich von Statistik ab, gibt es das Modul erst im nächsten Winter – und dein Praxissemester rutscht voraussichtlich ein Semester nach hinten.",
    },
    simulatedText: {
      neutral:
        "Abmeldung simuliert. Deine Übersicht und dein Studienverlauf zeigen bereits die aktualisierte Prognose.",
      direct:
        "Abmeldung simuliert – Übersicht und Studienverlauf zeigen schon deine neue Prognose.",
    },
    read: false,
    ruleIds: ["DR-4", "DR-5", "DR-6"],
  },
  {
    id: "n-02",
    createdAt: "2027-01-22T14:05:00+01:00",
    type: "inbox",
    href: "/postfach?eintrag=i-02",
    text: {
      neutral:
        "Raumänderung: Die Klausur Statistik findet in Raum A 210 statt.",
      direct: "Neuer Raum: Statistik schreibst du in A 210, nicht in B 104.",
    },
    read: false,
    ruleIds: [],
  },
  {
    id: "n-03",
    createdAt: "2027-01-22T09:30:00+01:00",
    type: "milestone",
    href: "/verlauf",
    text: {
      neutral:
        "Für das Praxissemester im WS 2027/28 fehlen dir noch 7 Module des Grundstudiums; 5 davon sind in diesem Semester angemeldet.",
      direct:
        "Praxissemester im Winter? Dann müssen Programmieren 2 und Wirtschaftsprivatrecht im Sommer klappen – plus alles aus diesem Semester.",
    },
    simulatedText: {
      neutral:
        "Dein Studienstand hat sich durch die Simulation geändert. Prüfe die aktualisierte Prognose und die noch offenen Module im Studienverlauf.",
      direct:
        "Durch die Simulation verschiebt sich dein Plan. Schau dir die neue Prognose und die offenen Module im Studienverlauf an.",
    },
    read: false,
    ruleIds: ["DR-6"],
  },
  {
    id: "n-04",
    createdAt: "2027-01-20T08:00:00+01:00",
    type: "deadline",
    href: "/fristen",
    text: {
      neutral: "Die Rückmeldung zum SS 2027 ist bis 15.02. möglich.",
      direct: "Rückmeldung bis 15.02. nicht vergessen – dauert zwei Minuten.",
    },
    read: false,
    ruleIds: [],
  },
];
