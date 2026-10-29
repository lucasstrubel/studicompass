import { DEMO_TIME_ZONE } from "@/config/demo";
import { deadlineInstant } from "./deadline-groups";

export const DEADLINE_TITLE_MAX_LENGTH = 80;

/** UTC offset of a German calendar day, e.g. "+01:00" in winter. */
function offsetOn(date: string) {
  return (
    new Intl.DateTimeFormat("en", {
      timeZone: DEMO_TIME_ZONE,
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date(`${date}T12:00:00Z`))
      .find((part) => part.type === "timeZoneName")
      ?.value.replace("GMT", "") || "+00:00"
  );
}

/** Form values → stored due date: date only without a time, otherwise an instant in German time. */
export function toDueAt(date: string, time: string) {
  return time ? `${date}T${time}:00${offsetOn(date)}` : date;
}

/** Stored due date → form values (date and optional time, as written in German time). */
export function fromDueAt(dueAt: string) {
  return {
    date: dueAt.slice(0, 10),
    time: dueAt.length > 10 ? dueAt.slice(11, 16) : "",
  };
}

export interface DeadlineInput {
  title: string;
  date: string;
  time: string;
}
export type DeadlineErrors = Partial<Record<keyof DeadlineInput, string>>;

/**
 * Checks an own date (US-21): a title, a real date and no date before the demo time. A date-only entry
 * counts until the end of its day, so "today" stays allowed.
 */
export function validateDeadline(input: DeadlineInput, now: Date) {
  const errors: DeadlineErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = "Gib einen Titel ein.";
  else if (title.length > DEADLINE_TITLE_MAX_LENGTH)
    errors.title = `Höchstens ${DEADLINE_TITLE_MAX_LENGTH} Zeichen.`;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    Number.isNaN(Date.parse(input.date))
  )
    errors.date = "Wähle ein Datum.";
  else if (input.time && !/^\d{2}:\d{2}$/.test(input.time))
    errors.time = "Gib die Uhrzeit als HH:MM ein.";
  else if (
    Date.parse(deadlineInstant(toDueAt(input.date, input.time))) < now.getTime()
  )
    errors.date = "Der Termin liegt vor dem heutigen Demo-Datum (25.01.2027).";
  return errors;
}
