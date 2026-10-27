import { expect, it } from "vitest";
import { deadlines } from "@/data/deadlines";
import { DEMO_NOW } from "@/config/demo";
import { deadlinesToIcs } from "./ics";
import {
  deadlineInstant,
  groupDeadlines,
} from "@/features/deadlines/deadline-groups";

it("P4-04: ICS erhält UTC, inklusive Datumsbereiche und stabile IDs", () => {
  const ics = deadlinesToIcs(deadlines);
  expect(ics).toContain("DTSTART:20270126T225900Z\r\n");
  expect(ics).toContain(
    "DTSTART;VALUE=DATE:20270510\r\nDTEND;VALUE=DATE:20270525",
  );
  expect(ics).toContain("UID:d-stat-abm@studicompass.example");
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(10);
  expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  expect(ics.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
  expect(deadlinesToIcs(deadlines)).toBe(ics);
});
it("P4-04: maskiert Sonderzeichen und faltet UTF-8 ohne Zeichenverlust", () => {
  const title = "Ä😀; Test, \\ neuer\nTitel".repeat(12);
  const ics = deadlinesToIcs([{ ...deadlines[0], title }]);
  const encoder = new TextEncoder();
  for (const line of ics.split("\r\n"))
    expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
  const unfolded = ics.replaceAll("\r\n ", "");
  expect(unfolded).toContain("SUMMARY:Ä😀\\; Test\\, \\\\ neuer\\nTitel");
  expect(unfolded).not.toContain("�");
});
it("P4-04: gruppiert relativ zur Demo-Zeit und zur Kalenderwoche", () => {
  expect(deadlineInstant("2027-05-14")).toBe("2027-05-14T23:59:59+02:00");
  expect(deadlineInstant("2027-02-15")).toBe("2027-02-15T23:59:59+01:00");
  const groups = groupDeadlines(deadlines, DEMO_NOW);
  expect(groups.map((group) => group.items.length)).toEqual([3, 5, 2]);
  const sunday = groupDeadlines(
    deadlines,
    new Date("2027-01-31T12:00:00+01:00"),
  );
  expect(sunday[0].items.map((item) => item.id)).toEqual(["d-mkt-fs5"]);
  expect(
    groupDeadlines(deadlines, new Date("2028-01-01T00:00:00Z")).flatMap(
      (group) => group.items,
    ),
  ).toEqual([]);
});
