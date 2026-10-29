/**
 * A web address Niklas typed for a course link (P5-12): only http and https, so a link never runs
 * script or opens other protocols. Returns the normalised address or null.
 */
export function parseWebUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
