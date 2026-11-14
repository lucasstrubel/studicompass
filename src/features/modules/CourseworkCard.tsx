import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Download, Pencil, Plus, Trash2, X } from "lucide-react";
import { AdmissionStatus } from "@/components/common/AdmissionStatus";
import { CitationList } from "@/components/common/CitationList";
import { Button } from "@/components/ui/button";
import {
  COURSEWORK_EFFORT_MAX,
  COURSEWORK_STEPS_MAX,
  examAdmission,
  linkedMoodleItem,
  suggestedStatus,
  summarizeCoursework,
  unlinkedAssignments,
} from "@/domain/coursework";
import type {
  Coursework,
  CourseworkStatus,
  MoodleCourseItem,
} from "@/domain/types";
import { DEMO_DAY } from "@/lib/demo-day";
import { formatDate, formatHours as hours } from "@/lib/format";
import { ENTRY_TITLE_MAX_LENGTH } from "@/store/demo-store";
import { selectRulesById } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";

const FIELD =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-body placeholder:text-muted-foreground aria-invalid:border-status-critical";

const STATUS_LABELS: Record<CourseworkStatus, string> = {
  open: "offen",
  done: "erbracht",
  failed: "nicht erbracht",
};

const day = (date: string) => formatDate(new Date(`${date}T12:00:00Z`));

function CourseworkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Coursework;
  onSave: (
    title: string,
    dueAt: string | undefined,
    effortHours: number | undefined,
  ) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [due, setDue] = useState(initial?.dueAt ?? "");
  const [effort, setEffort] = useState(
    initial?.effortHours ? `${initial.effortHours}` : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [effortError, setEffortError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const effortRef = useRef<HTMLInputElement>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = title.trim();
    if (!text || text.length > ENTRY_TITLE_MAX_LENGTH) {
      setError(
        text
          ? `Höchstens ${ENTRY_TITLE_MAX_LENGTH} Zeichen.`
          : "Beschreibe die Prüfungsvorleistung.",
      );
      titleRef.current?.focus();
      return;
    }
    const planned = effort.trim() ? Number(effort.replace(",", ".")) : null;
    if (
      planned !== null &&
      !(planned > 0 && planned <= COURSEWORK_EFFORT_MAX)
    ) {
      setEffortError(
        `Gib Stunden zwischen 0,5 und ${COURSEWORK_EFFORT_MAX} an oder lass das Feld leer.`,
      );
      effortRef.current?.focus();
      return;
    }
    onSave(text, due || undefined, planned ?? undefined);
  };
  return (
    <form
      noValidate
      onSubmit={submit}
      className="space-y-3 rounded-lg bg-muted p-3"
    >
      <div className="space-y-1">
        <label htmlFor={`${id}-title`} className="text-meta font-semibold">
          Was ist zu erbringen?
        </label>
        <input
          ref={titleRef}
          id={`${id}-title`}
          value={title}
          placeholder="Z. B. 8 von 12 Übungsblättern"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            setTitle(event.target.value);
            setError(null);
          }}
          className={FIELD}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="text-meta text-status-critical-foreground"
          >
            {error}
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor={`${id}-due`} className="text-meta font-semibold">
            Frist (optional)
          </label>
          <input
            id={`${id}-due`}
            type="date"
            value={due}
            min={initial?.moodleRef ? undefined : DEMO_DAY}
            onChange={(event) => setDue(event.target.value)}
            className={FIELD}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${id}-effort`} className="text-meta font-semibold">
            Geplanter Aufwand in Stunden (optional)
          </label>
          <input
            ref={effortRef}
            id={`${id}-effort`}
            inputMode="decimal"
            value={effort}
            placeholder="Z. B. 4"
            aria-invalid={effortError ? true : undefined}
            aria-describedby={effortError ? `${id}-effort-error` : undefined}
            onChange={(event) => {
              setEffort(event.target.value);
              setEffortError(null);
            }}
            className={FIELD}
          />
          {effortError && (
            <p
              id={`${id}-effort-error`}
              className="text-meta text-status-critical-foreground"
            >
              {effortError}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          {initial ? "Speichern" : "Eintragen"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

/** Own plan of one entry: steps to tick off. Lives in a <details>, so a long list stays compact. */
function Steps({
  item,
  onChange,
}: {
  item: Coursework;
  onChange: (steps: Coursework["steps"]) => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const steps = item.steps ?? [];
  const done = steps.filter((step) => step.done).length;
  const full = steps.length >= COURSEWORK_STEPS_MAX;
  const add = (event: FormEvent) => {
    event.preventDefault();
    const title = text.trim().slice(0, ENTRY_TITLE_MAX_LENGTH);
    if (!title || full) return;
    onChange([...steps, { id: crypto.randomUUID(), title, done: false }]);
    setText("");
  };
  return (
    <details className="basis-full">
      <summary className="w-fit cursor-pointer rounded-sm text-meta font-semibold text-accent-strong">
        {steps.length > 0
          ? `Teilschritte ${done}/${steps.length}`
          : "Teilschritte planen"}
        <span className="sr-only"> für {item.title}</span>
      </summary>
      <div className="mt-2 space-y-2">
        {steps.length > 0 && (
          <ul className="space-y-1">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2 text-body">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={step.done}
                    onChange={(event) =>
                      onChange(
                        steps.map((other) =>
                          other.id === step.id
                            ? { ...other, done: event.target.checked }
                            : other,
                        ),
                      )
                    }
                  />
                  <span className="min-w-0 break-words">{step.title}</span>
                </label>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Teilschritt ${step.title} entfernen`}
                  onClick={() =>
                    onChange(steps.filter((other) => other.id !== step.id))
                  }
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {full ? (
          <p className="text-meta text-muted-foreground">
            Mehr als {COURSEWORK_STEPS_MAX} Teilschritte sind nicht vorgesehen.
          </p>
        ) : (
          <form onSubmit={add} className="flex flex-wrap gap-2">
            <label htmlFor={`${id}-step`} className="sr-only">
              Neuer Teilschritt für {item.title}
            </label>
            <input
              id={`${id}-step`}
              value={text}
              placeholder="Z. B. Aufgabe 1 und 2 lösen"
              onChange={(event) => setText(event.target.value)}
              className={`${FIELD} sm:w-64`}
            />
            <Button type="submit" variant="outline" size="sm">
              Hinzufügen
            </Button>
          </form>
        )}
      </div>
    </details>
  );
}

