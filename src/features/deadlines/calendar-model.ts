import { DEMO_TIME_ZONE } from "@/config/demo";
import type { AcademicState, AgendaItem } from "@/domain/types";
import { deadlineInstant } from "@/lib/zoned-time";

/** Exam dates are calendar events, separate from the deadline export and next-deadline widget. */
export interface CalendarExamItem extends Omit<AgendaItem, "origin"> {
  origin: "exam";
}
export type CalendarItem = AgendaItem | CalendarExamItem;

const DAY_MS = 86400000;
const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: DEMO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Keep all-day dates literal; convert instants to their German calendar day. */
export function calendarDay(value: string): string {
  return value.length === 10 ? value : dayFormat.format(new Date(value));
}

/** Calendar arithmetic uses UTC dates, so a daylight-saving switch cannot skip or repeat a day. */
export function addCalendarDays(day: string, amount: number): string {
  return new Date(Date.parse(`${day}T12:00:00Z`) + amount * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** Move by whole months, keeping the day where possible (31 January → 28 February). */
export function shiftCalendarMonth(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  const target = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12),
  );
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), last));
  return target.toISOString().slice(0, 10);
}

/** Complete Monday–Sunday rows, including adjacent-month days for continuous keyboard navigation. */
export function monthDays(month: string): string[] {
  const first = `${month}-01`;
  const weekday = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7;
  const next = shiftCalendarMonth(first, 1);
  const count = Math.round((Date.parse(next) - Date.parse(first)) / DAY_MS);
  const cells = Math.ceil((weekday + count) / 7) * 7;
  return Array.from({ length: cells }, (_, index) =>
    addCalendarDays(first, index - weekday),
  );
}

/** Deadline data comes through the store; exam dates respect simulated withdrawals. */
export function calendarItems(
  agenda: AgendaItem[],
  academic: AcademicState | null,
): CalendarItem[] {
  const exams: CalendarExamItem[] = (academic?.exams ?? []).flatMap((exam) => {
    if (!exam.date || exam.status === "withdrawn") return [];
    const module = academic?.modules.find((item) => item.id === exam.moduleId);
    return [
      {
        id: `exam-${exam.id}`,
        origin: "exam",
        title: `Prüfung ${module?.title ?? exam.moduleId}`,
        dueAt: exam.date,
        type: "Prüfung",
        channel: "pos",
        moduleId: exam.moduleId,
      },
    ];
  });
  return [...agenda, ...exams].sort(
    (left, right) =>
      Date.parse(deadlineInstant(left.dueAt)) -
      Date.parse(deadlineInstant(right.dueAt)),
  );
}

export function itemsOnDay(items: CalendarItem[], day: string): CalendarItem[] {
  return items.filter((item) => {
    const end = calendarDay(item.dueAt);
    const start = item.startsAt ? calendarDay(item.startsAt) : end;
    return start <= day && day <= end;
  });
}
