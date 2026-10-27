import { Navigate } from "react-router";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { useDemoStore } from "@/store/use-demo-store";

/** Only the overview initiates onboarding; all other deep links remain usable. */
export function OverviewEntry() {
  const complete = useDemoStore((state) => state.onboardingComplete);
  return complete ? <DashboardPage /> : <Navigate to="/start" replace />;
}
