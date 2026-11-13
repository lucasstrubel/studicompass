import { describe, expect, it } from "vitest";
import { DEMO_STORAGE_KEY } from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { createDemoStore } from "./demo-store";
import {
  selectInbox,
  selectMoodleChanges,
  selectNotifications,
} from "./selectors";

const NEW_FILE = "Neue Datei: Vorlesung 03: Ausnahmen und Ein-/Ausgabe";
const GRADE = "Bewertung: Pflichtübung (8 von 10 Punkten)";

async function recordingStore() {
  const store = createDemoStore(createMockServices({ latencyMs: 0 }));
  await store.getState().hydrate();
  await store.getState().setMoodleSource("recording");
  return store;
}
const subjects = (store: Awaited<ReturnType<typeof recordingStore>>) =>
  selectInbox(store.getState()).map((item) => item.subject);

describe("Neu in Moodle", () => {
  it("takes the first sync as the baseline: nothing is new", async () => {
    const store = await recordingStore();
    expect(selectMoodleChanges(store.getState())).toEqual([]);
    expect(Object.keys(store.getState().moodleKnown)).toEqual(["recording"]);
    expect(subjects(store)).not.toContain(NEW_FILE);
  });

  it("reports what changed on the next sync, in inbox and notifications", async () => {
    const store = await recordingStore();
    const unreadBefore = selectNotifications(store.getState()).filter(
      (item) => !item.read,
    ).length;
    await store.getState().refreshMoodle();

    const state = store.getState();
    expect(
      selectMoodleChanges(state)
        .map((change) => `${change.moduleId}/${change.type}/${change.kind}`)
        .sort(),
    ).toEqual([
      "m-dm/added/announcement",
      "m-pr2/added/file",
      "m-web/graded/assignment",
    ]);
    // The announcement is an inbox entry of its own already; file and grade get one each.
    expect(subjects(store)).toEqual(
      expect.arrayContaining([
        NEW_FILE,
        GRADE,
        "Zusatztermin zur Klausurvorbereitung",
      ]),
    );
    expect(
      subjects(store).filter((subject) =>
        subject.startsWith("Neue Ankündigung"),
      ),
    ).toEqual([]);
    const fromMoodle = selectNotifications(state).filter((item) =>
      item.id.startsWith("moodle-change-"),
    );
    expect(fromMoodle.map((item) => item.message).sort()).toEqual([
      "Datenmanagement: Neue Ankündigung: Zusatztermin zur Klausurvorbereitung",
      `Programmierung 2: ${NEW_FILE}`,
      `Webbasierte Systeme: ${GRADE}`,
    ]);
    expect(
      selectNotifications(state).filter((item) => !item.read),
    ).toHaveLength(unreadBefore + 3);
    expect(state.resources.moodle.data?.progress).toHaveLength(5);
  });

  it("finds nothing new when syncing again", async () => {
    const store = await recordingStore();
    await store.getState().refreshMoodle();
    await store.getState().refreshMoodle();
    expect(selectMoodleChanges(store.getState())).toHaveLength(3);
  });

  it("marks a change as read in the inbox and in the notifications together", async () => {
    const store = await recordingStore();
    await store.getState().refreshMoodle();
    const change = selectMoodleChanges(store.getState()).find(
      (item) => item.kind === "file",
    );
    store.getState().markRead(change?.id ?? "");
    const state = store.getState();
    expect(
      selectInbox(state).find((item) => item.id === change?.id)?.read,
    ).toBe(true);
    expect(
      selectNotifications(state).find((item) => item.id === change?.id)?.read,
    ).toBe(true);

    store.getState().markAllNotificationsRead();
    expect(
      selectNotifications(store.getState()).every((item) => item.read),
    ).toBe(true);
  });

  it("keeps changes and the known state across a reload", async () => {
    const store = await recordingStore();
    await store.getState().refreshMoodle();
    const persisted = JSON.parse(
      localStorage.getItem(DEMO_STORAGE_KEY) ?? "{}",
    ) as { state: { moodleChanges: unknown[]; moodleKnown: object } };
    expect(persisted.state.moodleChanges).toHaveLength(3);

    const reloaded = createDemoStore(createMockServices({ latencyMs: 0 }));
    await reloaded.getState().hydrate();
    expect(reloaded.getState().moodleSource).toBe("recording");
    expect(selectMoodleChanges(reloaded.getState())).toHaveLength(3);
    // The reloaded recording shows the state it was left in, not the seeded one.
    expect(
      selectInbox(reloaded.getState()).map((item) => item.subject),
    ).toContain("Zusatztermin zur Klausurvorbereitung");
  });

  it("drops stored changes of another shape", async () => {
    localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify({
        version: 6,
        state: {
          moodleSource: "recording",
          moodleKnown: { recording: { "1/cm1": { signature: 5 } }, x: "y" },
          moodleChanges: [{ id: "a" }, "b", null],
        },
      }),
    );
    const store = createDemoStore(createMockServices({ latencyMs: 0 }));
    await Promise.resolve();
    expect(store.getState().moodleChanges).toEqual([]);
    expect(store.getState().moodleKnown).toEqual({ recording: {} });
  });

  it("hides the changes with the example data and starts the recording over", async () => {
    const store = await recordingStore();
    await store.getState().refreshMoodle();
    await store.getState().setMoodleSource("demo");
    expect(selectMoodleChanges(store.getState())).toEqual([]);
    expect(subjects(store)).not.toContain(NEW_FILE);

    await store.getState().setMoodleSource("recording");
    expect(selectMoodleChanges(store.getState())).toEqual([]);
    await store.getState().refreshMoodle();
    expect(selectMoodleChanges(store.getState())).toHaveLength(3);
  });

  it("forgets everything on a demo reset", async () => {
    const store = await recordingStore();
    await store.getState().refreshMoodle();
    await store.getState().resetDemo();
    expect(store.getState()).toMatchObject({
      moodleSource: "demo",
      moodleKnown: {},
      moodleChanges: [],
    });
  });
});
