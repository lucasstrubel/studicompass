import { describe, expect, it } from "vitest";
import { compare, format, next, nextOffering, semesterNumber } from "./terms";
import type { Term } from "./types";

describe("KONZEPT §10.2: semester sequence", () => {
  it("advances WS 2026 to SS 2027 and then WS 2027 without mutating the input", () => {
    const winter = Object.freeze({ season: "WS", year: 2026 } as const);
    const summer = next(winter);
    expect(summer).toEqual({ season: "SS", year: 2027 });
    expect(next(summer)).toEqual({ season: "WS", year: 2027 });
    expect(winter).toEqual({ season: "WS", year: 2026 });
  });

  const timeline: Term[] = [
    { season: "WS", year: 2025 },
    { season: "SS", year: 2026 },
    { season: "WS", year: 2026 },
    { season: "SS", year: 2027 },
    { season: "WS", year: 2027 },
    { season: "SS", year: 2028 },
    { season: "WS", year: 2028 },
  ];

  it("orders all semesters chronologically, including SS before WS of the same year", () => {
    for (const [leftIndex, left] of timeline.entries()) {
      for (const [rightIndex, right] of timeline.entries()) {
        expect(compare(left, right)).toBe(Math.sign(leftIndex - rightIndex));
      }
    }
  });

  it("maps the seven semesters of the regular course from WS 2025/26", () => {
    const start: Term = { season: "WS", year: 2025 };
    expect(timeline.map((term) => semesterNumber(term, start))).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("also counts from a summer start and preserves distances before the start", () => {
    const start: Term = { season: "SS", year: 2026 };
    expect(semesterNumber(start, start)).toBe(1);
    expect(semesterNumber({ season: "WS", year: 2026 }, start)).toBe(2);
    expect(semesterNumber({ season: "WS", year: 2025 }, start)).toBe(0);
    expect(semesterNumber({ season: "SS", year: 2025 }, start)).toBe(-1);
  });

  it.each([
    ["WS", 2026, "WS 2026/27"],
    ["SS", 2027, "SS 2027"],
    ["WS", 2099, "WS 2099/00"],
    ["WS", 2100, "WS 2100/01"],
  ] as const)("formats %s %i as %s", (season, year, expected) => {
    expect(format({ season, year })).toBe(expected);
  });
});

describe("DR-4: earliest offering is strictly after the current term", () => {
  it.each([
    ["WS", "BOTH", "SS", 2027],
    ["WS", "WS", "WS", 2027],
    ["WS", "SS", "SS", 2027],
    ["SS", "BOTH", "WS", 2026],
    ["SS", "WS", "WS", 2026],
    ["SS", "SS", "SS", 2027],
  ] as const)(
    "after %s 2026 with offering %s returns %s %i",
    (season, offering, expectedSeason, expectedYear) => {
      const term = Object.freeze({ season, year: 2026 });
      expect(nextOffering(term, offering)).toEqual({
        season: expectedSeason,
        year: expectedYear,
      });
      expect(term).toEqual({ season, year: 2026 });
    },
  );
});
