import { format } from "date-fns";
import { de } from "date-fns/locale";
import { DEMO_TIME_ZONE } from "@/config/demo";

// Splits an instant into the date and time it has in the demo's time zone.
const demoWallClock = new Intl.DateTimeFormat("en-US", {
  timeZone: DEMO_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/**
 * The instant as a local Date that carries its German date and time. date-fns formats in the device's
 * time zone; without this, a device in Tokyo would show DEMO_NOW (Monday evening) as Tuesday.
 */
function inDemoTimeZone(date: Date): Date {
  const parts = demoWallClock.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return new Date(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
}

/** Date as shown in the UI (KONZEPT §10.2), e.g. "Mo, 25.01.2027", in German time on every device. */
export function formatDate(date: Date): string {
  return format(inDemoTimeZone(date), "EEEEEE, dd.MM.yyyy", { locale: de });
}

/** Date and time, e.g. "Di, 26.01.2027, 23:59". */
export function formatDateTime(date: Date): string {
  return format(inDemoTimeZone(date), "EEEEEE, dd.MM.yyyy, HH:mm", {
    locale: de,
  });
}

/** Date and time without the year, e.g. "Di, 26.01., 23:59" (deadline chips). */
export function formatShortDateTime(date: Date): string {
  return format(inDemoTimeZone(date), "EEEEEE, dd.MM., HH:mm", { locale: de });
}

/** Time of day, e.g. "23:59". */
export function formatTime(date: Date): string {
  return format(inDemoTimeZone(date), "HH:mm", { locale: de });
}

const DAY_MS = 24 * 60 * 60 * 1000;

function calendarDay(date: Date): number {
  const local = inDemoTimeZone(date);
  return Date.UTC(local.getFullYear(), local.getMonth(), local.getDate());
}

/** "heute", "morgen", "übermorgen" or the date, seen from `now` in German time. */
export function formatRelativeDay(date: Date, now: Date): string {
  const days = Math.round((calendarDay(date) - calendarDay(now)) / DAY_MS);
  if (days === 0) return "heute";
  if (days === 1) return "morgen";
  if (days === 2) return "übermorgen";
  return formatDate(date);
}

/** Remaining time as in KONZEPT §10.2, e.g. "noch 1 Tag, 4 Std."; "abgelaufen" once it has passed. */
export function formatCountdown(until: Date, now: Date): string {
  const remaining = until.getTime() - now.getTime();
  if (remaining <= 0) return "abgelaufen";
  const minutes = Math.floor(remaining / 60_000);
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const rest = minutes % 60;
  if (days > 0) {
    const dayText = `${days} ${days === 1 ? "Tag" : "Tage"}`;
    return hours > 0 ? `noch ${dayText}, ${hours} Std.` : `noch ${dayText}`;
  }
  if (hours > 0) return `noch ${hours} Std., ${rest} Min.`;
  return `noch ${Math.max(rest, 1)} Min.`;
}

const gradeFormat = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Grade with one decimal and a comma, e.g. "2,4". */
export function formatGrade(grade: number): string {
  return gradeFormat.format(grade);
}
