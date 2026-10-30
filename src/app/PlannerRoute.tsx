import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

// Drag & drop is only used here. Onboarding and other pages do not need to download it.
const PlannerPage = lazy(() =>
  import("@/features/planner/PlannerPage").then((module) => ({
    default: module.PlannerPage,
  })),
);

export function PlannerRoute() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Studienverlauf" />
          <Skeleton
            role="status"
            aria-label="Studienverlauf wird geladen"
            className="h-64"
          />
        </>
      }
    >
      <PlannerPage />
    </Suspense>
  );
}

export function PlannerRouteError() {
  return (
    <>
      <PageHeader title="Studienverlauf" />
      <ErrorState
        title="Studienverlauf konnte nicht geladen werden"
        message="Bitte lade die Seite erneut. Deine gespeicherten Einträge bleiben erhalten."
        retryLabel="Seite neu laden"
        onRetry={() => window.location.reload()}
      />
    </>
  );
}
