import type {
  MoodleChange,
  MoodleCourse,
  MoodleCourseItem,
  MoodleKnown,
} from "./types";

const key = (course: MoodleCourse, item: MoodleCourseItem) =>
  `${course.id}/${item.id}`;

/** The state to compare the next sync against. */
export function knownMoodleItems(courses: MoodleCourse[]): MoodleKnown {
  const known: MoodleKnown = {};
  for (const course of courses)
    for (const item of course.items)
      known[key(course, item)] = {
        signature: item.signature,
        ...(item.grade ? { points: item.grade.points } : {}),
      };
  return known;
}

/**
 * What changed in the courses since `known` was taken: new items, changed items and new or changed
 * grades. A grade wins over "updated", because that is what the student cares about. Items that
 * disappeared are not reported.
 */
export function detectMoodleChanges(
  known: MoodleKnown,
  courses: MoodleCourse[],
  detectedAt: string,
): MoodleChange[] {
  const changes: MoodleChange[] = [];
  for (const course of courses)
    for (const item of course.items) {
      const before = known[key(course, item)] as
        MoodleKnown[string] | undefined;
      const graded =
        item.grade !== undefined && item.grade.points !== before?.points;
      const type = !before
        ? "added"
        : graded
          ? "graded"
          : before.signature !== item.signature
            ? "updated"
            : null;
      if (!type) continue;
      changes.push({
        id: `moodle-change-${course.id}-${item.id}-${type}-${item.signature}-${item.grade?.points ?? ""}`,
        courseId: course.id,
        courseTitle: course.title,
        kind: item.kind,
        type,
        title: item.title,
        detectedAt,
        ...(course.moduleId ? { moduleId: course.moduleId } : {}),
        ...(item.url ? { url: item.url } : {}),
        ...(item.grade ? { grade: item.grade } : {}),
        ...(item.dueAt ? { dueAt: item.dueAt } : {}),
      });
    }
  return changes;
}

const ADDED = {
  file: "Neue Datei",
  assignment: "Neue Aufgabe",
  announcement: "Neue Ankündigung",
  activity: "Neue Aktivität",
} as const;
const UPDATED = {
  file: "Datei aktualisiert",
  assignment: "Aufgabe geändert",
  announcement: "Ankündigung geändert",
  activity: "Aktivität geändert",
} as const;

function points(value: number): string {
  return value.toLocaleString("de-DE", { maximumFractionDigits: 2 });
}

/** "Neue Datei: Vorlesung 03" / "Bewertung: Pflichtübung (8 von 10 Punkten)". */
export function moodleChangeText(change: MoodleChange): string {
  if (change.type === "graded" && change.grade)
    return `Bewertung: ${change.title} (${points(change.grade.points)} von ${points(change.grade.max)} Punkten)`;
  return `${(change.type === "added" ? ADDED : UPDATED)[change.kind]}: ${change.title}`;
}
