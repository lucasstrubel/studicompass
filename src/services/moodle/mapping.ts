import type { Deadline, InboxItem, MoodleProgress } from "@/domain/types";
import type { MoodleData } from "@/services/types";
import type {
  MoodleAssignment,
  MoodleCompletionStatus,
  MoodleCourse,
  MoodleDiscussion,
} from "./schemas";

/** Everything read from one course, already checked against the schemas. */
export interface MoodleCourseSnapshot {
  course: MoodleCourse;
  assignments: MoodleAssignment[];
  /** Null when the site does not report completion for the course. */
  completion: MoodleCompletionStatus[] | null;
  announcements: MoodleDiscussion[];
}

const PREVIEW_LENGTH = 120;

/** Unix seconds as an instant with the offset of the given time zone, like the example data. */
export function toInstant(seconds: number, timeZone: string): string {
  const date = new Date(seconds * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const offset = part("timeZoneName").replace("GMT", "") || "+00:00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}${offset}`;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Moodle delivers forum posts as HTML; the app shows plain text only and never renders the markup. */
export function plainText(html: string): string {
  return html
    .replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();
}

function preview(text: string): string {
  if (text.length <= PREVIEW_LENGTH) return text;
  const cut = text.slice(0, PREVIEW_LENGTH);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1))} …`;
}

function isSubmitted(
  assignment: MoodleAssignment,
  completion: MoodleCompletionStatus[] | null,
): boolean {
  const status = completion?.find((item) => item.cmid === assignment.cmid);
  return Boolean(status && status.state > 0);
}

function shortDate(seconds: number, timeZone: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(seconds * 1000));
}

function progress(
  snapshot: MoodleCourseSnapshot,
  now: Date,
  timeZone: string,
): MoodleProgress | null {
  const { course, assignments, completion } = snapshot;
  const tracked = assignments.filter((assignment) =>
    completion?.some(
      (item) => item.cmid === assignment.cmid && item.hascompletion,
    ),
  );
  if (!course.idnumber || tracked.length === 0) return null;
  const completed = tracked.filter((item) =>
    isSubmitted(item, completion),
  ).length;
  const next = tracked
    .filter(
      (item) =>
        !isSubmitted(item, completion) && item.duedate * 1000 > now.getTime(),
    )
    .sort((left, right) => left.duedate - right.duedate)[0] as
    MoodleAssignment | undefined;
  const detail = next
    ? `nächste Abgabe bis ${shortDate(next.duedate, timeZone)}`
    : completed === tracked.length
      ? "alle Abgaben eingereicht"
      : undefined;
  if (tracked.length === 1)
    return {
      moduleId: course.idnumber,
      label: completed === 1 ? "Abgabe eingereicht" : "Abgabe offen",
      ...(detail && completed === 0 ? { detail } : {}),
    };
  return {
    moduleId: course.idnumber,
    label: `Abgaben ${completed}/${tracked.length}`,
    completed,
    total: tracked.length,
    ...(detail ? { detail } : {}),
  };
}

function deadlines(
  snapshot: MoodleCourseSnapshot,
  now: Date,
  timeZone: string,
): Deadline[] {
  const { course, assignments, completion } = snapshot;
  return assignments
    .filter(
      (item) =>
        item.duedate * 1000 > now.getTime() && !isSubmitted(item, completion),
    )
    .map((item) => ({
      id: `moodle-assign-${item.id}`,
      title: `Abgabe ${item.name} ${course.fullname}`,
      dueAt: toInstant(item.duedate, timeZone),
      type: "Abgabe",
      channel: "moodle" as const,
      ...(course.idnumber ? { moduleId: course.idnumber } : {}),
    }));
}

function inbox(snapshot: MoodleCourseSnapshot, timeZone: string): InboxItem[] {
  const { course, announcements } = snapshot;
  return announcements.map((item) => {
    const body = plainText(item.message);
    return {
      id: `moodle-discussion-${item.discussion}`,
      channel: "moodle" as const,
      sender: course.fullname,
      subject: item.name,
      preview: preview(body),
      body: `${body} ${item.userfullname}`.trim(),
      receivedAt: toInstant(item.timemodified, timeZone),
      read: false,
      relevance: "normal" as const,
      ...(course.idnumber ? { moduleId: course.idnumber } : {}),
    };
  });
}

/**
 * Moodle → domain model. A course belongs to the module whose id is its `idnumber`; without one its
 * deadlines and announcements still appear, only without a module.
 */
export function mapMoodle(
  snapshots: MoodleCourseSnapshot[],
  now: Date,
  timeZone: string,
): MoodleData {
  return {
    progress: snapshots.flatMap(
      (snapshot) => progress(snapshot, now, timeZone) ?? [],
    ),
    deadlines: snapshots
      .flatMap((snapshot) => deadlines(snapshot, now, timeZone))
      .sort((left, right) => left.dueAt.localeCompare(right.dueAt)),
    inbox: snapshots
      .flatMap((snapshot) => inbox(snapshot, timeZone))
      .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt)),
  };
}
