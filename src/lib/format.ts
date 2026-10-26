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
