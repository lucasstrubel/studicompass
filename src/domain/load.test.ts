import { describe, expect, it } from "vitest";
import { rules } from "@/data/rules";
import { LOAD_RULE, loadLimit } from "./load";

describe("loadLimit (DR-10)", () => {
  it("lowers the limit to the regular 30 ECTS from 15 job hours a week", () => {
    expect(loadLimit(0)).toBe(36);
    expect(loadLimit(14)).toBe(36);
    expect(loadLimit(15)).toBe(30);
    expect(loadLimit(40)).toBe(30);
  });

  it("matches the parameters shown with the rule", () => {
    expect(rules.find((rule) => rule.id === "DR-10")?.params).toEqual(
      LOAD_RULE,
    );
  });
});
