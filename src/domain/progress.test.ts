import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { earnedEcts, openFoundationModules } from "./progress";
import { gradeAverage } from "./grades";

describe("progress input edge cases", () => {
  it("handles an empty performance history without inventing a grade", () => {
    expect(earnedEcts([], [])).toBe(0);
    expect(gradeAverage([], [])).toBeNull();
    expect(openFoundationModules([], [])).toEqual([]);
  });
  it("counts a passed module once and excludes failed or missing grades", () => {
    const { modules, exams } = academicFixture();
    const successful = exams.find((exam) => exam.id === "e-gwi-ws25");
    if (!successful) throw new Error("Missing exam");
    expect(
      earnedEcts(modules, [...exams, { ...successful, id: "duplicate" }]),
    ).toBe(48);
    expect(earnedEcts(modules, [{ ...successful, grade: undefined }])).toBe(0);
    expect(
      earnedEcts(modules, [{ ...successful, grade: 2, status: "failed" }]),
    ).toBe(0);
    expect(gradeAverage([modules[0]], [{ ...successful, grade: 2.4 }])).toBe(
      2.4,
    );
    expect(gradeAverage([modules[0]], [{ ...successful, grade: 2.46 }])).toBe(
      2.4,
    );
  });
});