function moodleState(item: MoodleCourseItem): string {
  const grade = item.grade
    ? `, ${item.grade.points.toLocaleString("de-DE")} von ${item.grade.max.toLocaleString("de-DE")} Punkten`
    : "";
  return `${item.submitted ? "eingereicht" : "nicht eingereicht"}${grade}`;
}

/** Choose which Moodle assignments count as Prüfungsvorleistung; Moodle itself does not know. */
function MoodleImport({
  items,
  onImport,
  onCancel,
}: {
  items: MoodleCourseItem[];
  onImport: (ids: string[]) => void;
  onCancel: () => void;
}) {
  const [chosen, setChosen] = useState(() => items.map((item) => item.id));
  return (
    <form
      className="space-y-3 rounded-lg bg-muted p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onImport(chosen);
      }}
    >
      <fieldset className="space-y-1">
        <legend className="mb-1 text-meta font-semibold">
          Welche Abgaben aus Moodle zählen als Prüfungsvorleistung?
        </legend>
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-2 text-body">
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              checked={chosen.includes(item.id)}
              onChange={(event) =>
                setChosen((current) =>
                  event.target.checked
                    ? [...current, item.id]
                    : current.filter((id) => id !== item.id),
                )
              }
            />
            <span className="min-w-0 break-words">
              {item.title}
              <span className="text-muted-foreground tabular-nums">
                {" "}
                · {moodleState(item)}
                {item.dueAt && ` · Frist ${day(item.dueAt.slice(0, 10))}`}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="text-meta text-muted-foreground">
        Was als Prüfungsvorleistung zählt, steht im Modulhandbuch. Eingereichte
        Abgaben werden als erbracht übernommen; du kannst den Stand danach
        ändern.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={chosen.length === 0}>
          {chosen.length === 1
            ? "1 Abgabe übernehmen"
            : `${chosen.length} Abgaben übernehmen`}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

/**
 * Prüfungsvorleistungen of a module in the current semester (P5-13, US-25): Niklas enters what is required,
 * plans it (steps, effort) and keeps its state; assignments of the Moodle course can be taken over. The
 * admission follows DR-13. Display only – the projection does not use it.
 */
