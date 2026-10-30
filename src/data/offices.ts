import type { Office } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const offices: Office[] = [
  {
    id: "o-pa",
    name: "Prüfungsamt",
    email: "pruefungsamt@hochschule.example",
    hours: "Mo–Do 9–12 Uhr",
    topics: [
      "An- und Abmeldung zu Prüfungen",
      "Rücktritt mit Attest",
      "Prüfungsversuche",
      "Zulassung zu Prüfungen, Projektsemester und Bachelorarbeit",
      "Notenbescheinigungen",
    ],
  },
  {
    id: "o-prakt",
    name: "Praktikantenamt",
    email: "praktikantenamt@hochschule.example",
    hours: "Di und Do 10–12 Uhr",
    topics: [
      "Zulassung zum Praxissemester",
      "Suche und Anerkennung der Praxisstelle",
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
    name: "Studiendekanat Wirtschaftsinformatik",
    email: "studiendekanat-wi@hochschule.example",
    hours: "Mi 13–15 Uhr",
    topics: [
      "Wahlpflichtmodule",
      "Anerkennung von Leistungen",
      "Fragen zu SPO und Modulhandbuch",
      "Angebot der Module",
    ],
  },
];
