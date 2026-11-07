import type { Notification } from "@/domain/types";

// Beispieldaten; die Aussagen zu Fristen und Folgen stützen sich auf die StuPO.
export const notifications: Notification[] = [
  {
    id: "n-01",
    createdAt: "2027-01-25T18:00:00+01:00",
    type: "decision",
    href: "/entscheidung/e-pr2-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Programmierung 2 endet morgen um 23:59 Uhr. Ohne dieses Modul fehlt dir die Bachelorvorprüfung, die das Unternehmensinformatikprojekt im SS 2027 voraussetzt. Eine Abmeldung kann das Projekt um ein Jahr verschieben.",
      direct:
        "Morgen um 23:59 ist Schluss. Meldest du dich von Programmierung 2 ab, fehlt dir die Bachelorvorprüfung – das Unternehmensinformatikprojekt startet dann erst im SS 2028 und dein Abschluss rutscht voraussichtlich ein Semester nach hinten.",
    },
    simulatedText: {
      neutral:
        "Abmeldung simuliert. Deine Übersicht und dein Studienverlauf zeigen bereits die aktualisierte Prognose.",
      direct:
        "Abmeldung simuliert – Übersicht und Studienverlauf zeigen schon deine neue Prognose.",
    },
    read: false,
    ruleIds: ["DR-4", "DR-5", "DR-11"],
  },
  {
    id: "n-02",
    createdAt: "2027-01-22T14:05:00+01:00",
    type: "inbox",
    href: "/postfach?eintrag=i-02",
    text: {
      neutral:
        "Raumänderung: Die Klausur Programmierung 2 findet in Raum A 210 statt.",
      direct:
        "Neuer Raum: Programmierung 2 schreibst du in A 210, nicht in B 104.",
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
        "Für das Unternehmensinformatikprojekt im SS 2027 fehlen dir noch 2 Module des Grundstudiums; beide sind in diesem Semester angemeldet.",
      direct:
        "Unternehmensinformatikprojekt im Sommer? Dann müssen Programmierung 2 und Betriebswirtschaftslehre 2 in diesem Semester klappen.",
    },
    simulatedText: {
      neutral:
        "Dein Studienstand hat sich durch die Simulation geändert. Prüfe die aktualisierte Prognose und die noch offenen Module im Studienverlauf.",
      direct:
        "Durch die Simulation verschiebt sich dein Plan. Schau dir die neue Prognose und die offenen Module im Studienverlauf an.",
    },
    read: false,
    ruleIds: ["DR-11"],
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
