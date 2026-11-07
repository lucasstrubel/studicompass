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
      meta={
        academic && (
          <span>
            {semesterNumber(academic.currentTerm, academic.student.startTerm)}.
            Semester · {format(academic.currentTerm)}
          </span>
        )
      }
    />
  );
}

/** Line samples for the course line; the chart itself has no legend, so this also shows while it loads. */
function CourseLegend() {
  const items = [
    { label: "Ist", className: "stroke-(--hero-line) [stroke-width:3]" },
    {
      label: "Prognose",
      className:
        "stroke-(--hero-line) [stroke-width:2] [stroke-dasharray:1_6] [stroke-linecap:round]",
    },
    {
      label: "Soll",
      className:
        "stroke-(--hero-target) [stroke-width:1.5] [stroke-dasharray:6_5]",
    },
  ];
  return (
    <ul
      aria-hidden="true"
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-muted-foreground"
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <svg viewBox="0 0 20 4" className="h-1 w-5">
            <line x1="0" y1="2" x2="20" y2="2" className={item.className} />
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

const chartSkeleton = (
  <Skeleton
    role="status"
    className="mx-5 h-56 md:mx-7 md:h-60"
    aria-label="ECTS-Verlauf wird geladen"
  />
);

/**
 * Übersicht: the hero joins Studienstand and course line, followed by Jetzt wichtig and this semester; on
 * small screens the next deadline follows Jetzt wichtig. The right column is DashboardRail.
 * The hero's two sections stay separate regions, because screen readers meet them as different things.
 */
export function DashboardPage() {
  return (
    <div className="space-y-8">
      <OverviewHeader />
      <ResourceBoundary services={["pos"]} skeleton={null}>
        {() => <WithdrawalNotice />}
      </ResourceBoundary>
      <div className="surface-hero rounded-2xl pt-5 pb-5 md:pt-6">
        <section aria-labelledby="study-progress" className="px-5 md:px-7">
          <ResourceBoundary
            services={["pos", "rules"]}
            skeleton={
              <Skeleton
                role="status"
                className="h-36"
                aria-label="Studienstand wird geladen"
              />
            }
          >
            {() => <StudyProgressCard />}
          </ResourceBoundary>
        </section>
        <section aria-labelledby="ects-history" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 md:px-7">
            <h2 id="ects-history" className="text-card-title">
              ECTS-Verlauf
            </h2>
            <CourseLegend />
          </div>
          <ResourceBoundary services={["pos"]} skeleton={chartSkeleton}>
            {() => (
              <Suspense fallback={chartSkeleton}>
                <EctsHistory />
              </Suspense>
            )}
          </ResourceBoundary>
        </section>
      </div>
      <ResourceBoundary
        services={["pos", "website", "rules"]}
        skeleton={
          <Skeleton
            role="status"
            className="h-40"
            aria-label="Jetzt wichtig wird geladen"
          />
        }
      >
        {() => <ImportantCard />}
      </ResourceBoundary>
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
    </div>
  );
}
