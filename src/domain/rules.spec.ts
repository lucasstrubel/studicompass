import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { nextOfferingTerm, trafficLight } from "./rules";

describe("rules", () => {
  it.each([
    [6, "onTrack"],
    [7, "tight"],
    [23, "tight"],
    [24, "critical"],
  ] as const)("DR-3: deficit %i produces %s", (deficit, expected) => {
    expect(trafficLight(90 - deficit, 90)).toBe(expected);
  });
  it("DR-3: shifting a milestone overrides a small ECTS deficit", () => {
    expect(trafficLight(90, 90, 1)).toBe("critical");
  });
  it("DR-7: exactly three open foundation exams are permitted, four are critical", () => {
    expect(trafficLight(90, 90, 0, 3)).toBe("onTrack");
    expect(trafficLight(90, 90, 0, 4)).toBe("critical");
  });
  it("DR-4: WS-only BWL 3 returns WS 2027, BOTH Programmierung 2 returns SS 2027", () => {
    const { modules, currentTerm } = academicFixture();
    const seasonal = modules.find((module) => module.id === "m-bwl3");
    const everyTerm = modules.find((module) => module.id === "m-pr2");
    if (!seasonal || !everyTerm) throw new Error("Missing fixture module");
    expect(nextOfferingTerm(seasonal, currentTerm)).toEqual({
      season: "WS",
      year: 2027,
    });
    expect(nextOfferingTerm(everyTerm, currentTerm)).toEqual({
      season: "SS",
      year: 2027,
    });
  });
});
