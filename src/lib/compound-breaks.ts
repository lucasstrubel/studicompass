/** Heads of German compounds in module titles; a line may break before them (P5-10). */
const HEADS = [
  "informatik",
  "management",
  "prozess",
  "rechnung",
  "wesen",
  "netze",
  "systeme",
  "privat",
  "recht",
  "planspiel",
  "semester",
  "arbeit",
  "modul",
];
// A joint: a lowercase letter directly followed by one of the heads.
const PATTERN = new RegExp(String.raw`(?<=\p{Ll})(?=${HEADS.join("|")})`, "u");

/**
 * Splits long compounds such as "Wirtschaftsinformatik" at their joints, so narrow planner columns
 * break between word parts instead of before the last letter. Browsers hyphenate German only with a
 * downloaded dictionary, so this gives them reliable break opportunities.
 */
export function compoundParts(text: string): string[] {
  return text.split(PATTERN);
}
