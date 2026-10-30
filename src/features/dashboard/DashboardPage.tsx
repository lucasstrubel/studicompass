import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { WithdrawalNotice } from "@/components/common/WithdrawalNotice";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_NOW } from "@/config/demo";
import { format, semesterNumber } from "@/domain/terms";
import { greeting } from "@/lib/format";
import { selectAcademicState, selectProfileName } from "@/store/selectors";
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
  const firstName = useDemoStore(selectProfileName)?.firstName;
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

/**
 * Übersicht (KONZEPT §8 S1): Studienstand and Jetzt wichtig, below them the ECTS-Verlauf (Lucas, P5-06), then
 * this semester and the milestone; on small screens the next deadline follows Jetzt wichtig. The right
 * column is DashboardRail.
 */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <ResourceBoundary services={["pos"]} skeleton={null}>
        {() => <WithdrawalNotice />}
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
      <section aria-labelledby="ects-history" className="rounded-xl border p-5">
        <h2 id="ects-history" className="text-section-title">
          ECTS-Verlauf
        </h2>
        <p className="mt-1 text-meta text-muted-foreground">
          Kumuliert je Semester; das laufende Semester als Prognose, wenn du
          alle angemeldeten Prüfungen bestehst.
        </p>
        <ResourceBoundary
          services={["pos"]}
          skeleton={
            <Skeleton
              role="status"
              className="mt-3 h-48"
              aria-label="ECTS-Verlauf wird geladen"
            />
          }
        >
          {() => (
            <Suspense
              fallback={
                <Skeleton
                  role="status"
                  className="mt-3 h-48"
                  aria-label="ECTS-Verlauf wird geladen"
                />
              }
            >
              <EctsHistory />
            </Suspense>
          )}
        </ResourceBoundary>
      </section>
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
    </div>
  );
}
