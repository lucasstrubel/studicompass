import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_NOW } from "@/config/demo";
import {
  formatCountdown,
  formatDate,
  formatDateTime,
  formatGrade,
  formatRelativeDay,
  formatShortDateTime,
  formatTime,
  greeting,
} from "@/lib/format";

afterEach(() => {
  vi.unstubAllEnvs();
});

const STAT_DEADLINE = new Date("2027-01-26T23:59:00+01:00");

describe("formatDate", () => {
  // Node applies a changed TZ immediately, so the test can move the "device" to another time zone.
  it.each(["Europe/Berlin", "Asia/Tokyo", "America/Los_Angeles"])(
    "shows the demo time as in KONZEPT §10.2, also on a device in %s",
    (deviceTimeZone) => {
      vi.stubEnv("TZ", deviceTimeZone);

      expect(formatDate(DEMO_NOW)).toBe("Mo, 25.01.2027");
      expect(formatDateTime(STAT_DEADLINE)).toBe("Di, 26.01.2027, 23:59");
      expect(formatShortDateTime(STAT_DEADLINE)).toBe("Di, 26.01., 23:59");
      expect(formatTime(STAT_DEADLINE)).toBe("23:59");
    },
  );
});

describe("formatRelativeDay", () => {
  it("names today, tomorrow and the day after, otherwise the date", () => {
    expect(
      formatRelativeDay(new Date("2027-01-25T23:00:00+01:00"), DEMO_NOW),
    ).toBe("heute");
    expect(formatRelativeDay(STAT_DEADLINE, DEMO_NOW)).toBe("morgen");
    expect(
      formatRelativeDay(new Date("2027-01-27T10:30:00+01:00"), DEMO_NOW),
    ).toBe("übermorgen");
    expect(
      formatRelativeDay(new Date("2027-01-28T23:59:00+01:00"), DEMO_NOW),
    ).toBe("Do, 28.01.2027");
  });
});

describe("formatCountdown", () => {
  it("shows the Statistik deadline as in KONZEPT §10.2", () => {
    expect(formatCountdown(STAT_DEADLINE, DEMO_NOW)).toBe("noch 1 Tag, 4 Std.");
  });

  it("uses plural days, hours and minutes and ends at 'abgelaufen'", () => {
    expect(
      formatCountdown(new Date("2027-01-28T23:59:00+01:00"), DEMO_NOW),
    ).toBe("noch 3 Tage, 4 Std.");
    expect(
      formatCountdown(new Date("2027-01-27T19:30:00+01:00"), DEMO_NOW),
    ).toBe("noch 2 Tage");
    expect(
      formatCountdown(new Date("2027-01-25T23:59:00+01:00"), DEMO_NOW),
    ).toBe("noch 4 Std., 29 Min.");
    expect(
      formatCountdown(new Date("2027-01-25T19:45:00+01:00"), DEMO_NOW),
    ).toBe("noch 15 Min.");
    expect(formatCountdown(DEMO_NOW, DEMO_NOW)).toBe("abgelaufen");
  });
});

describe("formatGrade", () => {
  it("uses one decimal and a comma", () => {
    expect(formatGrade(2.4)).toBe("2,4");
    expect(formatGrade(2)).toBe("2,0");
  });
});

describe("greeting", () => {
  it("greets Niklas in the evening at DEMO_NOW", () => {
    expect(greeting(DEMO_NOW)).toBe("Guten Abend");
    expect(greeting(new Date("2027-01-25T09:00:00+01:00"))).toBe(
      "Guten Morgen",
    );
    expect(greeting(new Date("2027-01-25T14:00:00+01:00"))).toBe("Guten Tag");
  });
});
