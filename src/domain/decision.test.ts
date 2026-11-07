import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { compareDecision, hasSpecialRuleImpact } from "./decision";

describe("hasSpecialRuleImpact", () => {
  it("flags Programmierung 2 (only in WS, delays the internship) but not Wirtschaftsinformatik 3 (scenario A vs. D)", () => {
    const state = academicFixture();
    expect(hasSpecialRuleImpact(compareDecision(state, "e-pr2-ws26"))).toBe(
      true,
    );
    expect(hasSpecialRuleImpact(compareDecision(state, "e-wi3-ws26"))).toBe(
      false,
    );
  });

  it("is false without a withdraw option", () => {
    expect(hasSpecialRuleImpact([])).toBe(false);
  });
});
