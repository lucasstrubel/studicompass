import { describe, expect, it } from "vitest";
import {
  detectMoodleChanges,
  knownMoodleItems,
  moodleChangeText,
} from "./moodle-changes";
import type { MoodleCourse, MoodleCourseItem } from "./types";

const at = "2027-01-25T19:30:00+01:00";
const file: MoodleCourseItem = {
  id: "cm1",
  kind: "file",
  title: "Vorlesung 01",
  signature: "v1.pdf@100",
};
const task: MoodleCourseItem = {
  id: "cm2",
  kind: "assignment",
  title: "Übungsblatt 1",
  signature: "10:200",
  dueAt: "2027-01-31T23:59:00+01:00",
  submitted: true,
};
const course = (items: MoodleCourseItem[]): MoodleCourse => ({
  id: "7",
  moduleId: "m-pr2",
  title: "Programmierung 2",
  url: "http://moodle.example/course/view.php?id=7",
  items,
});
const detect = (before: MoodleCourseItem[], after: MoodleCourseItem[]) =>
  detectMoodleChanges(knownMoodleItems([course(before)]), [course(after)], at);

describe("detectMoodleChanges", () => {
  it("reports nothing when nothing changed", () => {
    expect(detect([file, task], [file, task])).toEqual([]);
  });

  it("reports a new item with its course and module", () => {
    expect(detect([file], [file, task])).toEqual([
      {
        id: "moodle-change-7-cm2-added-10:200-",
        courseId: "7",
        moduleId: "m-pr2",
        courseTitle: "Programmierung 2",
        kind: "assignment",
        type: "added",
        title: "Übungsblatt 1",
        dueAt: "2027-01-31T23:59:00+01:00",
        detectedAt: at,
      },
    ]);
  });

  it("reports a replaced file and a moved due date as updated", () => {
    const changes = detect(
      [file, task],
      [
        { ...file, signature: "v1.pdf@999" },
        { ...task, signature: "11:300" },
      ],
    );
    expect(changes.map((change) => [change.title, change.type])).toEqual([
      ["Vorlesung 01", "updated"],
      ["Übungsblatt 1", "updated"],
    ]);
  });

  it("reports a first and a corrected grade, and prefers it over a changed signature", () => {
    const graded = { ...task, grade: { points: 8, max: 10 } };
    expect(detect([task], [graded])[0]).toMatchObject({
      type: "graded",
      grade: { points: 8, max: 10 },
    });
    expect(
      detect([graded], [{ ...graded, grade: { points: 9, max: 10 } }]),
    ).toHaveLength(1);
    expect(detect([graded], [graded])).toEqual([]);
    expect(
      detect([task], [{ ...graded, signature: "12:400" }]).map(
        (change) => change.type,
      ),
    ).toEqual(["graded"]);
  });

  it("ignores items that disappeared", () => {
    expect(detect([file, task], [file])).toEqual([]);
  });

  it("gives the same change the same id and a later change another one", () => {
    const first = detect([file], [{ ...file, signature: "a" }])[0].id;
    expect(detect([file], [{ ...file, signature: "a" }])[0].id).toBe(first);
    expect(detect([file], [{ ...file, signature: "b" }])[0].id).not.toBe(first);
  });

  it("keeps courses apart that use the same item ids", () => {
    const other = { ...course([file]), id: "8" };
    expect(
      detectMoodleChanges(knownMoodleItems([course([file])]), [other], at),
    ).toHaveLength(1);
  });
});

describe("moodleChangeText", () => {
  const change = detect([], [file])[0];
  it.each([
    [{ kind: "file", type: "added" }, "Neue Datei: Vorlesung 01"],
    [{ kind: "file", type: "updated" }, "Datei aktualisiert: Vorlesung 01"],
    [{ kind: "assignment", type: "added" }, "Neue Aufgabe: Vorlesung 01"],
    [{ kind: "assignment", type: "updated" }, "Aufgabe geändert: Vorlesung 01"],
    [{ kind: "announcement", type: "added" }, "Neue Ankündigung: Vorlesung 01"],
    [{ kind: "activity", type: "added" }, "Neue Aktivität: Vorlesung 01"],
  ] as const)("%o → %s", (part, text) => {
    expect(moodleChangeText({ ...change, ...part })).toBe(text);
  });

  it("names points in German number format", () => {
    expect(
      moodleChangeText({
        ...change,
        kind: "assignment",
        type: "graded",
        grade: { points: 7.5, max: 10 },
      }),
    ).toBe("Bewertung: Vorlesung 01 (7,5 von 10 Punkten)");
  });
});
