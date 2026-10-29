import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdmissionStatus } from "@/components/common/AdmissionStatus";
import { CitationList } from "@/components/common/CitationList";
import { Button } from "@/components/ui/button";
import { examAdmission } from "@/domain/coursework";
import type { Coursework, CourseworkStatus } from "@/domain/types";
import { DEMO_DAY } from "@/lib/demo-day";
import { formatDate } from "@/lib/format";
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

function CourseworkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Coursework;
  onSave: (title: string, dueAt: string | undefined) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [due, setDue] = useState(initial?.dueAt ?? "");
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
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
    onSave(text, due || undefined);
  };
  return (
    <form
      noValidate
      onSubmit={submit}
      className="space-y-3 rounded-lg border p-3"
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
          onChange={(event) => setTitle(event.target.value)}
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
      <div className="space-y-1">
        <label htmlFor={`${id}-due`} className="text-meta font-semibold">
          Frist (optional)
        </label>
        <input
          id={`${id}-due`}
          type="date"
          value={due}
          min={DEMO_DAY}
          onChange={(event) => setDue(event.target.value)}
          className={FIELD}
        />
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

/**
 * Prüfungsvorleistungen of a module in the current semester (P5-13, US-25): Niklas enters what is required
 * and keeps its state; the admission follows DR-13. Display only – the projection does not use it.
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
  const rules = useDemoStore(selectRulesById);
  const items = useMemo(
    () => all.filter((item) => item.moduleId === moduleId),
    [all, moduleId],
  );
  // "new" for the add form, otherwise the id of the entry being edited.
  const [editing, setEditing] = useState<string | null>(null);
  const headingId = useId();
  const admission = examAdmission(items);

  return (
    <section
      className="space-y-3 rounded-xl border bg-card p-4"
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="text-card-title">
        Prüfungsvorleistung
      </h3>
      {items.length === 0 && editing !== "new" && (
        <p className="text-body text-muted-foreground">
          Für {title} ist keine Prüfungsvorleistung eingetragen. Steht im
          Modulhandbuch eine, trag sie hier ein und halte ihren Stand aktuell.
        </p>
      )}
      <AdmissionStatus admission={admission} />
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) =>
            editing === item.id ? (
              <li key={item.id}>
                <CourseworkForm
                  initial={item}
                  onSave={(text, dueAt) => {
                    saveCoursework({ ...item, title: text, dueAt });
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <span className="min-w-0">
                  <span className="block font-semibold break-words">
                    {item.title}
                  </span>
                  {item.dueAt && (
                    <span className="text-meta text-muted-foreground tabular-nums">
                      Frist: {formatDate(new Date(`${item.dueAt}T12:00:00Z`))}
                    </span>
                  )}
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
              </li>
            ),
          )}
        </ul>
      )}
      {editing === "new" ? (
        <CourseworkForm
          onSave={(text, dueAt) => {
            saveCoursework({ moduleId, title: text, dueAt, status: "open" });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" />
          Prüfungsvorleistung eintragen
        </Button>
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
