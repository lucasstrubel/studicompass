import { describe, expect, it } from "vitest";
import { DATA_VERSION, DEMO_STORAGE_KEY } from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { createDemoStore } from "./demo-store";
import {
  selectAcademicState,
  selectBasePlan,
  selectProfileName,
} from "./selectors";

const makeStore = () => createDemoStore(createMockServices({ latencyMs: 0 }));

describe("P5-15: lokales Profil", () => {
  it("persists display names, leaves POS and the projection untouched, resets to Niklas", async () => {
    const store = makeStore();
    await store.getState().hydrate();
    const plan = selectBasePlan(store.getState());
    expect(
      store
        .getState()
        .saveProfile({
          firstName: " Alex ",
          lastName: " Muster ",
          goalRegularTime: true,
          jobHoursPerWeek: 15,
        }),
    ).toBe(true);
    expect(selectProfileName(store.getState())).toEqual({
      firstName: "Alex",
      lastName: "Muster",
    });
    expect(selectAcademicState(store.getState())?.student.firstName).toBe(
      "Niklas",
    );
    expect(store.getState().resources.pos.data?.student.lastName).toBe(
      "Brandt",
    );
    expect(selectBasePlan(store.getState())).toEqual(plan);
    expect(selectProfileName(makeStore().getState())).toEqual({
      firstName: "Alex",
      lastName: "Muster",
    });
    await store.getState().resetDemo();
    expect(store.getState().profileName).toBeNull();
    expect(selectProfileName(store.getState())).toEqual({
      firstName: "Niklas",
      lastName: "Brandt",
    });
  });

  it("rejects invalid edits atomically, without losing goal or job hours", async () => {
    const store = makeStore();
    await store.getState().hydrate();
    const before = store.getState();
    expect(
      store
        .getState()
        .saveProfile({
          firstName: " ",
          lastName: "Muster",
          goalRegularTime: false,
          jobHoursPerWeek: 20,
        }),
    ).toBe(false);
    expect(store.getState()).toBe(before);
    expect(
      store
        .getState()
        .saveProfile({
          firstName: "Alex",
          lastName: "Muster",
          goalRegularTime: false,
          jobHoursPerWeek: Number.NaN,
        }),
    ).toBe(false);
    expect(store.getState()).toBe(before);
  });

  it("migrates version 3, retains own entries and decisions, drops only invalid profile names", async () => {
    localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify({
        version: 3,
        state: {
          profileName: { firstName: "", lastName: "Muster" },
          withdrawnExamIds: ["e-stat-ws26"],
          hintTone: "neutral",
          jobHoursPerWeek: 20,
          moduleNotes: { "m-stat": "Testat fehlt" },
          coursework: [
            { id: "c-1", moduleId: "m-stat", title: "Testat", status: "open" },
          ],
          personalDeadlines: [
            {
              id: "p-1",
              title: "Lerngruppe",
              dueAt: "2027-01-26",
              kind: "appointment",
            },
          ],
        },
      }),
    );
    const store = makeStore();
    await store.getState().hydrate();
    expect(store.getState()).toMatchObject({
      profileName: null,
      withdrawnExamIds: ["e-stat-ws26"],
      hintTone: "neutral",
      jobHoursPerWeek: 20,
      moduleNotes: { "m-stat": "Testat fehlt" },
    });
    expect(store.getState().coursework).toHaveLength(1);
    expect(store.getState().personalDeadlines).toHaveLength(1);
    expect(selectProfileName(store.getState())?.firstName).toBe("Niklas");
    expect(
      JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? "{}"),
    ).toMatchObject({ version: DATA_VERSION });
  });
});
