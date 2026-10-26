import type { Office } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const offices: Office[] = [
  {
    id: "o-pa",
    name: "Prüfungsamt",
    email: "pruefungsamt@hochschule.example",
    hours: "Mo–Do 9–12 Uhr",
  },
  {
    id: "o-prakt",
    name: "Praktikantenamt",
    email: "praktikantenamt@hochschule.example",
    hours: "Di und Do 10–12 Uhr",
  },
  {
    id: "o-sb",
    name: "Studienberatung",
    email: "studienberatung@hochschule.example",
    hours: "nach Vereinbarung",
  },
  {
    id: "o-sd",
    name: "Studiendekanat Wirtschaftsinformatik",
    email: "studiendekanat-wi@hochschule.example",
    hours: "Mi 13–15 Uhr",
  },
];
