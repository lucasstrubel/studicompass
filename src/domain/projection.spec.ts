import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { compareDecision } from "./decision";
import { projectPlan } from "./projection";

describe("KONZEPT §10.4: binding demo scenarios", () => {
  it("Basis: 78/90 ECTS, tight, two open exams, internship WS 2027, graduation WS 2028, summer load 42", () => {
    const plan = projectPlan(academicFixture());
    expect(plan).toMatchObject({
      ectsEndOfTerm: 78,
      targetEndOfTerm: 90,
      trafficLight: "tight",
      openFoundationAfterTerm: 2,
      foundationCompletionTerm: { season: "SS", year: 2027 },
      internshipTerm: { season: "WS", year: 2027 },
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2028 },
    });
    expect(
      plan.terms.find(
        (term) => term.term.season === "SS" && term.term.year === 2027,
      )?.ects,
    ).toBe(42);
    expect(plan.consequences).toEqual(
      expect.arrayContaining([expect.objectContaining({ ruleId: "DR-10" })]),
    );
  });

  it.each([
    ["Szenario A", "withdraw", 72, "critical", 3, 0, "SS", 2028, 1, "SS", 2029],
    ["Szenario B", "attendPass", 78, "tight", 2, 1, "WS", 2027, 0, "WS", 2028],
    [
      "Szenario C",
      "attendFail",
      72,
      "critical",
      3,
      1,
      "SS",
      2028,
      1,
      "SS",
      2029,
    ],
  ] as const)(
    "%s: Statistics %s",
    (
      _scenario,
      option,
      ects,
      status,
      open,
      attempts,
      internshipSeason,
      internshipYear,
      shift,
      graduationSeason,
      graduationYear,
    ) => {
      const outcome = compareDecision(academicFixture(), "e-stat-ws26").find(
        (item) => item.option === option,
      );
      expect(outcome).toMatchObject({
        ectsEndOfTerm: ects,
        targetEndOfTerm: 90,
        trafficLight: status,
        openFoundationAfterTerm: open,
        attemptsUsed: attempts,
        internshipTerm: { season: internshipSeason, year: internshipYear },
        internshipShift: shift,
        graduationTerm: { season: graduationSeason, year: graduationYear },
      });
      if (option !== "attendPass") {
        expect(outcome?.nextAttemptTerm).toEqual({ season: "WS", year: 2027 });
        expect(outcome?.consequences).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ severity: "critical", ruleId: "DR-6" }),
          ]),
        );
      }
    },
  );

  it("Szenario D: Marketing withdrawal loses 6 ECTS but does not shift milestones; SS 2027 load 48", () => {
    const outcome = compareDecision(academicFixture(), "e-mkt-ws26").find(
      (item) => item.option === "withdraw",
    );
    expect(outcome).toMatchObject({
      ectsEndOfTerm: 72,
      targetEndOfTerm: 90,
      trafficLight: "tight",
      openFoundationAfterTerm: 3,
      nextAttemptTerm: { season: "SS", year: 2027 },
      internshipTerm: { season: "WS", year: 2027 },
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2028 },
    });
    const plan = projectPlan(academicFixture(), [
      { moduleId: "m-mkt", action: "withdraw" },
    ]);
    expect(
      plan.terms.find(
        (term) => term.term.season === "SS" && term.term.year === 2027,
      )?.ects,
    ).toBe(48);
    expect(outcome?.consequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "DR-7" }),
        expect.objectContaining({ ruleId: "DR-10" }),
      ]),
    );
    expect(outcome?.consequences.some((item) => item.ruleId === "DR-6")).toBe(
      false,
    );
  });
});
