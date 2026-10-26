import type { ReactNode } from "react";
import { useTheme } from "@/app/theme-context";
import { ThemeProvider } from "@/app/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Toasts render in a portal; they get the resolved theme as a prop (sonner.tsx has no next-themes).
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme} />;
}

/** App-wide providers: theme, tooltips and the toaster. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
        <ThemedToaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
