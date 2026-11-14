import { describe, expect, it, vi } from "vitest";
import { DEMO_STORAGE_KEY } from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { PosError } from "@/services/pos/errors";
import { mapTranscript } from "@/services/pos/mapping";
import { createDemoStore, type BridgeSources } from "./demo-store";
import {
  selectAgenda,
  selectCurrentExams,
  selectDeadlines,
  selectImportantDecisions,
  selectInbox,
  selectNotifications,
  selectPlan,
  selectProfileName,
  selectProgress,
} from "./selectors";

const transcript = {
  student: {
    firstName: "Mara",
    lastName: "Lindner",
    matriculationNo: "2212345",
  },
  entries: [
    {
      title: "Einführung in die Informatik",
      term: { season: "WS" as const, year: 2025 },
      status: "passed" as const,
      grade: 2.3,
    },
    {
      title: "Datenmanagement",
      term: { season: "WS" as const, year: 2026 },
      status: "registered" as const,
      date: "2027-01-29",
      withdrawalDeadline: "2027-01-28T23:59:00+01:00",
    },
  ],
};
function makeStore(sources: Partial<BridgeSources> = {}) {
  const pos = vi.fn<BridgeSources["pos"]>(async (_credentials, base) => {
    const data = mapTranscript(transcript, await base());
    return { service: { load: () => Promise.resolve(structuredClone(data)) } };
  });
  const store = createDemoStore(
    createMockServices({ latencyMs: 0 }),
    undefined,
    undefined,
    {
      channels: () => Promise.resolve({ mail: true, pos: true }),
      mail: () => Promise.reject(new Error("unused")),
      pos,
      ...sources,
    },
  );
  return { store, pos };
}
const persisted = () => localStorage.getItem(DEMO_STORAGE_KEY) ?? "";

describe("POS source (ADR 0005)", () => {
  it("starts on the example data", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    expect(store.getState().posAccount).toBeNull();
    expect(store.getState().resources.pos.data?.student.firstName).toBe(
      "Niklas",
    );
  });

  it("connects an account and replaces the example record", async () => {
    const { store, pos } = makeStore();
    await store.getState().hydrate();
    expect(await store.getState().connectPos(" 2212345 ", "geheim")).toEqual({
      ok: true,
    });

    expect(pos.mock.calls[0][0]).toEqual({
      user: "2212345",
      password: "geheim",
    });
    const state = store.getState();
    expect(state.posAccount).toEqual({ userName: "2212345" });
    expect(state.resources.pos.data?.exams.map((exam) => exam.id)).toEqual([
      "pos-m-ei-ws2025",
      "pos-m-dm-ws2026",
    ]);
    expect(selectProfileName(state)).toEqual({
      firstName: "Mara",
      lastName: "Lindner",
    });
    expect(selectDeadlines(state).map((item) => item.title)).toContain(
      "Abmeldung Datenmanagement",
    );
    expect(selectDeadlines(state).map((item) => item.id)).not.toContain(
      "d-pr2-abm",
    );
  });

  it("keeps every view computable on a record the example data never had", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    await store.getState().connectPos("2212345", "geheim");
    const state = store.getState();

    expect(selectProgress(state)).not.toBeNull();
    expect(selectPlan(state)).not.toBeNull();
    expect(selectCurrentExams(state).map((item) => item.exam.id)).toEqual([
      "pos-m-dm-ws2026",
    ]);
    // Hints and notifications of the example scenario name exams this record does not contain.
    expect(() => selectNotifications(state)).not.toThrow();
    expect(() => selectImportantDecisions(state)).not.toThrow();
    expect(() => selectAgenda(state)).not.toThrow();
    expect(() => selectInbox(state)).not.toThrow();
  });

  it("ends simulated decisions when the source changes", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    expect(store.getState().withdrawExam("e-pr2-ws26")).toBe(true);
    await store.getState().connectPos("2212345", "geheim");
    expect(store.getState()).toMatchObject({
      withdrawnExamIds: [],
      snapshot: null,
    });

    expect(store.getState().withdrawExam("pos-m-dm-ws2026")).toBe(true);
    await store.getState().disconnectPos();
    expect(store.getState()).toMatchObject({
      posAccount: null,
      withdrawnExamIds: [],
      snapshot: null,
    });
    expect(store.getState().resources.pos.data?.student.firstName).toBe(
      "Niklas",
    );
  });

  it("never stores the password or the connection", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    await store.getState().connectPos("2212345", "geheim-4711");
    store.getState().setHintTone("neutral");
    expect(persisted()).not.toContain("geheim-4711");
    expect(JSON.stringify(store.getState())).not.toContain("geheim-4711");
    expect(persisted()).not.toContain("posAccount");
    expect(persisted()).not.toContain("Lindner");
  });

  it("reports a refused login and stays on the example data", async () => {
    const { store } = makeStore({
      pos: () => Promise.reject(new PosError("auth")),
    });
    await store.getState().hydrate();
    expect(await store.getState().connectPos("2212345", "falsch")).toEqual({
      ok: false,
      error: expect.stringContaining("Anmeldung am POS") as string,
    });
    expect(store.getState().posAccount).toBeNull();
    expect(store.getState().resources.pos.data?.student.firstName).toBe(
      "Niklas",
    );
  });

  it("says so while the bridge cannot read the POS yet", async () => {
    const { store } = makeStore({
      channels: () => Promise.resolve({ mail: true, pos: false }),
      pos: () => Promise.reject(new PosError("unavailable")),
    });
    await store.getState().checkBridge();
    expect(store.getState()).toMatchObject({
      mailBridge: "available",
      posBridge: "unavailable",
    });
    expect(await store.getState().connectPos("2212345", "geheim")).toEqual({
      ok: false,
      error: expect.stringContaining("nicht verbinden") as string,
    });
  });

  it("drops the account on a reset", async () => {
    const { store } = makeStore();
    await store.getState().connectPos("2212345", "geheim");
    await store.getState().resetDemo();
    expect(store.getState().posAccount).toBeNull();
    expect(store.getState().resources.pos.data?.student.firstName).toBe(
      "Niklas",
    );
  });
});
