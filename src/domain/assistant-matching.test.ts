import { describe, expect, it } from "vitest";
import { assistantCatalog } from "@/data/assistant-catalog";
import { assistantFallback } from "@/data/assistant-fallback";
import { matchAssistant, normalizeQuestion } from "./assistant-matching";

describe("KONZEPT §11: lokale Fragenzuordnung", () => {
  it.each(assistantCatalog)("erkennt die Originalfrage $id", (entry) => {
    expect(matchAssistant(entry.question, assistantCatalog)).toBe(entry.id);
    expect(matchAssistant(entry.question.toUpperCase(), assistantCatalog)).toBe(
      entry.id,
    );
  });
  it("normalisiert Umlaute, ß und Satzzeichen", () => {
    expect(normalizeQuestion(" ÄÖÜ ß, Prüfung?! ")).toBe("aeoeue ss pruefung");
  });
  it("erkennt Synonyme und fällt bei Unklarheit zurück", () => {
    expect(matchAssistant("Statistik später schreiben", assistantCatalog)).toBe(
      "A-02",
    );
    expect(matchAssistant("Hauptstudium vorziehen", assistantCatalog)).toBe(
      "A-05",
    );
    expect(matchAssistant("Pizza", assistantCatalog)).toBeNull();
    expect(matchAssistant("", assistantCatalog)).toBeNull();
    expect(matchAssistant("Wann", assistantCatalog)).toBeNull();
    expect(
      matchAssistant(assistantFallback.question, assistantCatalog),
    ).toBeNull();
    expect(
      matchAssistant("Statistik im Ausland abmelden", assistantCatalog),
    ).toBeNull();
  });
  it("rät bei gleich hohen Punktzahlen nicht", () => {
    const entries = assistantCatalog
      .slice(0, 2)
      .map((entry) => ({ ...entry, keywords: ["eins", "zwei"] }));
    expect(matchAssistant("eins zwei", entries)).toBeNull();
  });
});
