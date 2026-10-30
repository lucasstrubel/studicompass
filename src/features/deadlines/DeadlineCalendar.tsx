import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_DAY } from "@/lib/demo-day";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  addCalendarDays,
  itemsOnDay,
  monthDays,
  shiftCalendarMonth,
  type CalendarItem,
} from "./calendar-model";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const monthFormat = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Calendar selection is local; switching list/calendar is represented in the URL by the page. */
export function DeadlineCalendar({
  items,
  loading,
  incomplete,
  renderItem,
}: {
  items: CalendarItem[];
  loading: boolean;
  incomplete: boolean;
  renderItem: (item: CalendarItem) => ReactNode;
}) {
  const [selected, setSelected] = useState(DEMO_DAY);
  const [month, setMonth] = useState(DEMO_DAY.slice(0, 7));
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const focusDay = useRef(false);
  const titleId = useId();
  const helpId = useId();
  const days = monthDays(month);
  useLayoutEffect(() => {
    if (!focusDay.current) return;
    buttons.current.get(selected)?.focus();
    focusDay.current = false;
  }, [selected, month]);
  const selectedItems = itemsOnDay(items, selected);
  const countLabel = (count: number) =>
    loading
      ? "Einträge werden geladen"
      : incomplete
        ? "Angaben unvollständig"
        : `${count} ${count === 1 ? "Eintrag" : "Einträge"}`;
  const monthLabel = monthFormat.format(new Date(`${month}-01T12:00:00Z`));
  const select = (day: string) => {
    setMonth(day.slice(0, 7));
    setSelected(day);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const weekday = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    const actions: Record<string, (() => string) | undefined> = {
      ArrowLeft: () => addCalendarDays(day, -1),
      ArrowRight: () => addCalendarDays(day, 1),
      ArrowUp: () => addCalendarDays(day, -7),
      ArrowDown: () => addCalendarDays(day, 7),
      Home: () => addCalendarDays(day, -weekday),
      End: () => addCalendarDays(day, 6 - weekday),
      PageUp: () => shiftCalendarMonth(day, -1),
      PageDown: () => shiftCalendarMonth(day, 1),
    };
    const target = actions[event.key];
    if (!target) return;
    event.preventDefault();
    const next = target();
    focusDay.current = true;
    select(next);
  };
  return (
    <div className="min-w-0 space-y-5">
      <section
        aria-labelledby={titleId}
        className="min-w-0 rounded-xl border bg-card p-3 sm:p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id={titleId} aria-live="polite" className="text-section-title">
            {monthLabel}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Vorheriger Monat"
              onClick={() => select(shiftCalendarMonth(selected, -1))}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => select(DEMO_DAY)}>
              Heute
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Nächster Monat"
              onClick={() => select(shiftCalendarMonth(selected, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
        <p id={helpId} className="mb-3 text-meta text-muted-foreground">
          Heute im Demo-Szenario:{" "}
          {formatDate(new Date(`${DEMO_DAY}T12:00:00Z`))}. Wähle einen Tag. Mit
          den Pfeiltasten wechselst du den Tag, mit Bild auf/ab den Monat.
        </p>
        <table
          aria-labelledby={titleId}
          aria-describedby={helpId}
          className="w-full table-fixed border-separate border-spacing-0.5"
        >
          <thead>
            <tr>
              {WEEKDAYS.map((day) => (
                <th
                  key={day}
                  scope="col"
                  className="py-2 text-meta font-semibold"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: days.length / 7 }, (_, week) => (
              <tr key={week}>
                {days.slice(week * 7, week * 7 + 7).map((day) => {
                  const entries = itemsOnDay(items, day);
                  const currentMonth = day.startsWith(month);
                  const label = `${formatDate(new Date(`${day}T12:00:00Z`))}${day === DEMO_DAY ? ", heute" : ""}, ${countLabel(entries.length)}`;
                  return (
                    <td key={day} className="align-top">
                      <button
                        type="button"
                        ref={(node) => {
                          if (node) buttons.current.set(day, node);
                          else buttons.current.delete(day);
                        }}
                        aria-label={label}
                        aria-pressed={selected === day}
                        aria-current={day === DEMO_DAY ? "date" : undefined}
                        tabIndex={selected === day ? 0 : -1}
                        onClick={() => select(day)}
                        onKeyDown={(event) => onKeyDown(event, day)}
                        className={cn(
                          "flex min-h-12 w-full min-w-0 flex-col rounded-lg border border-transparent p-1 text-left hover:bg-muted sm:min-h-24 sm:p-2",
                          !currentMonth && "text-muted-foreground",
                          selected === day && "border-accent-strong bg-muted",
                          day === DEMO_DAY && "font-semibold",
                        )}
                      >
                        <span className="text-meta tabular-nums">
                          {Number(day.slice(-2))}
                        </span>
                        {entries.length > 0 && (
                          <>
                            <span
                              aria-hidden="true"
                              className="mt-1 flex gap-0.5 sm:hidden"
                            >
                              {entries.slice(0, 3).map((item) => (
                                <span
                                  key={item.id}
                                  className="size-1 rounded-full bg-tone-blue"
                                />
                              ))}
                            </span>
                            <span
                              aria-hidden="true"
                              className="mt-1 hidden w-full min-w-0 space-y-1 sm:block"
                            >
                              {entries.slice(0, 2).map((item) => (
                                <span
                                  key={item.id}
                                  className="block truncate rounded bg-tone-blue-soft px-1 text-meta text-foreground"
                                >
                                  {item.title}
                                </span>
                              ))}
                              {entries.length > 2 && (
                                <span className="block text-meta">
                                  +{entries.length - 2} weitere
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section aria-label="Einträge am ausgewählten Tag" className="space-y-3">
        <h2 className="text-section-title" aria-live="polite">
          {formatDate(new Date(`${selected}T12:00:00Z`))} ·{" "}
          {countLabel(selectedItems.length)}
        </h2>
        {selectedItems.length ? (
          <ul className="space-y-3">{selectedItems.map(renderItem)}</ul>
        ) : !loading && !incomplete ? (
          <p className="text-body text-muted-foreground">
            Keine Einträge an diesem Tag.
          </p>
        ) : null}
      </section>
    </div>
  );
}
