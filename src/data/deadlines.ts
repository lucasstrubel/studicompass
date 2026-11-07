import type { Deadline } from "@/domain/types";

// Beispieldaten: Termine erfunden; die Abmeldefrist entspricht StuPO § 7 Abs. 2 (Tag vor der Prüfung).
export const deadlines: Deadline[] = [
  {
    id: "d-pr2-abm",
    title: "Abmeldung Programmierung 2",
    dueAt: "2027-01-26T23:59:00+01:00",
    type: "Abmeldung",
    channel: "pos",
    examId: "e-pr2-ws26",
  },
  {
    id: "d-dm-abm",
    title: "Abmeldung Datenmanagement",
    dueAt: "2027-01-28T23:59:00+01:00",
    type: "Abmeldung",
    channel: "pos",
    examId: "e-dm-ws26",
  },
  {
    id: "d-wi3-ue5",
    title: "Abgabe Pflichtübung 5 Wirtschaftsinformatik 3",
    dueAt: "2027-01-31T23:59:00+01:00",
    type: "Abgabe",
    channel: "moodle",
    moduleId: "m-wi3",
  },
  {
    id: "d-web-abm",
    title: "Abmeldung Webbasierte Systeme",
    dueAt: "2027-02-01T23:59:00+01:00",
    type: "Abmeldung",
    channel: "pos",
    examId: "e-web-ws26",
  },
  {
    id: "d-wi3-abm",
    title: "Abmeldung Wirtschaftsinformatik 3",
    dueAt: "2027-02-07T23:59:00+01:00",
    type: "Abmeldung",
    channel: "pos",
    examId: "e-wi3-ws26",
  },
  {
    id: "d-praxis-info",
    title: "Infoveranstaltung Praxissemester WS 2027/28",
    dueAt: "2027-02-10T14:00:00+01:00",
    type: "Termin",
    channel: "mail",
  },
  {
    id: "d-rueck",
    title: "Rückmeldung zum SS 2027",
    dueAt: "2027-02-15",
    type: "Rückmeldung",
    channel: "website",
  },
  {
    id: "d-pruef-ss27",
    title: "Prüfungsanmeldung SS 2027",
    dueAt: "2027-05-24",
    type: "Anmeldung",
    channel: "pos",
    startsAt: "2027-05-10",
  },
  {
    id: "d-praxis-antrag",
    title: "Antrag auf Zulassung zum Praxissemester WS 2027/28",
    dueAt: "2027-05-14",
    type: "Antrag",
    channel: "website",
  },
];
