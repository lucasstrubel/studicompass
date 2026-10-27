import { lazy, Suspense } from "react";
import { Undo2 } from "lucide-react";
import { DemoBadge } from "@/components/common/DemoBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_NOW } from "@/config/demo";
import { format, semesterNumber } from "@/domain/terms";
import { greeting } from "@/lib/format";
import {
  selectAcademicState,
  selectCurrentExams,
  selectUndoableExamId,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { NextDeadline } from "./DashboardRail";
import { ImportantCard } from "./ImportantCard";
import { MilestoneCard } from "./MilestoneCard";
import { SemesterModules } from "./SemesterModules";
import { StudyProgressCard } from "./StudyProgressCard";

// Recharts is the largest dependency; the chart loads on its own (bundle note from P1-04).
const EctsHistory = lazy(() =>
  import("./EctsHistory").then((module) => ({ default: module.EctsHistory })),
);

function OverviewHeader() {
  const academic = useDemoStore(selectAcademicState);
  const firstName = academic?.student.firstName;
  return (
    <PageHeader
      title={`${greeting(DEMO_NOW)}${firstName ? `, ${firstName}` : ""}`}
      description="Dein Studium auf einen Blick."
      meta={
        academic && (
          <span className="rounded-full border px-3 py-1 text-meta text-muted-foreground">
            {semesterNumber(academic.currentTerm, academic.student.startTerm)}.
            Semester · {format(academic.currentTerm)}
          </span>
        )
      }
    />
  );
}

/** Shows that the overview contains a simulated withdrawal and offers to undo it (KONZEPT §10.6). */
function SimulationNotice() {
  const withdrawn = useDemoStore(selectCurrentExams).filter(
    (item) => item.exam.status === "withdrawn",
  );
  const undoableId = useDemoStore(selectUndoableExamId);
  const undoable = withdrawn.find((item) => item.exam.id === undoableId);
  const undo = useDemoStore((state) => state.undo);
  if (withdrawn.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-status-info bg-status-info-soft p-3 text-status-info-foreground">
      <DemoBadge variant="simulation" className="bg-card" />
      <p className="flex-1 text-body">
        Simulierte Abmeldung:{" "}
        {withdrawn.map((item) => item.module.title).join(", ")}. Im echten
        Betrieb meldest du dich im POS ab.
      </p>
      {undoable && (
        <Button variant="outline" size="sm" onClick={undo}>
          <Undo2 aria-hidden="true" />
          Rückgängig
          {withdrawn.length > 1 && `: ${undoable.module.title}`}
        </Button>
      )}
    </div>
  );
}

/** Übersicht (KONZEPT §8 S1): main column in priority order; the right column is DashboardRail. */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <ResourceBoundary services={["pos"]} skeleton={null}>
        {() => <SimulationNotice />}
      </ResourceBoundary>
      <div className="grid gap-4 xl:grid-cols-2">
        <section aria-labelledby="study-progress">
          <ResourceBoundary
            services={["pos", "rules"]}
            skeleton={
              <Skeleton
                role="status"
                className="h-80"
                aria-label="Studienstand wird geladen"
              />
            }
          >
            {() => <StudyProgressCard />}
          </ResourceBoundary>
        </section>
        <ResourceBoundary
          services={["pos", "website", "rules"]}
          skeleton={
            <Skeleton
              role="status"
              className="h-80"
              aria-label="Jetzt wichtig wird geladen"
            />
          }
        >
          {() => <ImportantCard />}
        </ResourceBoundary>
      </div>
      <NextDeadline className="xl:hidden" />
      <section aria-labelledby="semester-modules">
        <ResourceBoundary
          services={["pos"]}
          skeleton={
            <Skeleton
              role="status"
              className="h-72"
              aria-label="Module werden geladen"
            />
          }
        >
          {() => (
            <>
              <ResourceBoundary services={["moodle"]} skeleton={null}>
                {() => null}
              </ResourceBoundary>
              <SemesterModules />
            </>
          )}
        </ResourceBoundary>
      </section>
      <section aria-labelledby="milestone" className="rounded-xl border p-5">
        <ResourceBoundary
          services={["pos", "rules"]}
          skeleton={
            <Skeleton
              role="status"
              className="h-40"
              aria-label="Meilenstein wird geladen"
            />
          }
        >
          {() => <MilestoneCard />}
        </ResourceBoundary>
      </section>
      <section aria-labelledby="ects-history" className="rounded-xl border p-5">
        <ResourceBoundary
          services={["pos"]}
          skeleton={
            <Skeleton
              role="status"
              className="h-64"
              aria-label="ECTS-Verlauf wird geladen"
            />
          }
        >
          {() => (
            <Suspense
              fallback={
                <Skeleton
                  role="status"
                  className="h-64"
                  aria-label="ECTS-Verlauf wird geladen"
                />
              }
            >
              <EctsHistory />
            </Suspense>
          )}
        </ResourceBoundary>
      </section>
    </div>
  );
}
