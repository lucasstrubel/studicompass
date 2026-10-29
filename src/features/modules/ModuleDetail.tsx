import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CitationList } from "@/components/common/CitationList";
import { Countdown } from "@/components/common/Countdown";
import { EmptyState } from "@/components/common/EmptyState";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { DEMO_CURRENT_TERM, DEMO_NOW } from "@/config/demo";
import { formatDateTime, formatGrade } from "@/lib/format";
import { offeringRule } from "@/lib/offering-rule";
import { selectModuleRecord } from "@/store/module-selectors";
import { selectRulesById } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { CourseLinks } from "./CourseLinks";
import { ExamStatusLabel } from "./ExamStatusLabel";
import { ModuleNotes } from "./ModuleNotes";
import { OFFERING } from "./module-labels";

/**
 * Module detail (KONZEPT §8 S3): profile, exam and Moodle progress on the left; from 1024 px the
 * right column holds what Niklas adds himself – course links and notes (P5-12).
 */
export function ModuleDetail({ id }: { id: string }) {
  const module = useDemoStore((state) =>
    state.resources.pos.data?.modules.find((module) => module.id === id),
  );
  const exam = useDemoStore((state) =>
    module ? selectModuleRecord(state, module) : null,
  );
  const rules = useDemoStore(selectRulesById);
  const progress = useDemoStore((state) =>
    state.resources.moodle.data?.progress.find((item) => item.moduleId === id),
  );
  if (!module)
    return (
      <EmptyState
        title="Dieses Modul gibt es nicht"
        action={
          <Link to="/module" className="underline">
            Zur Modulliste
          </Link>
        }
      />
    );
  const canDecide =
    exam?.status === "registered" &&
    exam.term.year === DEMO_CURRENT_TERM.year &&
    exam.term.season === DEMO_CURRENT_TERM.season &&
    exam.withdrawalDeadline &&
    Date.parse(exam.withdrawalDeadline) > DEMO_NOW.getTime();
  return (
    <div className="space-y-5">
      <Link to="/module" className="text-meta underline">
        Zur Modulliste
      </Link>
      <h2 className="text-section-title">{module.title}</h2>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <section className="space-y-3 rounded-xl border bg-card p-4">
            <h3 className="text-card-title">Modulsteckbrief</h3>
            <p className="text-body">{module.description}</p>
            <p className="text-meta">
              {module.ects} ECTS · {OFFERING[module.offering]} ·{" "}
              {module.examType}
            </p>
            {module.lecturer && <p className="text-body">{module.lecturer}</p>}
            <CitationList
              variant="footer"
              className="mt-0"
              citations={[offeringRule(module, rules["DR-4"]).citation]}
            />
          </section>
          <section className="space-y-3 rounded-xl border bg-card p-4">
            <h3 className="text-card-title">Prüfung</h3>
            <ExamStatusLabel exam={exam} />
            {exam?.date && (
              <p className="text-body">
                {formatDateTime(new Date(exam.date))}
                {exam.room && ` · Raum ${exam.room}`}
              </p>
            )}
            {exam?.grade !== undefined && (
              <p className="text-body tabular-nums">
                Note: {formatGrade(exam.grade)}
              </p>
            )}
            {exam?.attempt && (
              <p className="text-body">Versuch {exam.attempt}</p>
            )}
            {exam?.withdrawalDeadline && (
              <p className="text-body">
                Abmeldefrist:{" "}
                {formatDateTime(new Date(exam.withdrawalDeadline))} ·{" "}
                <Countdown until={exam.withdrawalDeadline} />
              </p>
            )}
            {!exam && (
              <p className="text-body text-muted-foreground">
                Für dieses Modul ist noch keine Prüfung erfasst.
              </p>
            )}
            <CitationList
              variant="footer"
              className="mt-0"
              citations={[
                {
                  document: "POS – Prüfungsdaten (Demodaten)",
                  summary: "Termin, Raum und Prüfungsstatus",
                  verified: false,
                },
                ...(rules["DR-5"] && exam?.withdrawalDeadline
                  ? [rules["DR-5"].citation]
                  : []),
              ]}
            />
          </section>
          <ResourceBoundary
            services={["moodle"]}
            skeleton={
              <Skeleton
                role="status"
                aria-label="Moodle-Fortschritt wird geladen"
                className="h-20"
              />
            }
          >
            {() => (
              <section className="rounded-xl border bg-card p-4">
                <h3 className="text-card-title">Moodle-Fortschritt</h3>
                <p className="mt-2 text-body">
                  {progress
                    ? `${progress.label}${progress.detail ? ` · ${progress.detail}` : ""}`
                    : "Für dieses Modul ist kein Moodle-Fortschritt hinterlegt."}
                </p>
              </section>
            )}
          </ResourceBoundary>
          <div className="flex flex-wrap gap-2">
            {canDecide && (
              <Button variant="outline" asChild>
                <Link to={`/entscheidung/${exam.id}`}>
                  Folgen einer Abmeldung prüfen
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/assistent?module=${module.id}`}>
                Frage zu diesem Modul stellen
              </Link>
            </Button>
          </div>
        </div>
        <aside aria-label="Deine Ergänzungen" className="space-y-5">
          <CourseLinks moduleId={module.id} title={module.title} />
          <ModuleNotes moduleId={module.id} />
        </aside>
      </div>
    </div>
  );
}
