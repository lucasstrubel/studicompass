import type { AssistantEntry } from "./types";

/** Deterministic local matching; ambiguity never invents an answer. */
export function normalizeQuestion(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Questions about cases the rules do not settle; they go to an office, never to a catalog answer. */
export function isSpecialCase(question: string): boolean {
  return /\b(ausland|auslandssemester|sonderfall|haertefall)\b/.test(
    normalizeQuestion(question),
  );
}

/** Catalog entries by the number of their keywords found in the question, best first. */
function scoreEntries(normalized: string, catalog: AssistantEntry[]) {
  const padded = ` ${normalized} `;
  return catalog
    .map((entry) => ({
      id: entry.id,
      score: [...new Set(entry.keywords.map(normalizeQuestion))].filter(
        (keyword) => keyword && padded.includes(` ${keyword} `),
      ).length,
    }))
    .sort((a, b) => b.score - a.score);
}

export function matchAssistant(
  question: string,
  catalog: AssistantEntry[],
): string | null {
  const normalized = normalizeQuestion(question);
  if (!normalized || isSpecialCase(question)) return null;
  const exact = catalog.find(
    (entry) => normalizeQuestion(entry.question) === normalized,
  );
  if (exact) return exact.id;
  const scored = scoreEntries(normalized, catalog);
  return scored[0]?.score >= 2 && scored[0].score !== scored[1]?.score
    ? scored[0].id
    : null;
}

/**
 * Catalog questions that share a keyword with a question matchAssistant could not answer: offered as
 * "Meintest du …?", so an unclear question does not end in a dead end. Special cases get none.
 */
export function suggestQuestions(
  question: string,
  catalog: AssistantEntry[],
  limit = 3,
): string[] {
  const normalized = normalizeQuestion(question);
  if (!normalized || isSpecialCase(question)) return [];
  return scoreEntries(normalized, catalog)
    .filter((entry) => entry.score > 0)
    .slice(0, limit)
    .map((entry) => entry.id);
}
