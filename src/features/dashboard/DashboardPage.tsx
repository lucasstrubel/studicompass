import { lazy, Suspense } from "react";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { DESKTOP_QUERY } from "@/components/layout/navigation";
import { DEMO_NOW } from "@/config/demo";
import { useMediaQuery } from "@/lib/use-media-query";
import { selectImportantDecisions } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { NextDeadline } from "./DashboardRail";
import { ImportantCard } from "./ImportantCard";
import { SemesterModules } from "./SemesterModules";
import { StudyProgressCard } from "./StudyProgressCard";

// Recharts is the largest dependency; the chart loads on its own (bundle note from P1-04).
const EctsHistory = lazy(() =>
  import("./EctsHistory").then((module) => ({ default: module.EctsHistory })),
);

/** A withdrawal deadline this close leads the overview on narrow screens. */
const URGENT_MS = 48 * 60 * 60 * 1000;

/** Line samples for the course line; the chart itself has no legend, so this also shows while it loads. */
function CourseLegend() {
  const items = [
    { label: "Ist", className: "stroke-accent [stroke-width:3]" },
    {
      label: "Prognose",
      className:
        "stroke-accent [stroke-width:2] [stroke-dasharray:1_6] [stroke-linecap:round]",
    },
    {
      label: "Soll",
      className:
        "stroke-muted-foreground [stroke-width:1.5] [stroke-dasharray:6_5]",
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
    className="mt-3 h-56 md:h-64"
    aria-label="ECTS-Verlauf wird geladen"
  />
);

/**
 * Übersicht: one card joins Studienstand and course line, followed by Jetzt wichtig and this semester; on
 * small screens the next deadline follows Jetzt wichtig, and Jetzt wichtig leads the page while a deadline
 * is less than two days away. The right column is DashboardRail.
 * The card's two sections stay separate regions, because screen readers meet them as different things.
 */
export function DashboardPage() {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const urgent = useDemoStore(selectImportantDecisions).some(
    (decision) =>
      Date.parse(decision.exam.withdrawalDeadline ?? "") - DEMO_NOW.getTime() <
      URGENT_MS,
  );
  // Below 1280 px the Studienstand fills the first screen. A deadline within two days must not wait
  // behind it, so "Jetzt wichtig" leads there; with both columns it stays in its place below the card.
  const importantFirst = urgent && !desktop;
  const important = (
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
  );
  return (
    <div className="space-y-8">
      {importantFirst && important}
      <div className="rounded-2xl border bg-card p-5 md:p-7">
        <section aria-labelledby="study-progress">
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
        <section aria-labelledby="ects-history" className="mt-6 border-t pt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h2 id="ects-history" className="text-section-title">
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
      {!importantFirst && important}
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
