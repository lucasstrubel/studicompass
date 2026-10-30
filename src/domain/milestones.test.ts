import { describe, expect, it } from "vitest";
import { modules } from "@/data/modules";
import { milestoneModules } from "./milestones";

describe("milestoneModules (P5-08, KONZEPT §8 S2)", () => {
  it("assigns the 15 foundation modules to the end of the foundation phase and to the internship (DR-6)", () => {
    const end = milestoneModules("foundationEnd", modules);
    const internship = milestoneModules("internship", modules);
    expect(end.ruleId).toBeNull();
    expect(internship.ruleId).toBe("DR-6");
    expect(internship.moduleIds).toHaveLength(15);
    expect(internship.moduleIds).toEqual(end.moduleIds);
    expect(internship.moduleIds).toContain("m-stat");
    expect(internship.moduleIds).not.toContain("m-se2");
  });

  it("assigns the internship to the project semester (DR-11)", () => {
    expect(milestoneModules("project", modules)).toEqual({
      ruleId: "DR-11",
      moduleIds: ["m-praxis"],
    });
  });

  it("assigns internship and project semester to the thesis (DR-12)", () => {
    expect(milestoneModules("thesis", modules)).toEqual({
      ruleId: "DR-12",
      moduleIds: ["m-praxis", "m-projekt"],
    });
  });
});
