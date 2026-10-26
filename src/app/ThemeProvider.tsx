import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext } from "@/app/theme-context";
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  SYSTEM_DARK_QUERY,
  writeStoredTheme,
  type ThemePreference,
} from "@/lib/theme";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Theme preference System/Hell/Dunkel (US-19). The inline script in index.html has already set the class
 * before the first render; from here on this provider keeps it in sync, including system changes.
 * In P2-05 the store takes over theme and setTheme (see readStoredTheme in src/lib/theme.ts).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);
  const systemDark = useMediaQuery(SYSTEM_DARK_QUERY);
  const resolvedTheme = resolveTheme(theme, systemDark);

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    writeStoredTheme(next);
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
