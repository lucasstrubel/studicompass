import type {
  Deadline,
  InboxItem,
  MoodleCourse as Course,
  MoodleCourseItem,
  MoodleProgress,
} from "@/domain/types";
import { toInstant as instant } from "@/lib/instant";
import type { MoodleData } from "@/services/types";
import type {
  MoodleAssignment,
  MoodleCompletionStatus,
  MoodleCourse,
  MoodleDiscussion,
  MoodleGradeItem,
  MoodleSection,
} from "./schemas";

/** Everything read from one course, already checked against the schemas. */
export interface MoodleCourseSnapshot {
  course: MoodleCourse;
  assignments: MoodleAssignment[];
  /** Null when the site does not report completion for the course. */
  completion: MoodleCompletionStatus[] | null;
  announcements: MoodleDiscussion[];
  /** Null when the site does not offer the course page or the grades. */
  sections: MoodleSection[] | null;
  grades: MoodleGradeItem[] | null;
}

const PREVIEW_LENGTH = 120;

/** Unix seconds as an instant with the offset of the given time zone, like the example data. */
export function toInstant(seconds: number, timeZone: string): string {
  return instant(new Date(seconds * 1000), timeZone);
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

function assignmentItem(
  snapshot: MoodleCourseSnapshot,
  assignment: MoodleAssignment,
  timeZone: string,
  extra: Pick<MoodleCourseItem, "section" | "url">,
): MoodleCourseItem {
  const grade = snapshot.grades?.find(
    (item) =>
      item.itemmodule === "assign" &&
      item.iteminstance === assignment.id &&
      item.graderaw !== null,
  );
  return {
    id: `cm${assignment.cmid}`,
    kind: "assignment",
    title: assignment.name,
    signature: `${assignment.timemodified}:${assignment.duedate}`,
    submitted: isSubmitted(assignment, snapshot.completion),
    ...extra,
    ...(assignment.duedate > 0
      ? { dueAt: toInstant(assignment.duedate, timeZone) }
      : {}),
    ...(grade?.graderaw != null
      ? { grade: { points: grade.graderaw, max: grade.grademax } }
      : {}),
  };
}

/** The course page as a flat list: files, assignments and other activities, then announcements. */
function course(
  snapshot: MoodleCourseSnapshot,
  siteUrl: string,
  timeZone: string,
): Course {
  const { assignments, announcements, sections } = snapshot;
  const items: MoodleCourseItem[] = [];
  const listed = new Set<number>();
  for (const section of sections ?? [])
    for (const module of section.modules) {
      // The announcements forum is listed through its discussions below.
      if (!module.uservisible || module.modname === "forum") continue;
      const extra = {
        section: section.name,
        ...(module.url ? { url: module.url } : {}),
      };
      const assignment = assignments.find((item) => item.cmid === module.id);
      if (assignment) {
        listed.add(assignment.cmid);
        items.push(assignmentItem(snapshot, assignment, timeZone, extra));
        continue;
      }
      const files = module.contents.filter((item) => item.type === "file");
      items.push({
        id: `cm${module.id}`,
        kind: files.length > 0 ? "file" : "activity",
        title: module.name,
        signature: files
          .map((item) => `${item.filename}@${item.timemodified ?? 0}`)
          .sort()
          .join("|"),
        ...extra,
      });
    }
  // Without the course page the assignments are still known.
  for (const assignment of assignments)
    if (!listed.has(assignment.cmid))
      items.push(assignmentItem(snapshot, assignment, timeZone, {}));
  for (const item of announcements)
    items.push({
      id: `d${item.discussion}`,
      kind: "announcement",
      title: item.name,
      signature: `${item.timemodified}`,
    });
  return {
    id: `${snapshot.course.id}`,
    title: snapshot.course.fullname,
    url: `${siteUrl.replace(/\/+$/, "")}/course/view.php?id=${snapshot.course.id}`,
    items,
    ...(snapshot.course.idnumber ? { moduleId: snapshot.course.idnumber } : {}),
  };
}

/**
 * Moodle → domain model. A course belongs to the module whose id is its `idnumber`; without one its
 * deadlines and announcements still appear, only without a module.
 */
export function mapMoodle(
  snapshots: MoodleCourseSnapshot[],
  now: Date,
  timeZone: string,
  siteUrl = "",
): MoodleData {
  return {
    courses: snapshots.map((snapshot) => course(snapshot, siteUrl, timeZone)),
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
