import type { DecisionHint } from "@/domain/types";

// Hinweise im Folgen-Check; Programmierung 2 wie Benachrichtigung n-01.
export const decisionHints: DecisionHint[] = [
  {
    examId: "e-pr2-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Programmierung 2 endet morgen um 23:59 Uhr. Ohne dieses Modul fehlt dir die Bachelorvorprüfung, die das Unternehmensinformatikprojekt im SS 2027 voraussetzt. Eine Abmeldung kann das Projekt um ein Jahr verschieben.",
      direct:
        "Morgen um 23:59 ist Schluss. Meldest du dich von Programmierung 2 ab, fehlt dir die Bachelorvorprüfung – das Unternehmensinformatikprojekt startet dann erst im SS 2028 und dein Abschluss rutscht voraussichtlich ein Semester nach hinten.",
    },
  },
  {
    examId: "e-dm-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Datenmanagement endet am Donnerstag um 23:59 Uhr. Das Modul wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027.",
      direct:
        "Bis Donnerstag, 23:59 kannst du dich noch abmelden. Datenmanagement gibt es jedes Semester – das kostet dich keinen Meilenstein, macht dein SS 2027 aber voller.",
    },
  },
  {
    examId: "e-web-ws26",
    text: {
      neutral:
        "Die Abmeldefrist für Webbasierte Systeme endet am Montag, 01.02., um 23:59 Uhr. Das Modul wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027.",
      direct:
        "Bis Montag, 23:59 hast du Zeit. Webbasierte Systeme gibt es jedes Semester – eine Abmeldung kostet dich keinen Meilenstein, macht dein SS 2027 aber voller.",
    },
  },
  {
    examId: "e-bwl2-ws26",
    text: {
      neutral:
        "Das ist deine Wiederholungsprüfung in Betriebswirtschaftslehre 2. Die Anmeldung erfolgt von Amts wegen, abmelden kannst du dich nur auf Antrag bei der Fakultät. Ohne dieses Modul fehlt dir die Bachelorvorprüfung für das Unternehmensinformatikprojekt.",
      direct:
        "Das ist dein zweiter Versuch in Betriebswirtschaftslehre 2. Du bist automatisch angemeldet, abmelden geht nur auf Antrag. Und ohne das Modul fehlt dir die Bachelorvorprüfung fürs Unternehmensinformatikprojekt.",
    },
  },
  {
    examId: "e-wi3-ws26",
    text: {
      neutral:
        "Wirtschaftsinformatik 3 wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027. Für das Unternehmensinformatikprojekt brauchst du die Prüfungsvorleistung dieses Moduls.",
      direct:
        "Wirtschaftsinformatik 3 gibt es jedes Semester – eine Abmeldung kostet dich keinen Meilenstein, macht dein SS 2027 aber voller. Die Pflichtübung brauchst du fürs Unternehmensinformatikprojekt trotzdem.",
    },
  },
];
