import { THEME_STORAGE_KEY } from "@/config/demo";

/** The user's choice in the settings (KONZEPT S9): follow the system, or always light or dark. */
export type ThemePreference = "system" | "light" | "dark";
/** The theme actually shown. */
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = [
  "system",
  "light",
  "dark",
];

export const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value);
}

/** The inline script in index.html applies the same rule before the first render. */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

// readStoredTheme and writeStoredTheme are the only code that touches the stored theme; the store takes
// them over in P2-05 (setTheme), so the preference keeps a single storage location.

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    // Storage blocked (e.g. by privacy settings): follow the system.
    return "system";
  }
}

export function writeStoredTheme(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked: the choice applies until the page is reloaded.
  }
}

/** Dark tokens apply under the class "dark" on <html> (globals.css), portals included. */
export function applyTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
