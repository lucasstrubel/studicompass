import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DATA_VERSION,
  DEMO_NOW,
  DEMO_STORAGE_KEY,
  FLAGS,
  LATENCY_MS,
  THEME_STORAGE_KEY,
} from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { createDemoStore } from "./demo-store";
import {
  selectAcademicState,
  selectDeadlines,
  selectInbox,
  selectNotifications,
} from "./selectors";

afterEach(() => {
  vi.useRealTimers();
  FLAGS.simulateErrors = false;
});

describe("P2-05: channel loading and recovery", () => {
  it("exposes loading for the configured latency and then independent channel data", async () => {
    vi.useFakeTimers();
    const store = createDemoStore();
    expect(store.getState().resources.pos.status).toBe("idle");
    const ready = store.getState().hydrate();
    expect(store.getState().resources.pos.status).toBe("loading");
    await vi.advanceTimersByTimeAsync(LATENCY_MS - 1);
    expect(store.getState().resources.pos.status).toBe("loading");
    await vi.advanceTimersByTimeAsync(1);
    await ready;
    expect(
      Object.values(store.getState().resources).every(
        (resource) => resource.status === "ready",
      ),
    ).toBe(true);
    expect(store.getState().resources.pos.updatedAt).toBe(
      DEMO_NOW.toISOString(),
    );
    expect(selectInbox(store.getState())).toHaveLength(12);
    expect(selectDeadlines(store.getState())).toHaveLength(10);
    expect(store.getState().resources.moodle.data?.progress).toHaveLength(5);
  });

  it("isolates a channel failure and supports a successful retry", async () => {
    let failed = true;
    const store = createDemoStore(
      createMockServices({
        latencyMs: 0,
        shouldFail: (key) => failed && key === "moodle",
      }),
    );
    await store.getState().hydrate();
    expect(store.getState().resources.moodle).toMatchObject({
      status: "error",
      data: null,
      updatedAt: null,
    });
    expect(store.getState().resources.moodle.error).toBeTruthy();
    expect(store.getState().resources.pos.status).toBe("ready");
    failed = false;
    await store.getState().retry("moodle");
    expect(store.getState().resources.moodle).toMatchObject({
      status: "ready",
      error: null,
    });
  });

  it("FLAGS.simulateErrors causes a visible service error and retains stale data on retry", async () => {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    await store.getState().hydrate();
    FLAGS.simulateErrors = true;
    await store.getState().retry("pos");
    expect(store.getState().resources.pos.status).toBe("error");
    expect(store.getState().resources.pos.data?.exams).toHaveLength(15);
    expect(store.getState().resources.pos.updatedAt).toBe(
      DEMO_NOW.toISOString(),
    );
  });

  it("supports successful empty channel responses", async () => {
    const services = createMockServices({ latencyMs: 0 });
    services.mail.load = () => Promise.resolve({ inbox: [], deadlines: [] });
    const store = createDemoStore(services);
    await store.getState().hydrate();
    expect(store.getState().resources.mail).toMatchObject({
      status: "ready",
      data: { inbox: [], deadlines: [] },
    });
  });
});

