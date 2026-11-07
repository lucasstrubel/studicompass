import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import type { ExamRecord, Module } from "./types";
import { earnedEcts, openFoundationModules, targetEcts } from "./progress";
import { gradeAverage } from "./grades";

describe("progress and grades", () => {
  it("Basis / DR-1, DR-2, DR-9: 45 ECTS, target 60/90, two open modules, average 2.3", () => {
    const { modules, exams } = academicFixture();
    expect(earnedEcts(modules, exams)).toBe(45);
    expect(targetEcts(modules, 2)).toBe(60);
    expect(targetEcts(modules, 3)).toBe(90);
    expect(openFoundationModules(modules, exams)).toHaveLength(2);
    expect(gradeAverage(modules, exams)).toBe(2.3);
  });
  it.each([
    [4.0, 5],
    [4.3, 0],
  ] as const)("DR-1: grade %f yields %i ECTS", (grade, expected) => {
    const module = academicFixture().modules[0];
    const exam: ExamRecord = {
      id: "test",
      moduleId: module.id,
      term: { season: "WS", year: 2025 },
      status: "passed",
      grade,
    };
    expect(earnedEcts([module], [exam])).toBe(expected);
  });

  it.each([
    [2.3, 2, 2.5, 8],
    [2.4, 1, 2.5, 9],
  ])(
    "DR-9: weighted average from %f × %i and %f × %i is truncated to 2.4",
    (gradeA, ectsA, gradeB, ectsB) => {
      const base = academicFixture().modules[0];
      const modules: Module[] = [
        { ...base, id: "a", ects: ectsA },
        { ...base, id: "b", ects: ectsB },
      ];
      const exams: ExamRecord[] = [
        {
          id: "a",
          moduleId: "a",
          term: { season: "WS", year: 2025 },
          status: "passed",
          grade: gradeA,
        },
        {
          id: "b",
          moduleId: "b",
          term: { season: "WS", year: 2025 },
          status: "passed",
          grade: gradeB,
        },
      ];
      expect(gradeAverage(modules, exams)).toBe(2.4);
    },
  );
});
