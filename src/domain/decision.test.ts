import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { compareDecision, hasSpecialRuleImpact } from "./decision";

describe("hasSpecialRuleImpact", () => {
  it("flags Statistik (only in WS, delays the internship) but not Marketing (scenario A vs. D)", () => {
    const state = academicFixture();
    expect(hasSpecialRuleImpact(compareDecision(state, "e-stat-ws26"))).toBe(
      true,
    );
    expect(hasSpecialRuleImpact(compareDecision(state, "e-mkt-ws26"))).toBe(
      false,
    );
  });

  it("is false without a withdraw option", () => {
    expect(hasSpecialRuleImpact([])).toBe(false);
  });
});
