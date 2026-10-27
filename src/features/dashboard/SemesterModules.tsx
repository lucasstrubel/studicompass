import { BookOpen, Check, Undo2 } from "lucide-react";
import { Link } from "react-router";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { CitationList } from "@/components/common/CitationList";
import type { Citation } from "@/domain/types";
import { DemoBadge } from "@/components/common/DemoBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "@/domain/terms";
import { formatDateTime } from "@/lib/format";
import { selectCurrentExams, type CurrentExam } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import { ModuleIllustration } from "./ModuleIllustration";
import { moduleArt } from "./module-art";

const OFFERING_LABELS = { WS: "nur im WS", SS: "nur im SS" } as const;

// Source of the offering labels ("nur im WS"); unchecked until P0-02 (INHALTE §2).
const OFFERING_SOURCE: Citation = {
  document: "Modulhandbuch Wirtschaftsinformatik",
  summary: "Angebotsturnus der Module",
  verified: false,
};

type MoodleState = "loading" | "error" | "ready";

function ModuleCard({
  item,
  moodle,
}: {
  item: CurrentExam;
  moodle: MoodleState;
}) {
  const { exam, module, progress } = item;
  const withdrawn = exam.status === "withdrawn";
  return (
    <li>
      <Card size="sm" className="h-full">
        <CardContent className="flex items-start gap-3">
          <div className="hidden sm:block">
            <ModuleIllustration kind={moduleArt(module.id)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-card-title">
              <Link
                to={`/module/${module.id}`}
                className="rounded-sm hover:underline"
              >
                {module.title}
              </Link>
            </h3>
            {exam.date && (
              <p className="mt-1 text-meta tabular-nums">
                Prüfung {formatDateTime(new Date(exam.date))}
                {exam.room && ` · Raum ${exam.room}`}
              </p>
            )}
            <p className="mt-1 text-meta text-muted-foreground">
              {module.ects} ECTS
              {module.offering !== "BOTH" &&
                ` · ${OFFERING_LABELS[module.offering]}`}
            </p>
            {withdrawn ? (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-meta">
                <Undo2 className="size-3.5" aria-hidden="true" />
                Abgemeldet
                <DemoBadge variant="simulation" />
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-1 text-meta">
                <Check className="size-3.5" aria-hidden="true" />
                Angemeldet
              </p>
            )}
            {progress ? (
              <>
                {progress.total !== undefined &&
                  progress.completed !== undefined && (
                    <div
                      role="progressbar"
                      aria-label={`${module.title}: Moodle-Fortschritt`}
                      aria-valuenow={progress.completed}
                      aria-valuemin={0}
                      aria-valuemax={progress.total}
                      aria-valuetext={progress.label}
                      className="mt-3 h-1 rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-accent-strong"
                        style={{
                          width: `${(progress.completed / progress.total) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                <p className="mt-2 text-meta">
                  {progress.label}
                  {progress.detail && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {progress.detail}
                    </span>
                  )}
                </p>
              </>
            ) : moodle === "loading" ? (
              // Loading is not unavailability (Q-2): a quiet placeholder until Moodle answers.
              <div className="mt-3 space-y-2">
                <Skeleton className="h-1 rounded-full" aria-hidden="true" />
                <p className="text-meta text-muted-foreground">
                  Moodle-Fortschritt wird geladen …
                </p>
              </div>
            ) : (
              moodle === "error" && (
                <p className="mt-2 text-meta text-muted-foreground">
                  Moodle-Fortschritt gerade nicht verfügbar
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

/** "Dieses Semester" (KONZEPT §8 S1 no. 3): registered exams of the current semester as module cards. */
export function SemesterModules() {
  const exams = useDemoStore(selectCurrentExams);
  const moodle = useDemoStore((state): MoodleState => {
    const { data, status } = state.resources.moodle;
    if (data) return "ready";
    return status === "error" ? "error" : "loading";
  });
  const term = exams[0]?.exam.term;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="semester-modules" className="text-section-title">
          Dieses Semester{term && ` (${format(term)})`}
        </h2>
        <Link
          to="/module"
          className="inline-flex items-center gap-2 rounded-sm text-meta font-semibold text-accent-strong"
        >
          Alle Module
          <BookOpen className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {exams.length === 0 ? (
        <EmptyState
          title="In diesem Semester bist du für keine Prüfung angemeldet."
          description="Angemeldete Prüfungen aus dem POS erscheinen hier mit Termin und Moodle-Fortschritt."
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {exams.map((item) => (
            <ModuleCard key={item.exam.id} item={item} moodle={moodle} />
          ))}
        </ul>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-2 text-meta text-muted-foreground">
        Kanäle: <ChannelBadge channel="pos" /> <ChannelBadge channel="moodle" />
      </p>
      <CitationList className="mt-2" citations={[OFFERING_SOURCE]} />
    </>
  );
}
