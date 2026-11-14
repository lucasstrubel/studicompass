import type {
  Coursework,
  CourseworkStatus,
  ExamAdmission,
  MoodleCourse,
  MoodleCourseItem,
} from "./types";

/**
 * Admission to the exam from the module's Prüfungsvorleistungen (DR-13, P5-13): none entered → "none";
 * one not achieved → "notAdmitted"; all achieved → "admitted"; otherwise "open". Display only – the
 * projection does not use it.
 */
export function examAdmission(items: Coursework[]): ExamAdmission {
  if (items.length === 0) return "none";
  if (items.some((item) => item.status === "failed")) return "notAdmitted";
  if (items.every((item) => item.status === "done")) return "admitted";
  return "open";
}

/** Upper bounds of the own plan of a Prüfungsvorleistung. */
export const COURSEWORK_STEPS_MAX = 12;
export const COURSEWORK_EFFORT_MAX = 500;

export interface CourseworkSummary {
  total: number;
  done: number;
  failed: number;
  open: number;
  /** Planned hours of the entries that are still open. */
  openEffortHours: number;
  /** Earliest due date (date only) among the open entries that is not past. */
  nextDueAt?: string;
}

/** Where a module stands with its Prüfungsvorleistungen; `today` is a date like "2027-01-25". */
export function summarizeCoursework(
  items: Coursework[],
  today: string,
): CourseworkSummary {
  const open = items.filter((item) => item.status === "open");
  const nextDueAt = open
    .flatMap((item) => (item.dueAt && item.dueAt >= today ? [item.dueAt] : []))
    .sort()[0] as string | undefined;
  return {
    total: items.length,
    done: items.filter((item) => item.status === "done").length,
    failed: items.filter((item) => item.status === "failed").length,
    open: open.length,
    openEffortHours: open.reduce(
      (sum, item) => sum + (item.effortHours ?? 0),
      0,
    ),
    ...(nextDueAt ? { nextDueAt } : {}),
  };
}

/** Reference from an entry to the Moodle assignment it was taken from. */
export function moodleRef(course: MoodleCourse, item: MoodleCourseItem) {
  return `${course.id}/${item.id}`;
}

/** The assignment an entry was taken from, if the course still has it. */
export function linkedMoodleItem(
  entry: Coursework,
  course: MoodleCourse | undefined,
): MoodleCourseItem | undefined {
  return entry.moodleRef && course
    ? course.items.find((item) => moodleRef(course, item) === entry.moodleRef)
    : undefined;
}

/** Assignments of the course that no entry refers to yet. */
export function unlinkedAssignments(
  entries: Coursework[],
  course: MoodleCourse | undefined,
): MoodleCourseItem[] {
  if (!course) return [];
  const linked = new Set(entries.map((entry) => entry.moodleRef));
  return course.items.filter(
    (item) =>
      item.kind === "assignment" && !linked.has(moodleRef(course, item)),
  );
}

/** A new entry from a Moodle assignment; a submitted one starts as "done". */
export function courseworkFromMoodle(
  moduleId: string,
  course: MoodleCourse,
  item: MoodleCourseItem,
): Omit<Coursework, "id"> {
  return {
    moduleId,
    title: item.title,
    status: item.submitted ? "done" : "open",
    moodleRef: moodleRef(course, item),
    // The instant carries the German offset, so its first ten characters are the German date.
    ...(item.dueAt ? { dueAt: item.dueAt.slice(0, 10) } : {}),
  };
}

/**
 * Moodle only knows "submitted", not whether a Prüfungsvorleistung counts as achieved. So the app
 * suggests and Niklas decides: an open entry whose assignment is submitted may become "done".
 */
export function suggestedStatus(
  entry: Coursework,
  item: MoodleCourseItem | undefined,
): CourseworkStatus | null {
  return entry.status === "open" && item?.submitted ? "done" : null;
}