describe("P2-05: simulations and persistence", () => {
  const makeStore = () => createDemoStore(createMockServices({ latencyMs: 0 }));

  it("simulates withdrawal, preserves attempts and restores the academic snapshot on undo", async () => {
    const store = makeStore();
    await store.getState().hydrate();
    const original = selectAcademicState(store.getState());
    expect(store.getState().withdrawExam("e-stat-ws26")).toBe(true);
    expect(
      selectAcademicState(store.getState())?.exams.find(
        (exam) => exam.id === "e-stat-ws26",
      ),
    ).toMatchObject({ status: "withdrawn", attempt: 1 });
    expect(store.getState().snapshot).not.toBeNull();
    expect(store.getState().withdrawExam("e-stat-ws26")).toBe(false);
    expect(store.getState().withdrawExam("e-gwi-ws25")).toBe(false);
    expect(store.getState().withdrawExam("unknown")).toBe(false);
    store.getState().undo();
    expect(selectAcademicState(store.getState())).toEqual(original);
    expect(store.getState().snapshot).toBeNull();
    expect(store.getState().confirmAttend("e-stat-ws26")).toBe(true);
    expect(store.getState().confirmedExamIds).toContain("e-stat-ws26");
  });

  it("rejects withdrawals after their deadline", async () => {
    const services = createMockServices({ latencyMs: 0 });
    const load = services.pos.load;
    services.pos.load = async () => {
      const data = await load();
      return {
        ...data,
        exams: data.exams.map((exam) => ({
          ...exam,
          withdrawalDeadline: "2027-01-24T23:59:00+01:00",
        })),
      };
    };
    const store = createDemoStore(services);
    await store.getState().hydrate();
    expect(store.getState().withdrawExam("e-stat-ws26")).toBe(false);
    expect(store.getState().snapshot).toBeNull();
  });

  it("persists user changes across reload and discards them on data-version changes", async () => {
    const store = makeStore();
    await store.getState().hydrate();
    store.getState().withdrawExam("e-stat-ws26");
    store.getState().markRead("i-02");
    store.getState().markNotificationRead("n-01");
    store.getState().setHintTone("neutral");
    store
      .getState()
      .completeOnboarding({ goalRegularTime: false, jobHoursPerWeek: 12 });
    store.getState().setTheme("dark");
    const reloaded = makeStore();
    await reloaded.getState().hydrate();
    expect(
      selectAcademicState(reloaded.getState())?.exams.find(
        (exam) => exam.id === "e-stat-ws26",
      )?.status,
    ).toBe("withdrawn");
    expect(
      selectInbox(reloaded.getState()).find((item) => item.id === "i-02")?.read,
    ).toBe(true);
    expect(
      selectNotifications(reloaded.getState()).find(
        (item) => item.id === "n-01",
      )?.read,
    ).toBe(true);
    expect(reloaded.getState()).toMatchObject({
      theme: "dark",
      hintTone: "neutral",
      onboardingComplete: true,
      jobHoursPerWeek: 12,
    });
    expect(localStorage.getItem(DEMO_STORAGE_KEY)).not.toContain('"theme"');
    reloaded.getState().undo();
    expect(
      selectAcademicState(reloaded.getState())?.exams.find(
        (exam) => exam.id === "e-stat-ws26",
      )?.status,
    ).toBe("registered");
    localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify({
        version: DATA_VERSION - 1,
        state: { withdrawnExamIds: ["e-stat-ws26"], hintTone: "neutral" },
      }),
    );
    expect(makeStore().getState()).toMatchObject({
      withdrawnExamIds: [],
      hintTone: "direct",
      theme: "dark",
    });
  });

  it("what-if remains temporary and reset restores the fixture without losing the theme", async () => {
    const store = makeStore();
    await store.getState().hydrate();
    const baseline = selectAcademicState(store.getState());
    store.getState().setWhatIf([{ moduleId: "m-stat", action: "withdraw" }]);
    expect(selectAcademicState(store.getState())).toEqual(baseline);
    expect(makeStore().getState().whatIf).toEqual([]);
    store.getState().clearWhatIf();
    store.getState().withdrawExam("e-stat-ws26");
    store.getState().markRead("i-02");
    store.getState().setTheme("dark");
    await store.getState().resetDemo();
    expect(selectAcademicState(store.getState())).toEqual(baseline);
    expect(store.getState()).toMatchObject({
      readInboxIds: [],
      snapshot: null,
      whatIf: [],
      hintTone: "direct",
      theme: "dark",
    });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("ignores an obsolete response when reset races with hydration", async () => {
    const services = createMockServices({ latencyMs: 0 });
    const originalLoad = services.pos.load;
    let resolveFirst: (() => void) | undefined;
    const delayed = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    let calls = 0;
    services.pos.load = async () => {
      const data = await originalLoad();
      if (++calls === 1) {
        await delayed;
        data.student.firstName = "Veraltet";
      }
      return data;
    };
    const store = createDemoStore(services);
    const first = store.getState().hydrate();
    await new Promise((resolve) => setTimeout(resolve, 5));
    await store.getState().resetDemo();
    resolveFirst?.();
    await first;
    expect(selectAcademicState(store.getState())?.student.firstName).toBe(
      "Niklas",
    );
  });

  it("continues when storage is blocked or contains invalid values", async () => {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }), {
      getItem: () =>
        JSON.stringify({
          version: DATA_VERSION,
          state: {
            withdrawnExamIds: [7, "e-stat-ws26"],
            jobHoursPerWeek: -12,
            hintTone: "other",
          },
        }),
      setItem: () => undefined,
      removeItem: () => undefined,
    });
    expect(store.getState()).toMatchObject({
      withdrawnExamIds: ["e-stat-ws26"],
      jobHoursPerWeek: 15,
      hintTone: "direct",
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const blocked = makeStore();
    await blocked.getState().hydrate();
    expect(() => blocked.getState().setHintTone("neutral")).not.toThrow();
    vi.restoreAllMocks();
  });
});
