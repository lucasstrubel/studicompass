import { describe, expect, it, vi } from "vitest";
import { DEMO_STORAGE_KEY } from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { MoodleError } from "@/services/moodle/errors";
import type { MoodleData } from "@/services/types";
import { createDemoStore, type MoodleSources } from "./demo-store";
import { selectDeadlines, selectInbox } from "./selectors";

const liveData: MoodleData = {
  progress: [{ moduleId: "m-pr2", label: "Abgaben 6/12" }],
  deadlines: [],
  inbox: [],
};
function makeStore(sources: Partial<MoodleSources> = {}) {
  const live = vi.fn<MoodleSources["live"]>(() =>
    Promise.resolve({
      service: { load: () => Promise.resolve(structuredClone(liveData)) },
      site: { siteName: "Sandbox", userName: "Niklas Brandt" },
    }),
  );
  const store = createDemoStore(
    createMockServices({ latencyMs: 0 }),
    undefined,
    { live, ...sources } as MoodleSources,
  );
  return { store, live };
}
const persisted = () => localStorage.getItem(DEMO_STORAGE_KEY) ?? "";

describe("Moodle data modes (ADR 0002)", () => {
  it("starts on the example data", async () => {
    const { store } = makeStore();
    await store.getState().hydrate();
    expect(store.getState().moodleSource).toBe("demo");
    expect(store.getState().resources.moodle.data?.progress[0].label).toBe(
      "Übungsblätter 5/12",
    );
  });

  it("replays the recording through the real adapter and feeds deadlines and inbox", async () => {
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    await store.getState().hydrate();
    await store.getState().setMoodleSource("recording");

    const state = store.getState();
    expect(state.resources.moodle.status).toBe("ready");
    expect(
      state.resources.moodle.data?.progress.find(
        (item) => item.moduleId === "m-pr2",
      )?.label,
    ).toBe("Abgaben 5/12");
    expect(selectDeadlines(state).map((item) => item.title)).toContain(
      "Abgabe Pflichtübung 6 Wirtschaftsinformatik 3",
    );
    expect(selectInbox(state).map((item) => item.subject)).toContain(
      "Klausurtermin Programmierung 2",
    );
    // The other channels keep their example data.
    expect(selectDeadlines(state).map((item) => item.id)).toContain(
      "d-pr2-abm",
    );
  });

  it("keeps the recording after a reload", async () => {
    const { store } = makeStore({
      recording: () =>
        Promise.resolve({ load: () => Promise.resolve(liveData) }),
    });
    await store.getState().setMoodleSource("recording");
    expect(JSON.parse(persisted())).toMatchObject({
      state: { moodleSource: "recording" },
    });
  });

  it("connects a site, loads from it and names it", async () => {
    const { store, live } = makeStore();
    await store.getState().hydrate();
    const result = await store
      .getState()
      .connectMoodle(" http://localhost:8080/ ", " key ");

    expect(result).toEqual({ ok: true });
    expect(live).toHaveBeenCalledWith({
      baseUrl: "http://localhost:8080",
      token: "key",
    });
    expect(store.getState()).toMatchObject({
      moodleSource: "live",
      moodleSite: {
        baseUrl: "http://localhost:8080",
        siteName: "Sandbox",
        userName: "Niklas Brandt",
      },
    });
    expect(store.getState().resources.moodle.data).toEqual(liveData);
  });

  it("never stores the access key or the live mode", async () => {
    const { store } = makeStore();
    await store.getState().connectMoodle("http://localhost:8080", "secret-key");
    expect(persisted()).not.toContain("secret-key");
    expect(JSON.stringify(store.getState())).not.toContain("secret-key");
    expect(JSON.parse(persisted())).toMatchObject({
      state: { moodleSource: "demo" },
    });
  });

  it("reports a failed connection and stays on the current source", async () => {
    const { store } = makeStore({
      live: () => Promise.reject(new MoodleError("invalidToken")),
    });
    await store.getState().hydrate();
    const result = await store
      .getState()
      .connectMoodle("http://localhost:8080", "wrong");

    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining(
        "Zugriffsschlüssel ist ungültig",
      ) as string,
    });
    expect(store.getState().moodleSource).toBe("demo");
    expect(store.getState().resources.moodle.status).toBe("ready");
  });

  it("refuses an address that is not http(s) and a missing key", async () => {
    const { store, live } = makeStore();
    for (const [url, key] of [
      ["javascript:alert(1)", "key"],
      ["http://localhost:8080", "  "],
    ])
      expect(await store.getState().connectMoodle(url, key)).toMatchObject({
        ok: false,
      });
    expect(live).not.toHaveBeenCalled();
  });

  it("shows the reason when the connected site fails later", async () => {
    let fail = false;
    const { store } = makeStore({
      live: () =>
        Promise.resolve({
          service: {
            load: () =>
              fail
                ? Promise.reject(new MoodleError("network"))
                : Promise.resolve(liveData),
          },
          site: { siteName: "Sandbox", userName: "Niklas Brandt" },
        }),
    });
    await store.getState().connectMoodle("http://localhost:8080", "key");
    fail = true;
    await store.getState().retry("moodle");
    expect(store.getState().resources.moodle).toMatchObject({
      status: "error",
      error: expect.stringContaining("Moodle ist nicht erreichbar") as string,
      data: liveData,
    });
  });

  it("returns to the example data on disconnect and on reset", async () => {
    const { store } = makeStore();
    await store.getState().connectMoodle("http://localhost:8080", "key");
    await store.getState().setMoodleSource("demo");
    expect(store.getState().moodleSite).toBeNull();
    expect(store.getState().resources.moodle.data?.progress).toHaveLength(5);

    await store.getState().connectMoodle("http://localhost:8080", "key");
    await store.getState().resetDemo();
    expect(store.getState()).toMatchObject({
      moodleSource: "demo",
      moodleSite: null,
    });
  });
});
