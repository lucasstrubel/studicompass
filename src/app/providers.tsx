import { useEffect, type ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { demoStore } from "@/store/demo-store";

const loadMotionFeatures = () =>
  import("@/lib/motion-features").then((module) => module.default);

/** App-wide providers: motion (following the system's reduced-motion setting), tooltips and the toaster. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void demoStore.getState().hydrate();
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <TooltipProvider>
          {children}
          {/* Toasts sit above the assistant button at the bottom right (P5-06). */}
          <Toaster
            offset={{ bottom: "6rem" }}
            mobileOffset={{ bottom: "6rem" }}
          />
        </TooltipProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
