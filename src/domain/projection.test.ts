import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { compareDecision } from "./decision";
import { projectPlan } from "./projection";
import { compare } from "./terms";
import type { PlanOverride } from "./types";

describe("projection safety and curriculum behavior", () => {
  it("does not mutate inputs, keeps passed terms and accounts for all 210 ECTS", () => {
    const state = academicFixture();
    const original = structuredClone(state);
    const overrides: PlanOverride[] = [
      { moduleId: "m-stat", action: "withdraw" },
    ];
    const savedOverrides = structuredClone(overrides);
    const plan = projectPlan(state, overrides);
    compareDecision(state, "e-stat-ws26");
    expect(state).toEqual(original);
    expect(overrides).toEqual(savedOverrides);
    for (const exam of state.exams.filter((exam) => exam.status === "passed")) {
      expect(
        plan.modules.find((entry) => entry.moduleId === exam.moduleId)?.term,
      ).toEqual(exam.term);
    }
    expect(plan.terms.at(-1)?.cumulativeEcts).toBe(210);
    expect(new Set(plan.modules.map((entry) => entry.moduleId)).size).toBe(
      state.modules.length,
    );
  });

  it("reapplies seasonal offerings after a milestone shift, including delayed graduation", () => {
    const state = academicFixture();
    state.modules = state.modules.map((module) =>
      module.id === "m-ba" ? { ...module, offering: "WS" } : module,
    );
    const plan = projectPlan(state, [
      { moduleId: "m-stat", action: "withdraw" },
    ]);
    expect(plan.internshipTerm).toEqual({ season: "SS", year: 2028 });
    expect(
      plan.modules.find((entry) => entry.moduleId === "m-ba")?.term,
    ).toEqual({ season: "WS", year: 2029 });
    expect(plan.graduationTerm).toEqual({ season: "WS", year: 2029 });
  });

  it("accepts a valid explicit move and rejects unavailable, past, duplicate or passed targets", () => {
    const state = academicFixture();
    expect(
      projectPlan(state, [
        {
          moduleId: "m-stat",
          action: "move",
          term: { season: "WS", year: 2028 },
        },
      ]).internshipTerm,
    ).toEqual({ season: "SS", year: 2029 });
    const invalid: PlanOverride[][] = [
      [
        {
          moduleId: "m-stat",
          action: "move",
          term: { season: "SS", year: 2027 },
        },
      ],
      [{ moduleId: "m-stat", action: "move", term: state.currentTerm }],
      [{ moduleId: "m-gwi", action: "withdraw" }],
      [{ moduleId: "missing", action: "withdraw" }],
      [
        { moduleId: "m-stat", action: "withdraw" },
        { moduleId: "m-stat", action: "fail" },
      ],
    ];
    for (const overrides of invalid)
      expect(() => projectPlan(state, overrides)).toThrow(RangeError);
  });

  it("reports only changed baseline warnings for an override, with rule IDs and severity order", () => {
    const state = academicFixture();
    const baseline = projectPlan(state);
    const scenario = projectPlan(state, [
      { moduleId: "m-stat", action: "withdraw" },
    ]);
    expect(scenario.consequences.some((item) => item.ruleId === "DR-10")).toBe(
      false,
    );
    const order = { critical: 0, tight: 1, info: 2 };
    for (let index = 1; index < scenario.consequences.length; index++)
      expect(
        order[scenario.consequences[index].severity],
      ).toBeGreaterThanOrEqual(
        order[scenario.consequences[index - 1].severity],
      );
    expect(
      scenario.consequences.every((item) => item.ruleId !== undefined),
    ).toBe(true);
    expect(
      baseline.terms.every(
        (term, index, all) =>
          index === 0 || compare(term.term, all[index - 1].term) > 0,
      ),
    ).toBe(true);
  });

  it("explains a delayed project milestone even when graduation is unchanged", () => {
    const plan = projectPlan(academicFixture(), [
      {
        moduleId: "m-projekt",
        action: "move",
        term: { season: "WS", year: 2028 },
      },
    ]);
    expect(plan).toMatchObject({
      trafficLight: "critical",
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2028 },
    });
    expect(plan.consequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "milestone-m-projekt",
          severity: "critical",
          ruleId: "DR-4",
        }),
      ]),
    );
  });

  it("marks delayed graduation critical even when only an elective moves", () => {
    const plan = projectPlan(academicFixture(), [
      { moduleId: "m-wp3", action: "move", term: { season: "WS", year: 2029 } },
    ]);
    expect(plan).toMatchObject({
      trafficLight: "critical",
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2029 },
    });
    expect(plan.consequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "graduation-shift",
          severity: "critical",
          ruleId: "DR-4",
        }),
      ]),
    );
  });

  it("blocks existing exhausted attempts without scheduling any further attempt or completion", () => {
    const state = academicFixture();
    state.exams = state.exams.map((exam) =>
      exam.id === "e-stat-ws26"
        ? { ...exam, status: "failed", grade: 5, attempt: 3 }
        : exam,
    );
    const plan = projectPlan(state);
    expect(plan).toMatchObject({
      status: "blocked",
      blockedModuleIds: ["m-stat"],
      foundationCompletionTerm: null,
      internshipTerm: null,
      internshipShift: null,
      graduationTerm: null,
      ectsEndOfTerm: 72,
      openFoundationAfterTerm: 3,
    });
    expect(plan.modules.some((module) => module.moduleId === "m-stat")).toBe(
      false,
    );
    expect(plan.terms).toEqual([]);
    expect(plan.consequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleId: "DR-8", severity: "critical" }),
      ]),
    );
  });

  it("uses the last permitted attempt without promising a fourth attempt", () => {
    const state = academicFixture();
    state.exams.push(
      {
        id: "first",
        moduleId: "m-stat",
        term: { season: "WS", year: 2024 },
        status: "failed",
        grade: 5,
        attempt: 1,
      },
      {
        id: "second",
        moduleId: "m-stat",
        term: { season: "WS", year: 2025 },
        status: "failed",
        grade: 5,
        attempt: 2,
      },
    );
    const outcomes = compareDecision(state, "e-stat-ws26");
    expect(outcomes.find((item) => item.option === "attendFail")).toMatchObject(
      {
        attemptsUsed: 3,
        status: "blocked",
        blockedModuleIds: ["m-stat"],
        internshipTerm: null,
        graduationTerm: null,
        trafficLight: "critical",
      },
    );
    expect(
      outcomes.find((item) => item.option === "attendFail")?.nextAttemptTerm,
    ).toBeUndefined();
    expect(outcomes.find((item) => item.option === "withdraw")).toMatchObject({
      attemptsUsed: 2,
      nextAttemptTerm: { season: "WS", year: 2027 },
    });
    expect(() => compareDecision(state, "e-gwi-ws25")).toThrow(RangeError);
    expect(() => compareDecision(state, "unknown")).toThrow(RangeError);
  });
});

describe("validation fixes", () => {
  it("DR-4: catches up a past curriculum slot without an attempt after the current term", () => {
    const state = academicFixture();
    state.exams = state.exams.filter((exam) => exam.id !== "e-mathe2-ss26");
    const plan = projectPlan(state);
    expect(
      plan.modules.find((entry) => entry.moduleId === "m-mathe2")?.term,
    ).toEqual({ season: "SS", year: 2027 });
    expect(plan.ectsEndOfTerm).toBe(72);
    expect(plan.openFoundationAfterTerm).toBe(3);
  });

  it("§10.5 step 9: every decision option lists only differences from the baseline", () => {
    const outcomes = compareDecision(academicFixture(), "e-stat-ws26");
    expect(
      outcomes.find((item) => item.option === "attendPass")?.consequences,
    ).toEqual([]);
    for (const outcome of outcomes)
      expect(outcome.consequences.some((item) => item.ruleId === "DR-10")).toBe(
        false,
      );
  });
});
