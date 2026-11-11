import { describe, expect, it } from "vitest";
import { assistantCatalog } from "@/data/assistant-catalog";
import { assistantFallback } from "@/data/assistant-fallback";
import {
  isSpecialCase,
  matchAssistant,
  normalizeQuestion,
  suggestQuestions,
} from "./assistant-matching";

describe("lokale Fragenzuordnung", () => {
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
    expect(
      matchAssistant("Programmierung 2 später schreiben", assistantCatalog),
    ).toBe("A-02");
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
      matchAssistant("Programmierung 2 im Ausland abmelden", assistantCatalog),
    ).toBeNull();
  });
  it("rät bei gleich hohen Punktzahlen nicht", () => {
    const entries = assistantCatalog
      .slice(0, 2)
      .map((entry) => ({ ...entry, keywords: ["eins", "zwei"] }));
    expect(matchAssistant("eins zwei", entries)).toBeNull();
  });
});

describe("Vorschläge bei Fragen ohne eindeutige Antwort", () => {
  it("bietet die Katalogfragen mit gemeinsamem Stichwort an, die beste zuerst", () => {
    // "abmelden" alone fits two entries equally, so matchAssistant does not guess.
    expect(
      matchAssistant("Kann ich mich abmelden?", assistantCatalog),
    ).toBeNull();
    const ids = suggestQuestions("Kann ich mich abmelden?", assistantCatalog);
    expect(ids).toContain("A-01");
    expect(ids).toContain("A-02");
    expect(ids.length).toBeLessThanOrEqual(3);
  });
  it("schlägt nichts vor, wenn kein Stichwort passt", () => {
    expect(suggestQuestions("Pizza", assistantCatalog)).toEqual([]);
    expect(suggestQuestions("", assistantCatalog)).toEqual([]);
  });
  it("schlägt bei Sonderfällen nichts vor: die gehen an eine Stelle", () => {
    expect(isSpecialCase("Programmierung 2 im Ausland abmelden")).toBe(true);
    expect(
      suggestQuestions(
        "Programmierung 2 im Ausland abmelden",
        assistantCatalog,
      ),
    ).toEqual([]);
    expect(isSpecialCase("Kann ich mich abmelden?")).toBe(false);
  });
});
