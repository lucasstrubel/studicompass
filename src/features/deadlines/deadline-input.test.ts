import { describe, expect, it } from "vitest";
import { DEMO_NOW } from "@/config/demo";
import { fromDueAt, toDueAt, validateDeadline } from "./deadline-input";

describe("own deadline input (P5-13)", () => {
  it("stores a date only or an instant in German time", () => {
    expect(toDueAt("2027-01-28", "")).toBe("2027-01-28");
    expect(toDueAt("2027-01-28", "10:00")).toBe("2027-01-28T10:00:00+01:00");
    expect(toDueAt("2027-05-14", "09:30")).toBe("2027-05-14T09:30:00+02:00");
    expect(fromDueAt("2027-01-28T10:00:00+01:00")).toEqual({
      date: "2027-01-28",
      time: "10:00",
    });
    expect(fromDueAt("2027-01-28")).toEqual({ date: "2027-01-28", time: "" });
  });

  it("requires a title and a date that is not before the demo time", () => {
    expect(
      validateDeadline({ title: "", date: "", time: "" }, DEMO_NOW),
    ).toEqual({
      title: "Gib einen Titel ein.",
      date: "Wähle ein Datum.",
    });
    // Demo time is Mon 25.01.2027, 19:30: earlier that day is past, the day itself still counts.
    expect(
      validateDeadline(
        { title: "Abgabe", date: "2027-01-25", time: "18:00" },
        DEMO_NOW,
      ).date,
    ).toMatch(/vor dem heutigen Demo-Datum/);
    expect(
      validateDeadline(
        { title: "Abgabe", date: "2027-01-25", time: "" },
        DEMO_NOW,
      ),
    ).toEqual({});
    expect(
      validateDeadline(
        { title: "Abgabe", date: "2027-01-26", time: "10:00" },
        DEMO_NOW,
      ),
    ).toEqual({});
  });
});
