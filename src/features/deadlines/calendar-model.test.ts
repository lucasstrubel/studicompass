import { describe, expect, it } from "vitest";
import type { AgendaItem } from "@/domain/types";
import { createMockServices } from "@/services/mock";
import { createDemoStore } from "@/store/demo-store";
import { selectAcademicState, selectAgenda } from "@/store/selectors";
import {
  addCalendarDays,
  calendarDay,
  calendarItems,
  itemsOnDay,
  monthDays,
  shiftCalendarMonth,
} from "./calendar-model";

describe("P5-14: Monatskalender", () => {
  it("starts rows on Monday and includes all days, also for leap years", () => {
    const days = monthDays("2027-01");
    expect(days[0]).toBe("2026-12-28");
    expect(days.at(-1)).toBe("2027-01-31");
    expect(days).toHaveLength(35);
    expect(monthDays("2028-02")).toContain("2028-02-29");
    expect(monthDays("2027-02")).not.toContain("2027-02-29");
  });

  it("moves between months and years without overflowing short months", () => {
    expect(shiftCalendarMonth("2027-01-31", 1)).toBe("2027-02-28");
    expect(shiftCalendarMonth("2028-01-31", 1)).toBe("2028-02-29");
    expect(shiftCalendarMonth("2027-01-25", -1)).toBe("2026-12-25");
    expect(shiftCalendarMonth("2027-12-25", 1)).toBe("2028-01-25");
  });

  it("uses German days at midnight and calendar arithmetic across daylight saving", () => {
    expect(calendarDay("2027-01-25T23:30:00Z")).toBe("2027-01-26");
    expect(calendarDay("2027-03-28T22:30:00Z")).toBe("2027-03-29");
    expect(calendarDay("2027-03-28")).toBe("2027-03-28");
    expect(addCalendarDays("2027-03-28", 1)).toBe("2027-03-29");
    expect(addCalendarDays("2027-10-31", 1)).toBe("2027-11-01");
  });

  it("shows an inclusive deadline range on each of its calendar days", () => {
    const item: AgendaItem = {
      id: "range",
      title: "Prüfungsanmeldung",
      startsAt: "2027-05-10",
      dueAt: "2027-05-24",
      type: "Anmeldung",
      origin: "channel",
      channel: "pos",
    };
    expect(itemsOnDay([item], "2027-05-09")).toEqual([]);
    expect(itemsOnDay([item], "2027-05-10")).toEqual([item]);
    expect(itemsOnDay([item], "2027-05-24")).toEqual([item]);
    expect(itemsOnDay([item], "2027-05-25")).toEqual([]);
  });

  it("combines all three deadline sources and exam dates, respects a simulated withdrawal", async () => {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    await store.getState().hydrate();
    store.getState().savePersonalDeadline({
      title: "Lerngruppe",
      dueAt: "2027-01-26T10:00:00+01:00",
      kind: "appointment",
    });
    store.getState().saveCoursework({
      moduleId: "m-stat",
      title: "Testat",
      status: "open",
      dueAt: "2027-01-26",
    });
    const all = () =>
      calendarItems(
        selectAgenda(store.getState()),
        selectAcademicState(store.getState()),
      );
    expect(itemsOnDay(all(), "2027-01-26").map((item) => item.title)).toEqual(
      expect.arrayContaining([
        "Abmeldung Statistik",
        "Lerngruppe",
        "Prüfungsvorleistung: Testat",
      ]),
    );
    expect(itemsOnDay(all(), "2027-01-27").map((item) => item.title)).toContain(
      "Prüfung Statistik",
    );
    store.getState().withdrawExam("e-stat-ws26");
    expect(all().some((item) => item.id === "exam-e-stat-ws26")).toBe(false);
    expect(
      selectAgenda(store.getState()).some((item) =>
        item.id.startsWith("exam-"),
      ),
    ).toBe(false);
  });
});
