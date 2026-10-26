import type { Offering, Term } from "./types";

// SS precedes WS in the same calendar year (KONZEPT §10.2).
function termIndex(term: Term): number {
  return term.year * 2 + (term.season === "WS" ? 1 : 0);
}

/** The semester immediately after term (KONZEPT §10.2). */
export function next(term: Term): Term {
  return term.season === "WS"
    ? { season: "SS", year: term.year + 1 }
    : { season: "WS", year: term.year };
}

/** Negative, zero or positive when left is before, equal to or after right. */
export function compare(left: Term, right: Term): number {
  return Math.sign(termIndex(left) - termIndex(right));
}

/** One-based semester number relative to startTerm (KONZEPT §10.2).
 * Terms before the start yield zero or negative numbers.
 */
export function semesterNumber(term: Term, startTerm: Term): number {
  return termIndex(term) - termIndex(startTerm) + 1;
}

/** Display a semester as „WS 2026/27“ or „SS 2027“ (KONZEPT §10.2). */
export function format(term: Term): string {
  if (term.season === "SS") return `SS ${term.year}`;
  const followingYear = String((term.year + 1) % 100).padStart(2, "0");
  return `WS ${term.year}/${followingYear}`;
}

/** DR-4: earliest matching offering strictly after the given semester. */
export function nextOffering(term: Term, offering: Offering): Term {
  const following = next(term);
  return offering === "BOTH" || following.season === offering
    ? following
    : next(following);
}
