import { DEMO_TIME_ZONE } from "@/config/demo";

function day(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DEMO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

/** Inclusive end of a date-only deadline, with the offset of that German calendar day. */
export function deadlineInstant(value: string) {
  if (value.length !== 10) return value;
  const offset =
    new Intl.DateTimeFormat("en", {
      timeZone: DEMO_TIME_ZONE,
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date(`${value}T12:00:00Z`))
      .find((part) => part.type === "timeZoneName")
      ?.value.replace("GMT", "") ?? "+00:00";
  return `${value}T23:59:59${offset}`;
}
/** Calendar weeks start on Monday in the demo time zone, independently of the device. */
export function groupDeadlines<T extends { dueAt: string }>(
  deadlines: T[],
  now: Date,
) {
  const today = day(now);
  const midnight = Date.parse(`${today}T00:00:00Z`);
  const weekday = new Date(midnight).getUTCDay();
  const weekEnd = new Date(midnight + ((7 - weekday) % 7) * 86400000)
    .toISOString()
    .slice(0, 10);
  const monthEnd = new Date(midnight + 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  const future = deadlines.filter((item) =>
    item.dueAt.length === 10
      ? item.dueAt >= today
      : Date.parse(item.dueAt) >= now.getTime(),
  );
  return [
    {
      title: "Diese Woche",
      items: future.filter((item) => day(new Date(item.dueAt)) <= weekEnd),
    },
    {
      title: "Nächste 30 Tage",
      items: future.filter(
        (item) =>
          day(new Date(item.dueAt)) > weekEnd &&
          day(new Date(item.dueAt)) <= monthEnd,
      ),
    },
    {
      title: "Später",
      items: future.filter((item) => day(new Date(item.dueAt)) > monthEnd),
    },
  ];
}
