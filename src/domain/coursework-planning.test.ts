import { describe, expect, it } from "vitest";
import {
  courseworkFromMoodle,
  linkedMoodleItem,
  suggestedStatus,
  summarizeCoursework,
  unlinkedAssignments,
} from "./coursework";
import type { Coursework, MoodleCourse, MoodleCourseItem } from "./types";

const entry = (part: Partial<Coursework>): Coursework => ({
  id: "c",
  moduleId: "m-pr2",
  title: "Übungsblatt",
  status: "open",
  ...part,
});
const assignment = (part: Partial<MoodleCourseItem>): MoodleCourseItem => ({
  id: "cm1",
  kind: "assignment",
  title: "Übungsblatt 1",
  signature: "1:2",
  submitted: false,
  ...part,
});
const course = (items: MoodleCourseItem[]): MoodleCourse => ({
  id: "7",
  moduleId: "m-pr2",
  title: "Programmierung 2",
  url: "http://moodle.example/course/view.php?id=7",
  items,
});

describe("summarizeCoursework", () => {
  it("counts states, sums the plan of open entries and finds the next due date", () => {
    expect(
      summarizeCoursework(
        [
          entry({ status: "done", effortHours: 5, dueAt: "2027-01-10" }),
          entry({ status: "failed", effortHours: 9 }),
          entry({ effortHours: 2.5, dueAt: "2027-02-18" }),
          entry({ effortHours: 4, dueAt: "2027-01-31" }),
          entry({ dueAt: "2027-01-20" }),
        ],
        "2027-01-25",
      ),
    ).toEqual({
      total: 5,
      done: 1,
      failed: 1,
      open: 3,
      openEffortHours: 6.5,
      nextDueAt: "2027-01-31",
    });
  });

  it("counts a due date of today and leaves the field out without one", () => {
    expect(
      summarizeCoursework([entry({ dueAt: "2027-01-25" })], "2027-01-25")
        .nextDueAt,
    ).toBe("2027-01-25");
    expect(summarizeCoursework([], "2027-01-25")).toEqual({
      total: 0,
      done: 0,
      failed: 0,
      open: 0,
      openEffortHours: 0,
    });
  });
});

describe("Prüfungsvorleistungen from Moodle", () => {
  const open = assignment({ dueAt: "2027-01-31T23:59:00+01:00" });
  const submitted = assignment({
    id: "cm2",
    title: "Übungsblatt 2",
    submitted: true,
  });

  it("takes title, German date and state from the assignment", () => {
    const from = course([open, submitted]);
    expect(courseworkFromMoodle("m-pr2", from, open)).toEqual({
      moduleId: "m-pr2",
      title: "Übungsblatt 1",
      status: "open",
      moodleRef: "7/cm1",
      dueAt: "2027-01-31",
    });
    expect(courseworkFromMoodle("m-pr2", from, submitted)).toMatchObject({
      status: "done",
      moodleRef: "7/cm2",
    });
  });

  it("offers only assignments that are not taken over yet", () => {
    const from = course([
      open,
      submitted,
      { id: "cm3", kind: "file", title: "Skript", signature: "" },
    ]);
    expect(unlinkedAssignments([], from).map((item) => item.id)).toEqual([
      "cm1",
      "cm2",
    ]);
    expect(
      unlinkedAssignments([entry({ moodleRef: "7/cm1" })], from).map(
        (item) => item.id,
      ),
    ).toEqual(["cm2"]);
    expect(unlinkedAssignments([], undefined)).toEqual([]);
  });

  it("finds the assignment of an entry, or none when the course lost it", () => {
    const from = course([open]);
    expect(linkedMoodleItem(entry({ moodleRef: "7/cm1" }), from)).toBe(open);
    expect(
      linkedMoodleItem(entry({ moodleRef: "7/cm9" }), from),
    ).toBeUndefined();
    expect(linkedMoodleItem(entry({}), from)).toBeUndefined();
    expect(
      linkedMoodleItem(entry({ moodleRef: "7/cm1" }), undefined),
    ).toBeUndefined();
  });

  it("suggests 'done' only for an open entry whose assignment is submitted", () => {
    expect(suggestedStatus(entry({}), submitted)).toBe("done");
    expect(suggestedStatus(entry({}), open)).toBeNull();
    expect(suggestedStatus(entry({ status: "done" }), submitted)).toBeNull();
    expect(suggestedStatus(entry({ status: "failed" }), submitted)).toBeNull();
    expect(suggestedStatus(entry({}), undefined)).toBeNull();
  });
});
