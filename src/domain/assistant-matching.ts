import type { AssistantEntry } from "./types";

/** KONZEPT §11: deterministic local matching; ambiguity never invents an answer. */
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

export function matchAssistant(
  question: string,
  catalog: AssistantEntry[],
): string | null {
  const normalized = normalizeQuestion(question);
  if (
    !normalized ||
    /\b(ausland|auslandssemester|sonderfall|haertefall)\b/.test(normalized)
  )
    return null;
  const exact = catalog.find(
    (entry) => normalizeQuestion(entry.question) === normalized,
  );
  if (exact) return exact.id;
  const padded = ` ${normalized} `;
  const scored = catalog
    .map((entry) => ({
      id: entry.id,
      score: [...new Set(entry.keywords.map(normalizeQuestion))].filter(
        (keyword) => keyword && padded.includes(` ${keyword} `),
      ).length,
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score >= 2 && scored[0].score !== scored[1]?.score
    ? scored[0].id
    : null;
}
