import { createContext, use } from "react";
import type { ResolvedTheme, ThemePreference } from "@/lib/theme";

export interface ThemeContextValue {
  /** Stored choice: system, light or dark. */
  theme: ThemePreference;
  /** Theme currently shown; "system" resolved via prefers-color-scheme. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return context;
}
