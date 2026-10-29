import { Link, useParams } from "react-router";
import { CheckCircle2, Circle, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CitationList } from "@/components/common/CitationList";
import { Countdown } from "@/components/common/Countdown";
import { EmptyState } from "@/components/common/EmptyState";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { useDemoStore } from "@/store/use-demo-store";
import {
  selectAcademicState,
  selectProgress,
  selectRulesById,
} from "@/store/selectors";
import {
  selectModuleRecord,
  selectPassedModuleCount,
} from "@/store/module-selectors";
import { formatDateTime, formatGrade } from "@/lib/format";
import { offeringRule } from "@/lib/offering-rule";
import { DEMO_CURRENT_TERM, DEMO_NOW } from "@/config/demo";
import type { ExamRecord, Module } from "@/domain/types";

const STATUS = {
  passed: "Bestanden",
  failed: "Nicht bestanden",
  registered: "Angemeldet",
  withdrawn: "Abgemeldet",
};
const OFFERING = { WS: "nur WS", SS: "nur SS", BOTH: "jedes Semester" };

function ExamStatus({ exam }: { exam: ExamRecord | null }) {
  const Icon =
    exam?.status === "passed"
      ? CheckCircle2
      : exam?.status === "failed"
        ? CircleAlert
        : Circle;
  return (
    <span className="inline-flex items-center gap-1 text-meta">
      <Icon className="size-4" aria-hidden="true" />
      {exam ? STATUS[exam.status] : "Geplant"}
    </span>
  );
}

function ModuleRow({ module }: { module: Module }) {
  const exam = useDemoStore((state) => selectModuleRecord(state, module));
  return (
    <li>
      <Link
        to={`/module/${module.id}`}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 hover:bg-muted"
      >
        <span className="min-w-0">
          <span className="block text-card-title">{module.title}</span>
          <span className="text-meta text-muted-foreground tabular-nums">
            {module.ects} ECTS · {OFFERING[module.offering]}
            {exam?.attempt ? ` · Versuch ${exam.attempt}` : ""}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-3">
          <ExamStatus exam={exam} />
          {exam?.grade !== undefined && (
            <span className="text-card-title tabular-nums">
              Note {formatGrade(exam.grade)}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

function List() {
  const academic = useDemoStore(selectAcademicState);
  const progress = useDemoStore(selectProgress);
  const program = useDemoStore((state) => state.resources.pos.data?.program);
  const rules = useDemoStore(selectRulesById);
  const passed = useDemoStore(selectPassedModuleCount);
  if (!academic || !progress || !program) return null;
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Erreichte ECTS", progress.earnedEcts],
          [
            "Notenschnitt",
            progress.gradeAverage === null
              ? "Noch keine Noten"
              : formatGrade(progress.gradeAverage),
          ],
          ["Bestandene Module", passed],
          [
            "Offene Grundstudiums-Prüfungen",
            progress.openFoundationModules.length,
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <dt className="text-meta text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-section-title tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <CitationList
        variant="footer"
        className="mt-0"
        citations={[
          program.citation,
          ...["DR-1", "DR-9"].flatMap((id) =>
            rules[id] ? [rules[id].citation] : [],
          ),
        ]}
      />
      {academic.modules.length === 0 && (
        <EmptyState title="Noch keine Module vorhanden" />
      )}
      {[...new Set(academic.modules.map((module) => module.plannedSemester))]
        .sort((a, b) => a - b)
        .map((semester) => (
          <section key={semester} aria-labelledby={`semester-${semester}`}>
            <h2 id={`semester-${semester}`} className="mb-3 text-section-title">
              {semester}. Fachsemester
            </h2>
            <ul className="space-y-2">
              {academic.modules
                .filter((module) => module.plannedSemester === semester)
                .map((module) => (
                  <ModuleRow key={module.id} module={module} />
                ))}
            </ul>
          </section>
        ))}
    </div>
  );
}

function Detail({ id }: { id: string }) {
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
    <div className="max-w-3xl space-y-5">
      <Link to="/module" className="text-meta underline">
        Zur Modulliste
      </Link>
      <h2 className="text-section-title">{module.title}</h2>
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="text-card-title">Modulsteckbrief</h3>
        <p className="text-body">{module.description}</p>
        <p className="text-meta">
          {module.ects} ECTS · {OFFERING[module.offering]} · {module.examType}
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
        <ExamStatus exam={exam} />
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
        {exam?.attempt && <p className="text-body">Versuch {exam.attempt}</p>}
        {exam?.withdrawalDeadline && (
          <p className="text-body">
            Abmeldefrist: {formatDateTime(new Date(exam.withdrawalDeadline))} ·{" "}
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
  );
}

export function ModulesPage() {
  const { moduleId } = useParams();
  return (
    <ResourceBoundary
      services={["pos"]}
      skeleton={
        <Skeleton
          role="status"
          aria-label="Module werden geladen"
          className="h-64"
        />
      }
    >
      {() => (moduleId ? <Detail id={moduleId} /> : <List />)}
    </ResourceBoundary>
  );
}
