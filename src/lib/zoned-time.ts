import { DEMO_TIME_ZONE } from "@/config/demo";

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
 */
export function zonedInstant(date: string, time: string) {
  const guess = offsetAt(new Date(`${date}T12:00:00Z`));
  const offset = offsetAt(new Date(`${date}T${time}:00${guess}`));
  return `${date}T${time}:00${offset}`;
}

/** Inclusive end of a date-only deadline, with the offset of that German calendar day. */
export function deadlineInstant(value: string) {
  if (value.length !== 10) return value;
  return `${value}T23:59:59${offsetAt(new Date(`${value}T23:59:59Z`))}`;
}
