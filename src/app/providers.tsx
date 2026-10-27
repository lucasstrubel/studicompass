import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { demoStore } from "@/store/demo-store";

/** App-wide providers: tooltips and the toaster. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void demoStore.getState().hydrate();
  }, []);
  return (
    <TooltipProvider>
      {children}
      {/* Toasts sit above the assistant button at the bottom right (P5-06). */}
      <Toaster offset={{ bottom: "6rem" }} mobileOffset={{ bottom: "6rem" }} />
    </TooltipProvider>
  );
}
