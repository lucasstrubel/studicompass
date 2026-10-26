import { describe, expect, it } from "vitest";
import { createMockServices } from "@/services/mock";
import { createDemoStore } from "./demo-store";
import {
  selectAcademicState,
  selectDeadlines,
  selectInbox,
  selectNotifications,
  selectPlan,
  selectProgress,
} from "./selectors";

describe("P2 selectors: stable snapshots and connected simulation", () => {
  it("provides stable selector references until state changes", async () => {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    expect(selectProgress(store.getState())).toBeNull();
    await store.getState().hydrate();
    const state = store.getState();
    expect(selectAcademicState(state)).toBe(selectAcademicState(state));
    expect(selectInbox(state)).toBe(selectInbox(state));
    expect(selectDeadlines(state)).toBe(selectDeadlines(state));
    expect(selectNotifications(state)).toBe(selectNotifications(state));
    expect(selectPlan(state)).toBe(selectPlan(state));
    expect(selectProgress(state)).toBe(selectProgress(state));
    store.getState().markRead("i-02");
    expect(selectInbox(store.getState())).not.toBe(selectInbox(state));
  });

  it("connects withdrawal, what-if and undo to the binding oracle values", async () => {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    await store.getState().hydrate();
    expect(selectProgress(store.getState())).toMatchObject({
      earnedEcts: 48,
      targetEcts: 60,
      gradeAverage: 2.4,
      trafficLight: "tight",
    });
    expect(selectPlan(store.getState())).toMatchObject({
      ectsEndOfTerm: 78,
      internshipTerm: { season: "WS", year: 2027 },
    });
    store.getState().setWhatIf([{ moduleId: "m-mkt", action: "withdraw" }]);
    expect(selectPlan(store.getState())).toMatchObject({
      ectsEndOfTerm: 72,
      trafficLight: "tight",
      internshipShift: 0,
    });
    expect(
      selectAcademicState(store.getState())?.exams.find(
        (exam) => exam.id === "e-mkt-ws26",
      )?.status,
    ).toBe("registered");
    store.getState().clearWhatIf();
    store.getState().withdrawExam("e-stat-ws26");
    expect(selectPlan(store.getState())).toMatchObject({
      ectsEndOfTerm: 72,
      trafficLight: "critical",
      internshipTerm: { season: "SS", year: 2028 },
      graduationTerm: { season: "SS", year: 2029 },
    });
    expect(selectProgress(store.getState())?.trafficLight).toBe("critical");
    store.getState().undo();
    expect(selectPlan(store.getState())).toMatchObject({
      ectsEndOfTerm: 78,
      trafficLight: "tight",
      internshipShift: 0,
    });
    expect(() =>
      store.getState().setWhatIf([
        {
          moduleId: "m-stat",
          action: "move",
          term: { season: "SS", year: 2027 },
        },
      ]),
    ).toThrow(RangeError);
    expect(store.getState().whatIf).toEqual([]);
  });
});
