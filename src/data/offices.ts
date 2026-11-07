import type { Office } from "@/domain/types";

// Zuständigkeiten nach StuPO § 4, § 16 und § 18; Kontakt und Sprechzeiten sind Beispiele.
export const offices: Office[] = [
  {
    id: "o-pa",
    name: "Zentrale Prüfungsverwaltung",
    email: "pruefungsverwaltung@hochschule.example",
    hours: "Mo–Do 9–12 Uhr",
    topics: [
      "An- und Abmeldung zu Prüfungen",
      "Rücktritt mit Attest",
      "Prüfungsversuche und Wiederholungsprüfungen",
      "Zulassung zu Prüfungen",
      "Leistungsnachweise und verbindliche Auskünfte",
    ],
  },
  {
    id: "o-pax",
    name: "Prüfungsausschuss der Fakultät",
    email: "pruefungsausschuss@hochschule.example",
    hours: "nach Vereinbarung",
    topics: [
      "Anerkennung und Anrechnung von Leistungen",
      "Zulassung und Verlängerung der Bachelorarbeit",
      "Ausnahmen zur Bachelorvorprüfung",
      "Nachteilsausgleich",
    ],
  },
  {
    id: "o-prakt",
    name: "Praktikantenamt",
    email: "praktikantenamt@hochschule.example",
    hours: "Di und Do 10–12 Uhr",
    topics: [
      "Zulassung zum Praxissemester",
      "Genehmigung und Anerkennung der Praxisstelle",
      "Praxisbericht",
    ],
  },
  {
    id: "o-sb",
    name: "Studienberatung",
    email: "studienberatung@hochschule.example",
    hours: "nach Vereinbarung",
    topics: [
      "Studienplanung",
      "Studieren mit Nebenjob",
      "Fragen zum Studienverlauf",
      "Studiengangwechsel",
    ],
  },
  {
    id: "o-sd",
    name: "Studiendekanat Informatik",
    email: "studiendekanat-informatik@hochschule.example",
    hours: "Mi 13–15 Uhr",
    topics: [
      "Wahlpflichtmodule und Studienarbeit",
      "Ausnahmen zum Unternehmensinformatikprojekt",
      "Fragen zu StuPO und Modulhandbuch",
      "Angebot der Module",
    ],
  },
];
