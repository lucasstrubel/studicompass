import { describe, expect, it } from "vitest";
import { academicFixture } from "@/test/academic-fixture";
import { nextOfferingTerm, trafficLight } from "./rules";

describe("KONZEPT §10.3: rules", () => {
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
  it("DR-4: WS-only Statistics returns WS 2027, BOTH Marketing returns SS 2027", () => {
    const { modules, currentTerm } = academicFixture();
    const statistics = modules.find((module) => module.id === "m-stat");
    const marketing = modules.find((module) => module.id === "m-mkt");
    if (!statistics || !marketing) throw new Error("Missing fixture module");
    expect(nextOfferingTerm(statistics, currentTerm)).toEqual({
      season: "WS",
      year: 2027,
    });
    expect(nextOfferingTerm(marketing, currentTerm)).toEqual({
      season: "SS",
      year: 2027,
    });
  });
});
