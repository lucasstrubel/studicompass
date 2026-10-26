import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
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

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(SYSTEM_DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function systemPrefersDark() {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

/**
 * Theme preference System/Hell/Dunkel (US-19). The inline script in index.html has already set the class
 * before the first render; from here on this provider keeps it in sync, including system changes.
 * In P2-05 the store takes over theme and setTheme (see readStoredTheme in src/lib/theme.ts).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    systemPrefersDark,
  );
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
