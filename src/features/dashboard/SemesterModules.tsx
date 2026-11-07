import { Fragment } from "react";
import { ArrowRight, Undo2 } from "lucide-react";
import { Link } from "react-router";
import { AdmissionStatus } from "@/components/common/AdmissionStatus";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { CitationList } from "@/components/common/CitationList";
import type { Citation } from "@/domain/types";
import { DemoBadge } from "@/components/common/DemoBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "@/domain/terms";
import { compoundParts } from "@/lib/compound-breaks";
import { formatDateTime } from "@/lib/format";
import {
  selectAdmission,
  selectCurrentExams,
  selectRulesById,
  type CurrentExam,
} from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { moduleArt, moduleToneStyle } from "./module-art";
import { ModuleIllustration } from "./ModuleIllustration";

const OFFERING_LABELS = { WS: "nur im WS", SS: "nur im SS" } as const;

// Source of the offering labels ("nur im WS").
const OFFERING_SOURCE: Citation = {
  document: "Modulhandbuch Wirtschaftsinformatik",
  summary: "Angebotsturnus der Module",
  verified: false,
};

type MoodleState = "loading" | "error" | "ready";

function ModuleRow({
  item,
  moodle,
}: {
  item: CurrentExam;
  moodle: MoodleState;
}) {
  const { exam, module, progress } = item;
  const withdrawn = exam.status === "withdrawn";
  const admission = useDemoStore((state) => selectAdmission(state, module.id));
  return (
    <li
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 p-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,15rem)] md:gap-x-4"
      style={moduleToneStyle(module.id)}
    >
      <ModuleIllustration kind={moduleArt(module.id)} />
      <div className="min-w-0">
        <h3 className="text-card-title">
          <Link
            to={`/module/${module.id}`}
            className="rounded-sm hover:underline"
          >
            {compoundParts(module.title).map((part, index) => (
              <Fragment key={index}>
                {index > 0 && <wbr />}
                {part}
              </Fragment>
            ))}
          </Link>
        </h3>
        <p className="text-meta text-muted-foreground tabular-nums">
          {exam.date && `Prüfung ${formatDateTime(new Date(exam.date))}`}
          {exam.room && ` · Raum ${exam.room}`}
          {exam.date && " · "}
          {module.ects} ECTS
          {module.offering !== "BOTH" &&
            ` · ${OFFERING_LABELS[module.offering]}`}
        </p>
        {/* Registered is the normal case in this list; only the deviation is named. */}
        {withdrawn && (
          <p className="mt-1 flex flex-wrap items-center gap-2 text-meta">
            <Undo2 className="size-3.5" aria-hidden="true" />
            Abgemeldet
            <DemoBadge variant="simulation" />
          </p>
        )}
        {/* Admission once a Prüfungsvorleistung is entered (P5-13, DR-13 cited below the list). */}
        <AdmissionStatus admission={admission} className="mt-1" />
      </div>
      <div className="col-start-2 min-w-0 md:col-start-3">
        {progress ? (
          <>
            <p className="text-meta">
              {progress.label}
              {progress.detail && (
                <span className="text-muted-foreground">
                  {" "}
                  · {progress.detail}
                </span>
              )}
            </p>
            {progress.total !== undefined &&
              progress.completed !== undefined && (
                <div
                  role="progressbar"
                  aria-label={`${module.title}: Moodle-Fortschritt`}
                  aria-valuenow={progress.completed}
                  aria-valuemin={0}
                  aria-valuemax={progress.total}
                  aria-valuetext={progress.label}
                  className="mt-1.5 h-1 rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-(--module-tone) transition-[width] duration-300"
                    style={{
                      width: `${(progress.completed / progress.total) * 100}%`,
                    }}
                  />
                </div>
              )}
          </>
        ) : moodle === "loading" ? (
          // Loading is not unavailability (Q-2): a quiet placeholder until Moodle answers.
          <div className="space-y-2">
            <p className="text-meta text-muted-foreground">
              Moodle-Fortschritt wird geladen …
            </p>
            <Skeleton className="h-1 rounded-full" aria-hidden="true" />
          </div>
        ) : (
          moodle === "error" && (
            <p className="text-meta text-muted-foreground">
              Moodle-Fortschritt gerade nicht verfügbar
            </p>
          )
        )}
      </div>
    </li>
  );
}

/** "Dieses Semester": registered exams of the current semester as rows of one surface. */
export function SemesterModules() {
  const exams = useDemoStore(selectCurrentExams);
  const moodle = useDemoStore((state): MoodleState => {
    const { data, status } = state.resources.moodle;
    if (data) return "ready";
    return status === "error" ? "error" : "loading";
  });
  const term = exams[0]?.exam.term;
  const showsAdmission = useDemoStore((state) =>
    exams.some((item) => selectAdmission(state, item.module.id) !== "none"),
  );
  const admissionRule = useDemoStore(
    (state) => selectRulesById(state)["DR-13"],
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="semester-modules" className="text-section-title">
          Dieses Semester{term && ` (${format(term)})`}
        </h2>
        <Link
          to="/module"
          className="inline-flex items-center gap-1 rounded-sm text-meta font-semibold text-accent-strong"
        >
          Alle Module
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {exams.length === 0 ? (
        <EmptyState
          title="In diesem Semester bist du für keine Prüfung angemeldet."
          description="Angemeldete Prüfungen aus dem POS erscheinen hier mit Termin und Moodle-Fortschritt."
        />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {exams.map((item) => (
            <ModuleRow key={item.exam.id} item={item} moodle={moodle} />
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-muted-foreground">
        <span className="flex items-center gap-2">
          Kanäle: <ChannelBadge channel="pos" />{" "}
          <ChannelBadge channel="moodle" />
        </span>
        <CitationList
          variant="footer"
          className="mt-0"
          citations={[
            OFFERING_SOURCE,
            ...(showsAdmission && admissionRule
              ? [admissionRule.citation]
              : []),
          ]}
        />
      </div>
    </>
  );
}
