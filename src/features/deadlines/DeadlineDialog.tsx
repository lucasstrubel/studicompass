import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEMO_NOW } from "@/config/demo";
import type { PersonalDeadline, PersonalDeadlineKind } from "@/domain/types";
import { DEMO_DAY } from "@/lib/demo-day";
import { PERSONAL_KIND_LABELS, selectAcademicState } from "@/store/selectors";
import { useDemoStore } from "@/store/use-demo-store";
import {
  fromDueAt,
  toDueAt,
  validateDeadline,
  type DeadlineErrors,
} from "./deadline-input";

const FIELD =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-body placeholder:text-muted-foreground aria-invalid:border-status-critical";

function FieldError({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="text-meta text-status-critical-foreground">
      {text}
    </p>
  ) : null;
}

/**
 * Add or edit an own date (P5-13, US-21): title, date, optional time, kind and module. Dates before the
 * demo time are refused; errors show at their field and the first one takes the focus.
 */
export function DeadlineDialog({
  open,
  onOpenChange,
  entry,
  onSaved,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The entry to edit; undefined adds a new one. */
  entry?: PersonalDeadline;
  onSaved: (title: string) => void;
  /** The button that opened the dialog; it gets the focus back (P5-13 review, no Radix trigger). */
  returnFocus?: () => HTMLElement | null;
}) {
  const id = useId();
  const academic = useDemoStore(selectAcademicState);
  const savePersonalDeadline = useDemoStore(
    (state) => state.savePersonalDeadline,
  );
  const initial = entry ? fromDueAt(entry.dueAt) : { date: DEMO_DAY, time: "" };
  const [title, setTitle] = useState(entry?.title ?? "");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [kind, setKind] = useState<PersonalDeadlineKind>(
    entry?.kind ?? "submission",
  );
  const [moduleId, setModuleId] = useState(entry?.moduleId ?? "");
  const [errors, setErrors] = useState<DeadlineErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const modules = [...(academic?.modules ?? [])].sort(
    (left, right) => left.plannedSemester - right.plannedSemester,
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateDeadline({ title, date, time }, DEMO_NOW);
    setErrors(found);
    const first = (["title", "date", "time"] as const).find(
      (field) => found[field],
    );
    if (first) {
      ({ title: titleRef, date: dateRef, time: timeRef })[
        first
      ].current?.focus();
      return;
    }
    const dueAt = toDueAt(date, time);
    if (dueAt === null) return;
    if (
      savePersonalDeadline({
        id: entry?.id,
        title,
        dueAt,
        kind,
        moduleId: moduleId || undefined,
      })
    ) {
      onSaved(title.trim());
      onOpenChange(false);
    }
  };
  const describedBy = (field: keyof DeadlineErrors) =>
    errors[field] ? `${id}-${field}-error` : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onCloseAutoFocus={(event) => {
          const target = returnFocus?.();
          if (!target?.isConnected) return;
          event.preventDefault();
          target.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-section-title">
            {entry ? "Termin bearbeiten" : "Termin hinzufügen"}
          </DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Eigene Termine stehen nur in diesem Browser und erscheinen in den
            Fristen, im Kalender und bei „Nächste Frist“.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor={`${id}-title`} className="text-meta font-semibold">
              Titel
            </label>
            <input
              ref={titleRef}
              id={`${id}-title`}
              value={title}
              placeholder="Z. B. Abgabe Übungsblatt 12 Statistik"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={describedBy("title")}
              onChange={(event) => setTitle(event.target.value)}
              className={FIELD}
            />
            <FieldError id={`${id}-title-error`} text={errors.title} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor={`${id}-date`} className="text-meta font-semibold">
                Datum
              </label>
              <input
                ref={dateRef}
                id={`${id}-date`}
                type="date"
                value={date}
                min={DEMO_DAY}
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={describedBy("date")}
                onChange={(event) => setDate(event.target.value)}
                className={FIELD}
              />
              <FieldError id={`${id}-date-error`} text={errors.date} />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${id}-time`} className="text-meta font-semibold">
                Uhrzeit (optional)
              </label>
              <input
                ref={timeRef}
                id={`${id}-time`}
                type="time"
                value={time}
                aria-invalid={errors.time ? true : undefined}
                aria-describedby={describedBy("time")}
                onChange={(event) => setTime(event.target.value)}
                className={FIELD}
              />
              <FieldError id={`${id}-time-error`} text={errors.time} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor={`${id}-kind`} className="text-meta font-semibold">
                Art
              </label>
              <select
                id={`${id}-kind`}
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as PersonalDeadlineKind)
                }
                className={FIELD}
              >
                {Object.entries(PERSONAL_KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor={`${id}-module`}
                className="text-meta font-semibold"
              >
                Modul (optional)
              </label>
              <select
                id={`${id}-module`}
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className={FIELD}
              >
                <option value="">Kein Modul</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit">Speichern</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
