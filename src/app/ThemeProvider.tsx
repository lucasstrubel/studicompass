import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { ThemeContext } from "@/app/theme-context";
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  SYSTEM_DARK_QUERY,
} from "@/lib/theme";
import { useMediaQuery } from "@/lib/use-media-query";
import { demoStore } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";

/**
 * Theme preference System/Hell/Dunkel (US-19). The inline script in index.html has already set the class
 * before the first render; from here on this provider keeps it in sync, including system changes.
 * The store owns the preference; the dedicated theme storage key also survives demo resets.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useDemoStore((state) => state.theme);
  const setTheme = useDemoStore((state) => state.setTheme);
  const systemDark = useMediaQuery(SYSTEM_DARK_QUERY);
  const resolvedTheme = resolveTheme(theme, systemDark);

  useLayoutEffect(() => {
    demoStore.getState().setTheme(readStoredTheme());
  }, []);

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
