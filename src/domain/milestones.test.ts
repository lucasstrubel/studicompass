import { describe, expect, it } from "vitest";
import { modules } from "@/data/modules";
import { milestoneModules } from "./milestones";

describe("milestoneModules (P5-08)", () => {
  it("assigns the 10 foundation modules to the end of the foundation phase and to the internship (DR-6)", () => {
    const end = milestoneModules("foundationEnd", modules);
    const internship = milestoneModules("internship", modules);
    expect(end.ruleId).toBeNull();
    expect(internship.ruleId).toBe("DR-6");
    expect(internship.moduleIds).toHaveLength(10);
    expect(internship.moduleIds).toEqual(end.moduleIds);
    expect(internship.moduleIds).toContain("m-pr2");
    expect(internship.moduleIds).not.toContain("m-se2");
  });

  it("assigns the foundation modules to the project (DR-11)", () => {
    const project = milestoneModules("project", modules);
    expect(project.ruleId).toBe("DR-11");
    expect(project.moduleIds).toHaveLength(10);
    expect(project.moduleIds).toContain("m-bwl2");
  });

  it("assigns everything planned for the first five semesters to the thesis (DR-12)", () => {
    const thesis = milestoneModules("thesis", modules);
    expect(thesis.ruleId).toBe("DR-12");
    expect(thesis.moduleIds).toContain("m-ps");
    expect(thesis.moduleIds).toContain("m-up");
    expect(thesis.moduleIds).not.toContain("m-wia");
  });
});
