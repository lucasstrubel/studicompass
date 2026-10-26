import type { AssistantFallback } from "@/domain/types";

// Beispieldaten aus docs/INHALTE.md; fachlich noch nicht verifiziert.
export const assistantFallback: AssistantFallback = {
  id: "F-01",
  question:
    "Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?",
  answer:
    "Dazu finde ich in SPO und Modulhandbuch keine eindeutige Regel. Das ist ein Sonderfall – verbindlich beantworten kann ihn das Praktikantenamt.",
  officeIds: ["o-prakt", "o-pa"],
  actionLabel: "Anfrage vorbereiten",
  draft:
    "Betreff: Praxissemester im Ausland und Prüfung Statistik im selben Semester\n\nGuten Tag, ich studiere Wirtschaftsinformatik im 3. Fachsemester (Matrikelnummer 3012458). Ich plane mein Praxissemester im WS 2027/28 im Ausland und müsste Statistik im selben Semester schreiben. Ist das möglich, und welche Regeln gelten dafür?\n\nViele Grüße\nNiklas Brandt",
};
