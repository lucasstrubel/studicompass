import { describe, expect, it } from "vitest";
import { createMockServices } from "@/services/mock";
import { createDemoStore } from "./demo-store";
import {
  selectAcademicState,
  selectBasePlan,
  selectCurrentExams,
  selectImportantDecisions,
  selectMilestone,
  selectNextDeadline,
  selectRecentGrades,
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

describe("P3-02 overview selectors (KONZEPT §8 S1)", () => {
  async function loadedStore() {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    await store.getState().hydrate();
    return store;
  }

  it("lists the five registered exams of WS 2026/27 with Moodle progress", async () => {
    const exams = selectCurrentExams((await loadedStore()).getState());
    expect(exams.map((item) => item.module.id)).toEqual([
      "m-stat",
      "m-db",
      "m-se1",
      "m-gpm",
      "m-mkt",
    ]);
    expect(exams[0].progress?.label).toBe("Übungsblätter 5/12");
  });

  it("finds the next deadline after DEMO_NOW, skipping a withdrawn exam", async () => {
    const store = await loadedStore();
    expect(selectNextDeadline(store.getState())?.id).toBe("d-stat-abm");
    store.getState().withdrawExam("e-stat-ws26");
    expect(selectNextDeadline(store.getState())?.id).toBe("d-db-abm");
  });

  it("raises only Statistik under Jetzt wichtig, and nothing once it is withdrawn", async () => {
    const store = await loadedStore();
    const important = selectImportantDecisions(store.getState());
    expect(important.map((item) => item.exam.id)).toEqual(["e-stat-ws26"]);
    expect(important[0].message).toContain("Morgen um 23:59 ist Schluss.");

    store.getState().withdrawExam("e-stat-ws26");
    expect(selectImportantDecisions(store.getState())).toEqual([]);
  });

  it("shows the three latest grades", async () => {
    const grades = selectRecentGrades((await loadedStore()).getState());
    expect(grades.map((item) => item.module.id)).toEqual([
      "m-klr",
      "m-bsrn",
      "m-mathe2",
    ]);
  });

  it("summarises the internship milestone, before and after withdrawing Statistik", async () => {
    const store = await loadedStore();
    const before = selectMilestone(store.getState());
    expect(before).toMatchObject({
      internshipTerm: { season: "WS", year: 2027 },
      internshipShift: 0,
      graduationTerm: { season: "WS", year: 2028 },
    });
    expect(before?.openFoundation).toHaveLength(7);
    expect(before?.registeredNow).toHaveLength(5);
    expect(
      before?.later.map((item) => [item.module.id, item.term.season]),
    ).toEqual([
      ["m-prog2", "SS"],
      ["m-recht", "SS"],
    ]);

    store.getState().withdrawExam("e-stat-ws26");
    expect(selectMilestone(store.getState())).toMatchObject({
      internshipTerm: { season: "SS", year: 2028 },
      internshipShift: 1,
      graduationTerm: { season: "SS", year: 2029 },
    });
    expect(selectProgress(store.getState())?.trafficLight).toBe("critical");
  });

  it("ignores what-if overrides in the base plan", async () => {
    const store = await loadedStore();
    store.getState().setWhatIf([
      {
        moduleId: "m-recht",
        action: "move",
        term: { season: "SS", year: 2028 },
      },
    ]);
    expect(selectBasePlan(store.getState())?.graduationTerm).toEqual({
      season: "WS",
      year: 2028,
    });
  });
});
