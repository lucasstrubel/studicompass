import type { AssistantFallback } from "@/domain/types";

export const assistantFallback: AssistantFallback = {
  id: "F-01",
  question:
    "Kann ich das Praxissemester im Ausland machen und Betriebswirtschaftslehre 3 im selben Semester schreiben?",
  answer:
    "Die StuPO erlaubt im Praxissemester höchstens zwei weitere Studien- oder Prüfungsleistungen, zu Prüfungen während eines Auslandsaufenthalts finde ich aber keine Regel. Das ist ein Sonderfall – verbindlich beantworten kann ihn das Praktikantenamt.",
  officeIds: ["o-prakt", "o-pa"],
  actionLabel: "Anfrage vorbereiten",
  draft:
    "Betreff: Praxissemester im Ausland und Prüfung Betriebswirtschaftslehre 3 im selben Semester\n\nGuten Tag, ich studiere Unternehmens- und Wirtschaftsinformatik im 3. Fachsemester (Matrikelnummer 3012458). Ich plane mein Praxissemester im WS 2027/28 im Ausland und müsste Betriebswirtschaftslehre 3 im selben Semester schreiben. Ist das möglich, und welche Regeln gelten dafür?\n\nViele Grüße\nNiklas Brandt",
};
