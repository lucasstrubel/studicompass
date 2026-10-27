import { APP_NAME, DEMO_NOW } from "@/config/demo";
import type { Deadline } from "@/domain/types";

function escapeText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}
function utc(value: string | Date) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}
/** RFC 5545 §3.1: 75 octets per physical line; never split a UTF-8 character. */
function fold(value: string) {
  let line = "";
  let bytes = 0;
  const lines: string[] = [];
  const encoder = new TextEncoder();
  for (const character of value) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      lines.push(line);
      line = " ";
      bytes = 1;
    }
    line += character;
    bytes += size;
  }
  return [...lines, line].join("\r\n");
}
function followingDay(value: string) {
  return new Date(Date.parse(`${value}T00:00:00Z`) + 86400000)
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");
}

/** RFC 5545: timed deadlines are UTC instants; date-only deadlines are inclusive all-day events. */
export function deadlinesToIcs(deadlines: Deadline[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escapeText(APP_NAME)}//Demo//DE`,
    "CALSCALE:GREGORIAN",
  ];
  for (const deadline of deadlines) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${encodeURIComponent(deadline.id)}@studicompass.example`,
      `DTSTAMP:${utc(DEMO_NOW)}`,
    );
    if (/^\d{4}-\d{2}-\d{2}$/.test(deadline.dueAt)) {
      lines.push(
        `DTSTART;VALUE=DATE:${(deadline.startsAt ?? deadline.dueAt).replaceAll("-", "")}`,
        `DTEND;VALUE=DATE:${followingDay(deadline.dueAt)}`,
      );
    } else lines.push(`DTSTART:${utc(deadline.startsAt ?? deadline.dueAt)}`);
    lines.push(
      `SUMMARY:${escapeText(deadline.title)}`,
      `DESCRIPTION:${escapeText(`Beispiel – ${APP_NAME} Demo. Kanal: ${deadline.channel}. Verbindlich sind die Angaben im Originalsystem.`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  return [...lines, "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}

export function downloadDeadlines(
  deadlines: Deadline[],
  filename = "studienfristen.ics",
) {
  const url = URL.createObjectURL(
    new Blob([deadlinesToIcs(deadlines)], {
      type: "text/calendar;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
