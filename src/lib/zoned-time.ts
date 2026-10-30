import { DEMO_TIME_ZONE } from "@/config/demo";

const wallClock = new Intl.DateTimeFormat("en", {
  timeZone: DEMO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** UTC offset of German time at an instant, e.g. "+01:00" in winter. */
function offsetAt(instant: Date) {
  return (
    new Intl.DateTimeFormat("en", {
      timeZone: DEMO_TIME_ZONE,
      timeZoneName: "longOffset",
    })
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")
      ?.value.replace("GMT", "") || "+00:00"
  );
}

/**
 * A German wall-clock time as an ISO instant with its offset (P5-13 review): the offset belongs to that
 * moment, not to the day, so 01:30 on the day clocks go forward keeps +01:00.
 * Returns null when the local time does not exist, instead of silently shifting it across the DST gap.
 */
export function zonedInstant(date: string, time: string): string | null {
  try {
    const guess = offsetAt(new Date(`${date}T12:00:00Z`));
    const offset = offsetAt(new Date(`${date}T${time}:00${guess}`));
    const value = `${date}T${time}:00${offset}`;
    const parts = wallClock.formatToParts(new Date(value));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value;
    const local = `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
    return local === `${date}T${time}` ? value : null;
  } catch {
    return null;
  }
}

/** Inclusive end of a date-only deadline, with the offset of that German calendar day. */
export function deadlineInstant(value: string) {
  if (value.length !== 10) return value;
  return `${value}T23:59:59${offsetAt(new Date(`${value}T23:59:59Z`))}`;
}
