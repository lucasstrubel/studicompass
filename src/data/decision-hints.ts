import type { DecisionHint } from "@/domain/types";

// Beispieltexte aus docs/INHALTE.md §9 („Hinweise im Folgen-Check“); Statistik wie Benachrichtigung n-01.
export const decisionHints: DecisionHint[] = [
  {
    examId: "e-stat-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Statistik endet morgen um 23:59 Uhr. Statistik wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben.",
      direct:
        "Morgen um 23:59 ist Schluss. Meldest du dich von Statistik ab, gibt es das Modul erst im nächsten Winter – und dein Praxissemester rutscht voraussichtlich ein Semester nach hinten.",
    },
  },
  {
    examId: "e-db-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Datenbanken endet am Donnerstag um 23:59 Uhr. Datenbanken wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben.",
      direct:
        "Bis Donnerstag, 23:59 kannst du dich noch abmelden. Tust du es, gibt es Datenbanken erst im nächsten Winter – und dein Praxissemester rutscht voraussichtlich ein Semester nach hinten.",
    },
  },
  {
    examId: "e-se1-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Software Engineering 1 endet am Montag, 01.02., um 23:59 Uhr. Das Modul wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben.",
      direct:
        "Bis Montag, 23:59 hast du Zeit. Meldest du dich von Software Engineering 1 ab, kommt das Modul erst im nächsten Winter wieder – und dein Praxissemester rutscht voraussichtlich mit.",
    },
  },
  {
    examId: "e-gpm-ws26",
    text: {
      neutral:
        "Geschäftsprozessmanagement wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027.",
      direct:
        "Geschäftsprozessmanagement gibt es jedes Semester – eine Abmeldung kostet dich keinen Meilenstein, macht dein SS 2027 aber voller.",
    },
  },
  {
    examId: "e-mkt-ws26",
    text: {
      neutral:
        "Marketing wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027.",
      direct:
        "Marketing gibt es jedes Semester – eine Abmeldung kostet dich keinen Meilenstein, macht dein SS 2027 aber voller.",
    },
  },
];
