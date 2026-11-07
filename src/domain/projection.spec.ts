import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { compareDecision } from "./decision";
import { projectPlan } from "./projection";

describe("demo scenarios", () => {
  it("Basis: 75/90 ECTS, tight, project SS 2027, internship WS 2027, graduation WS 2028, summer load 40", () => {
    const plan = projectPlan(academicFixture());
    expect(plan).toMatchObject({
      ectsEndOfTerm: 75,
      targetEndOfTerm: 90,
      trafficLight: "tight",
      openFoundationAfterTerm: 0,
      foundationCompletionTerm: { season: "WS", year: 2026 },
      projectTerm: { season: "SS", year: 2027 },
      projectShift: 0,
      internshipTerm: { season: "WS", year: 2027 },
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2028 },
    });
    expect(
      plan.terms.find(
        (term) => term.term.season === "SS" && term.term.year === 2027,
      )?.ects,
    ).toBe(40);
    expect(plan.terms.at(-1)?.cumulativeEcts).toBe(210);
    expect(plan.consequences).toEqual(
      expect.arrayContaining([expect.objectContaining({ ruleId: "DR-10" })]),
    );
  });

  it.each([
    ["Szenario A", "withdraw", 65, "critical", 1, 0, "SS", 2028, 2, "SS", 2029],
    ["Szenario B", "attendPass", 75, "tight", 0, 1, "SS", 2027, 0, "WS", 2028],
    [
      "Szenario C",
      "attendFail",
      65,
      "critical",
      1,
      1,
      "SS",
      2028,
      2,
      "SS",
      2029,
    ],
  ] as const)(
    "%s: Programmierung 2 %s",
    (
      _scenario,
      option,
      ects,
      status,
      open,
      attempts,
      projectSeason,
      projectYear,
      shift,
      graduationSeason,
      graduationYear,
    ) => {
      const outcome = compareDecision(academicFixture(), "e-pr2-ws26").find(
        (item) => item.option === option,
      );
      expect(outcome).toMatchObject({
        ectsEndOfTerm: ects,
        targetEndOfTerm: 90,
        trafficLight: status,
        openFoundationAfterTerm: open,
        attemptsUsed: attempts,
        projectTerm: { season: projectSeason, year: projectYear },
        projectShift: shift,
        internshipTerm: { season: "WS", year: 2027 },
        internshipShift: 0,
        graduationTerm: { season: graduationSeason, year: graduationYear },
      });
      if (option !== "attendPass") {
        expect(outcome?.nextAttemptTerm).toEqual({ season: "SS", year: 2027 });
        expect(outcome?.consequences).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ severity: "critical", ruleId: "DR-11" }),
          ]),
        );
      }
    },
  );

  it("Szenario D: Wirtschaftsinformatik 3 withdrawal loses 5 ECTS but does not shift milestones; SS 2027 load 45", () => {
    const outcome = compareDecision(academicFixture(), "e-wi3-ws26").find(
      (item) => item.option === "withdraw",
    );
    expect(outcome).toMatchObject({
      ectsEndOfTerm: 70,
      targetEndOfTerm: 90,
      trafficLight: "tight",
      openFoundationAfterTerm: 0,
      nextAttemptTerm: { season: "SS", year: 2027 },
      projectShift: 0,
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2028 },
    });
    const plan = projectPlan(academicFixture(), [
      { moduleId: "m-wi3", action: "withdraw" },
    ]);
    expect(
      plan.terms.find(
        (term) => term.term.season === "SS" && term.term.year === 2027,
      )?.ects,
    ).toBe(45);
    expect(outcome?.consequences).toEqual(
      expect.arrayContaining([expect.objectContaining({ ruleId: "DR-10" })]),
    );
    expect(
      outcome?.consequences.some(
        (item) => item.ruleId === "DR-6" || item.ruleId === "DR-11",
      ),
    ).toBe(false);
  });

  it("DR-15: a retake has no withdrawal option, failing it moves the project as well", () => {
    const outcomes = compareDecision(academicFixture(), "e-bwl2-ws26");
    expect(outcomes.map((item) => item.option)).toEqual([
      "attendPass",
      "attendFail",
    ]);
    expect(outcomes[1]).toMatchObject({
      attemptsUsed: 2,
      nextAttemptTerm: { season: "SS", year: 2027 },
      projectTerm: { season: "SS", year: 2028 },
    });
  });

  it("DR-6: the internship waits for 30 ECTS from the main phase", () => {
    const plan = projectPlan(academicFixture(), [
      { moduleId: "m-pr2", action: "withdraw" },
      { moduleId: "m-dm", action: "move", term: { season: "WS", year: 2027 } },
    ]);
    expect(plan).toMatchObject({
      internshipTerm: { season: "SS", year: 2028 },
      internshipShift: 1,
      graduationTerm: { season: "SS", year: 2029 },
    });
    expect(plan.consequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "internship-shift", ruleId: "DR-6" }),
      ]),
    );
  });

  it("DR-15: a failed seasonal module returns in the next exam period, not a year later", () => {
    const state = academicFixture();
    state.exams = state.exams.filter((exam) => exam.id !== "e-bwl2-ws26");
    const plan = projectPlan(state);
    expect(
      plan.modules.find((entry) => entry.moduleId === "m-bwl2")?.term,
    ).toEqual({ season: "SS", year: 2027 });
  });
});
