import type { ProfileName } from "@/domain/types";

export const PROFILE_NAME_MAX_LENGTH = 40;

/** Validate both form input and persisted state before showing a local profile name. */
export function parseProfileName(value: unknown): ProfileName | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("firstName" in value) ||
    !("lastName" in value)
  )
    return null;
  const { firstName, lastName } = value;
  if (typeof firstName !== "string" || typeof lastName !== "string")
    return null;
  const first = firstName.trim();
  const last = lastName.trim();
  return first &&
    last &&
    first.length <= PROFILE_NAME_MAX_LENGTH &&
    last.length <= PROFILE_NAME_MAX_LENGTH
    ? { firstName: first, lastName: last }
    : null;
}
