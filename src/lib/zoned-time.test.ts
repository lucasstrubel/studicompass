import { describe, expect, it } from "vitest";
import { deadlineInstant, zonedInstant } from "./zoned-time";

describe("German time (P5-13 review)", () => {
  it("takes the offset of the moment, also on the day clocks go forward", () => {
    expect(zonedInstant("2027-01-26", "10:00")).toBe(
      "2027-01-26T10:00:00+01:00",
    );
    expect(zonedInstant("2027-03-28", "01:30")).toBe(
      "2027-03-28T01:30:00+01:00",
    );
    expect(zonedInstant("2027-03-28", "03:30")).toBe(
      "2027-03-28T03:30:00+02:00",
    );
    expect(zonedInstant("2027-10-31", "04:00")).toBe(
      "2027-10-31T04:00:00+01:00",
    );
  });

  it("ends a date-only deadline at 23:59:59 of that German day", () => {
    expect(deadlineInstant("2027-03-28")).toBe("2027-03-28T23:59:59+02:00");
    expect(deadlineInstant("2027-01-26T10:00:00+01:00")).toBe(
      "2027-01-26T10:00:00+01:00",
    );
  });

  it("rejects the nonexistent spring hour, while retaining midnight and the repeated autumn hour", () => {
    expect(zonedInstant("2027-03-28", "02:30")).toBeNull();
    expect(zonedInstant("2027-03-28", "00:00")).toBe(
      "2027-03-28T00:00:00+01:00",
    );
    expect(zonedInstant("2027-10-31", "02:30")).toBe(
      "2027-10-31T02:30:00+01:00",
    );
  });
});
