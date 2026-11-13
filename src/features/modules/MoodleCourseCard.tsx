import {
  ClipboardList,
  FileText,
  Megaphone,
  Puzzle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitationList } from "@/components/common/CitationList";
import { DEMO_NOW } from "@/config/demo";
import { moodleChangeText } from "@/domain/moodle-changes";
import type { MoodleCourseItem, MoodleItemKind } from "@/domain/types";
import { formatDate, formatShortDateTime } from "@/lib/format";
import { selectMoodleChanges } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

const ICONS: Record<MoodleItemKind, typeof FileText> = {
  file: FileText,
  assignment: ClipboardList,
  announcement: Megaphone,
  activity: Puzzle,
};

function points(value: number): string {
  return value.toLocaleString("de-DE", { maximumFractionDigits: 2 });
}

/** "eingereicht · 8 von 10 Punkten" / "offen bis 31.01.2027" / "nicht eingereicht". */
function assignmentStatus(item: MoodleCourseItem): string {
  const grade = item.grade
    ? ` · ${points(item.grade.points)} von ${points(item.grade.max)} Punkten`
    : "";
  if (item.submitted) return `eingereicht${grade}`;
  if (item.dueAt && Date.parse(item.dueAt) > DEMO_NOW.getTime())
    return `offen bis ${formatDate(new Date(item.dueAt))}${grade}`;
  return `nicht eingereicht${grade}`;
}

/**
 * Moodle for one module: progress, what changed since the last sync ("Neu in Moodle") and the course
 * page as a list. With the example data only the progress line exists; the rest needs the recording
 * or a connected Moodle (ADR 0002).
 */
export function MoodleCourseCard({ moduleId }: { moduleId: string }) {
  const progress = useDemoStore((state) =>
    state.resources.moodle.data?.progress.find(
      (item) => item.moduleId === moduleId,
    ),
  );
  const course = useDemoStore((state) =>
    state.resources.moodle.data?.courses.find(
      (item) => item.moduleId === moduleId,
    ),
  );
  const source = useDemoStore((state) => state.moodleSource);
  const site = useDemoStore((state) => state.moodleSite);
  const loading = useDemoStore(
    (state) => state.resources.moodle.status === "loading",
  );
  const allChanges = useDemoStore(selectMoodleChanges);
  const seen = useDemoStore((state) => state.readInboxIds);
  const markRead = useDemoStore((state) => state.markRead);
  const refreshMoodle = useDemoStore((state) => state.refreshMoodle);

  const changes = allChanges.filter(
    (change) => change.moduleId === moduleId && !seen.includes(change.id),
  );
  const live = source === "live";
  const files = course?.items.filter((item) => item.kind === "file") ?? [];
  const assignments =
    course?.items.filter((item) => item.kind === "assignment") ?? [];

  return (
    <section className="space-y-3 p-4" aria-labelledby={`moodle-${moduleId}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`moodle-${moduleId}`} className="text-card-title">
          Moodle
        </h3>
        {source !== "demo" && (
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void refreshMoodle()}
          >
            <RefreshCw aria-hidden="true" />
            {loading ? "Wird abgeglichen …" : "Moodle abgleichen"}
          </Button>
        )}
      </div>
      <p className="text-body">
        {progress
          ? `${progress.label}${progress.detail ? ` · ${progress.detail}` : ""}`
          : "Für dieses Modul ist kein Moodle-Fortschritt hinterlegt."}
      </p>

      {changes.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-meta font-semibold">Neu in Moodle</h4>
          <ul className="divide-y">
            {changes.map((change) => {
              const Icon = ICONS[change.kind];
              return (
                <li
                  key={change.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2"
                >
                  <p className="flex min-w-0 items-start gap-2 text-body">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 break-words">
                      {moodleChangeText(change)}
                      {change.dueAt && change.type !== "graded" && (
                        <span className="text-muted-foreground">
                          {" "}
                          · Abgabe bis{" "}
                          {formatShortDateTime(new Date(change.dueAt))}
                        </span>
                      )}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {live && change.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={change.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`In Moodle öffnen: ${change.title}`}
                        >
                          In Moodle öffnen
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Gesehen: ${change.title}`}
                      onClick={() => markRead(change.id)}
                    >
                      Gesehen
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {course && changes.length === 0 && (
        <p className="text-meta text-muted-foreground">
          Seit dem letzten Abgleich hat sich in diesem Kurs nichts geändert.
        </p>
      )}

      {course && (
        <details className="group">
          <summary className="w-fit cursor-pointer rounded-sm text-meta font-semibold text-accent-strong">
            Kursinhalt: {files.length}{" "}
            {files.length === 1 ? "Datei" : "Dateien"}, {assignments.length}{" "}
            {assignments.length === 1 ? "Abgabe" : "Abgaben"}
          </summary>
          <div className="mt-2 space-y-3">
            {files.length > 0 && (
              <div>
                <h4 className="text-meta font-semibold">Dateien</h4>
                <ul className="text-body">
                  {files.map((item) => (
                    <li key={item.id} className="break-words">
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {assignments.length > 0 && (
              <div>
                <h4 className="text-meta font-semibold">Abgaben</h4>
                <ul className="text-body">
                  {assignments.map((item) => (
                    <li key={item.id} className="break-words">
                      {item.title}
                      <span className="text-muted-foreground tabular-nums">
                        {" "}
                        · {assignmentStatus(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {live && (
              <Button variant="outline" size="sm" asChild>
                <a href={course.url} target="_blank" rel="noreferrer">
                  Kurs in Moodle öffnen
                </a>
              </Button>
            )}
          </div>
        </details>
      )}

      {course && (
        <CitationList
          variant="footer"
          className="mt-0"
          citations={[
            {
              document: live
                ? `Moodle – ${site?.siteName ?? "verbundenes Moodle"}`
                : "Moodle – Aufzeichnung der Sandbox",
              summary: "Kursinhalt, Abgaben und Bewertungen",
              verified: live,
            },
          ]}
        />
      )}
    </section>
  );
}
