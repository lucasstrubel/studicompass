import type { Citation, Rule } from "@/domain/types";

/** Studien- und Prüfungsordnung, nichtamtliche Lesefassung; verbindlich sind die Originalfassungen. */
const STUPO = "StuPO Bachelor (ab 01.09.2026)";

function stupo(section: string, summary: string): Citation {
  return { document: STUPO, section, summary, verified: true };
}

/** Eigene Rechenregel der App: keine Vorgabe der Hochschule, deshalb mit dem Label „Beispiel“. */
function ownRule(summary: string): Citation {
  return {
    document: "StudiCompass – Berechnungsregel",
    summary,
    verified: false,
  };
}

const rule = (
  id: string,
  citation: Citation,
  officeId?: string,
  params: Rule["params"] = {},
): Rule => ({
  id,
  title: citation.summary,
  citation,
  ...(officeId ? { officeId } : {}),
  params,
});

export const rules: Rule[] = [
  rule(
    "DR-1",
    stupo(
      "§ 13 Abs. 1",
      "Zu deinen ECTS zählen nur bestandene Modulprüfungen, also mindestens „ausreichend“ (4,0).",
    ),
    "o-pa",
  ),
  rule(
    "DR-2",
    stupo(
      "§ 3 Abs. 5, § 56",
      "Für den Abschluss brauchst du 210 ECTS. Der Regelstudienplan sieht 30 ECTS pro Semester vor.",
    ),
    "o-sd",
  ),
  rule(
    "DR-3",
    ownRule(
      "Bis 6 ECTS im Plan, 7–23 knapp, ab 24 kritisch; verschobene Meilensteine sind kritisch.",
    ),
    undefined,
    { onTrackMaxDeficit: 6, criticalMinDeficit: 24 },
  ),
  rule(
    "DR-4",
    {
      document: "Modulhandbuch UIB",
      summary:
        "Das Modulhandbuch legt fest, wie oft ein Modul angeboten wird: jedes Semester oder nur im Winter oder Sommer.",
      verified: true,
    },
    "o-sd",
  ),
  rule(
    "DR-5",
    stupo(
      "§ 7 Abs. 2, § 12 Abs. 1",
      "Bei Erstversuchen kannst du dich bis zum Tag vor der Prüfung abmelden. Das zählt nicht als Versuch. Wer danach ohne triftigen Grund fehlt, erhält die Note 5,0.",
    ),
    "o-pa",
  ),
  rule(
    "DR-6",
    stupo(
      "§ 56 Abs. 4",
      "Für das Praktische Studiensemester brauchst du die abgeschlossene Bachelorvorprüfung und mindestens 30 ECTS aus dem Hauptstudium. Die Praktikantenamtsleitung kann eine Ausnahme genehmigen.",
    ),
    "o-prakt",
  ),
  rule(
    "DR-7",
    stupo(
      "§ 24 Abs. 1",
      "Prüfungen des Hauptstudiums darfst du ablegen, wenn zur Bachelorvorprüfung höchstens drei Prüfungsleistungen fehlen. Weitere Ausnahmen genehmigt der Prüfungsausschuss.",
    ),
    "o-pa",
    { maxOpenFoundation: 3 },
  ),
  rule(
    "DR-8",
    stupo(
      "§ 14 Abs. 2 und 6",
      "Eine nicht bestandene Prüfung kannst du zweimal wiederholen, also höchstens dreimal ablegen. Ein Viertversuch ist nicht möglich.",
    ),
    "o-pa",
    { maxAttempts: 3 },
  ),
  rule(
    "DR-9",
    stupo(
      "§ 11 Abs. 4 und 7, § 28 Abs. 1",
      "Dein Notenschnitt ist nach ECTS gewichtet; es zählt nur die erste Nachkommastelle, ohne Rundung. In die Gesamtnote der Bachelorprüfung fließt das Grundstudium nicht ein.",
    ),
    "o-pa",
  ),
  rule(
    "DR-10",
    ownRule(
      "Bei mehr als 36 geplanten ECTS zeigt StudiCompass einen Belastungshinweis mit Nebenjob-Stunden.",
    ),
    undefined,
    { maxRegularLoad: 36 },
  ),
  rule(
    "DR-11",
    stupo(
      "§ 56 Abs. 2",
      "Für das Unternehmensinformatikprojekt brauchst du die abgeschlossene Bachelorvorprüfung und die Prüfungsvorleistungen von Datenmanagement, Webbasierte Systeme und Wirtschaftsinformatik 3. Der Studiendekan kann eine Ausnahme genehmigen.",
    ),
    "o-sd",
  ),
  rule(
    "DR-12",
    stupo(
      "§ 24 Abs. 2, § 26 Abs. 1 und 4",
      "Die Bachelorarbeit setzt das Praktische Studiensemester und alle Leistungen der ersten fünf Semester voraus; mit 150 ECTS ist eine Zulassung auf Antrag möglich. Das Thema gibt es frühestens im sechsten Semester.",
    ),
    "o-pax",
  ),
  rule(
    "DR-13",
    stupo(
      "§ 56 Abs. 1",
      "In allen Modulen muss die Prüfungsvorleistung erbracht sein, bevor du die Modulprüfung ablegst.",
    ),
    "o-pa",
  ),
  rule(
    "DR-14",
    stupo(
      "§ 6 Abs. 1–3",
      "Die Prüfungen der Bachelorvorprüfung sollen bis zum Ende des zweiten Semesters abgelegt sein. Spätestens zwei Semester danach erlischt der Prüfungsanspruch, außer du hast die Überschreitung nicht zu vertreten oder eine Studienzeitverlängerung beantragt.",
    ),
    "o-pa",
  ),
  rule(
    "DR-15",
    stupo(
      "§ 14 Abs. 1 und 3",
      "Wiederholungen in Pflichtmodulen legst du im folgenden Prüfungszeitraum ab. Die Anmeldung erfolgt von Amts wegen, abmelden kannst du dich nur auf Antrag bei der Fakultät. Versäumst du die Frist, erlischt der Prüfungsanspruch.",
    ),
    "o-pa",
  ),
  rule(
    "DR-16",
    stupo(
      "§ 12 Abs. 1 und 2",
      "Nach der Abmeldefrist brauchst du für einen Rücktritt einen triftigen Grund. Du musst ihn unverzüglich schriftlich anzeigen, bei Krankheit mit ärztlichem Attest.",
    ),
    "o-pa",
  ),
];