export function CourseworkCard({
  moduleId,
  title,
}: {
  moduleId: string;
  title: string;
}) {
  const all = useDemoStore((state) => state.coursework);
  const saveCoursework = useDemoStore((state) => state.saveCoursework);
  const removeCoursework = useDemoStore((state) => state.removeCoursework);
  const importMoodleCoursework = useDemoStore(
    (state) => state.importMoodleCoursework,
  );
  const course = useDemoStore((state) =>
    state.resources.moodle.data?.courses.find(
      (item) => item.moduleId === moduleId,
    ),
  );
  const rules = useDemoStore(selectRulesById);
  const items = useMemo(
    () => all.filter((item) => item.moduleId === moduleId),
    [all, moduleId],
  );
  // "new" for the add form, "moodle" for the import, otherwise the id of the entry being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const headingId = useId();
  const admission = examAdmission(items);
  const summary = summarizeCoursework(items, DEMO_DAY);
  const importable = unlinkedAssignments(items, course);

  return (
    <section className="space-y-2 p-4" aria-labelledby={headingId}>
      <h3 id={headingId} className="text-card-title">
        Prüfungsvorleistung
      </h3>
      {items.length === 0 && editing === null && (
        <p className="text-body text-muted-foreground">
          Für {title} ist keine Prüfungsvorleistung eingetragen. Steht im
          Modulhandbuch eine, trag sie hier ein und halte ihren Stand aktuell.
        </p>
      )}
      <AdmissionStatus admission={admission} />
      {items.length > 1 && (
        <p className="text-meta text-muted-foreground tabular-nums">
          {summary.done} von {summary.total} erbracht
          {summary.openEffortHours > 0 &&
            ` · ${hours(summary.openEffortHours)} für offene geplant`}
          {summary.nextDueAt && ` · nächste Frist ${day(summary.nextDueAt)}`}
        </p>
      )}
      {items.length > 0 && (
        <ul className="divide-y">
          {items.map((item) => {
            const moodle = linkedMoodleItem(item, course);
            const suggestion = suggestedStatus(item, moodle);
            return editing === item.id ? (
              <li key={item.id} className="py-2">
                <CourseworkForm
                  initial={item}
                  onSave={(text, dueAt, effortHours) => {
                    saveCoursework({
                      ...item,
                      title: text,
                      dueAt,
                      effortHours,
                    });
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2"
              >
                <span className="min-w-0">
                  <span className="block font-semibold break-words">
                    {item.title}
                  </span>
                  <span className="text-meta text-muted-foreground tabular-nums">
                    {[
                      item.dueAt && `Frist: ${day(item.dueAt)}`,
                      item.effortHours && `${hours(item.effortHours)} geplant`,
                      moodle && `Moodle: ${moodleState(moodle)}`,
                      item.moodleRef && !moodle && "aus Moodle übernommen",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <label className="sr-only" htmlFor={`${item.id}-status`}>
                    Stand von {item.title}
                  </label>
                  <select
                    id={`${item.id}-status`}
                    value={item.status}
                    onChange={(event) =>
                      saveCoursework({
                        ...item,
                        status: event.target.value as CourseworkStatus,
                      })
                    }
                    className="h-8 rounded-lg border border-input bg-card px-2 text-meta"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${item.title} bearbeiten`}
                    onClick={() => setEditing(item.id)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${item.title} löschen`}
                    onClick={() => removeCoursework(item.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </span>
                {suggestion && (
                  <p className="flex basis-full flex-wrap items-center gap-2 text-meta">
                    In Moodle ist die Abgabe eingereicht.
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`${item.title} als erbracht übernehmen`}
                      onClick={() =>
                        saveCoursework({ ...item, status: suggestion })
                      }
                    >
                      Als erbracht übernehmen
                    </Button>
                  </p>
                )}
                {/* Planning is for what is still open; finished entries keep the steps they have. */}
                {(item.status === "open" || (item.steps?.length ?? 0) > 0) && (
                  <Steps
                    item={item}
                    onChange={(steps) => saveCoursework({ ...item, steps })}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {editing === "new" && (
        <CourseworkForm
          onSave={(text, dueAt, effortHours) => {
            saveCoursework({
              moduleId,
              title: text,
              dueAt,
              effortHours,
              status: "open",
            });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
      {editing === "moodle" && (
        <MoodleImport
          items={importable}
          onImport={(ids) => {
            importMoodleCoursework(moduleId, ids);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
      {editing === null && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            Prüfungsvorleistung eintragen
          </Button>
          {importable.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing("moodle")}
            >
              <Download aria-hidden="true" />
              Aus Moodle übernehmen
            </Button>
          )}
        </div>
      )}
      {rules["DR-13"] && (
        <CitationList
          variant="footer"
          className="mt-0"
          citations={[rules["DR-13"].citation]}
        />
      )}
    </section>
  );
}
