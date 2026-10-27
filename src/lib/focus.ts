/**
 * Moves the keyboard focus to the main content (`<main id="inhalt">`, also the skip link's target). Used
 * when the focused control disappears with its action, e.g. "Rückgängig" in a notice (P3-06 review).
 */
export function focusMainContent() {
  document.getElementById("inhalt")?.focus();
}
