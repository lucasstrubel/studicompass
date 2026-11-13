import { describe, expect, it, vi } from "vitest";
import { createMockServices } from "@/services/mock";
import { createMoodleClient } from "@/services/moodle/client";
import { MoodleError } from "@/services/moodle/errors";
import {
  createMoodleStorage,
  type MoodleStorage,
} from "@/services/moodle/storage";
import { createDemoStore, type MoodleSources } from "./demo-store";

/** A Moodle that keeps one file, like the private files of a user. */
function memoryStorage(initial: string | null = null) {
  let text = initial;
  const storage: MoodleStorage = {
    save: vi.fn((next: string) => {
      text = next;
      return Promise.resolve("2027-01-25T18:30:00.000Z");
    }),
    load: vi.fn(() =>
      Promise.resolve(
        text === null ? null : { text, savedAt: "2027-01-25T18:30:00.000Z" },
      ),
    ),
  };
  return { storage, read: () => text };
}
async function connected(storage?: MoodleStorage) {
  const sources = {
    live: () =>
      Promise.resolve({
        service: {
          load: () =>
            Promise.resolve({
              progress: [],
              deadlines: [],
              inbox: [],
              courses: [],
            }),
        },
        site: { siteName: "Sandbox", userName: "Niklas Brandt" },
        storage,
      }),
  } as unknown as MoodleSources;
  const store = createDemoStore(
    createMockServices({ latencyMs: 0 }),
    undefined,
    sources,
  );
  await store.getState().connectMoodle("http://localhost:8080", "key");
  return store;
}
function fill(store: Awaited<ReturnType<typeof connected>>) {
  const state = store.getState();
  state.saveCoursework({
    moduleId: "m-wi3",
    title: "Pflichtübung 5",
    status: "open",
    effortHours: 4,
    steps: [{ id: "s1", title: "Lesen", done: true }],
  });
  state.setModuleNote("m-pr2", "Altklausuren rechnen");
  state.saveCourseLink("m-pr2", {
    label: "Skript",
    url: "https://example.org/skript",
  });
  state.savePersonalDeadline({
    title: "Lerngruppe",
    dueAt: "2027-01-28",
    kind: "appointment",
  });
}

describe("backup of the own entries in Moodle", () => {
  it("writes exactly the own entries and never preferences or the access key", async () => {
    const moodle = memoryStorage();
    const store = await connected(moodle.storage);
    fill(store);
    expect(await store.getState().saveToMoodle()).toEqual({ ok: true });

    const saved = JSON.parse(moodle.read() ?? "") as Record<string, unknown>;
    expect(Object.keys(saved).sort()).toEqual([
      "app",
      "courseLinks",
      "coursework",
      "format",
      "moduleNotes",
      "moodleUrls",
      "personalDeadlines",
    ]);
    expect(saved).toMatchObject({ app: "studicompass", format: 1 });
    expect(moodle.read()).not.toContain("key");
    expect(store.getState().moodleBackupAt).toBe("2027-01-25T18:30:00.000Z");
  });

  it("restores the entries in another browser", async () => {
    const moodle = memoryStorage();
    const first = await connected(moodle.storage);
    fill(first);
    await first.getState().saveToMoodle();
    localStorage.clear();

    const second = await connected(moodle.storage);
    expect(second.getState().coursework).toEqual([]);
    expect(await second.getState().restoreFromMoodle()).toEqual({ ok: true });
    const state = second.getState();
    expect(state.coursework).toMatchObject([
      {
        title: "Pflichtübung 5",
        effortHours: 4,
        steps: [{ title: "Lesen", done: true }],
      },
    ]);
    expect(state.moduleNotes).toEqual({ "m-pr2": "Altklausuren rechnen" });
    expect(state.courseLinks["m-pr2"]).toMatchObject([{ label: "Skript" }]);
    expect(state.personalDeadlines).toMatchObject([{ title: "Lerngruppe" }]);
  });

  it("replaces local entries and drops what has another shape or an unsafe address", async () => {
    const moodle = memoryStorage(
      JSON.stringify({
        app: "studicompass",
        format: 1,
        coursework: [
          { id: "a", moduleId: "m-dm", title: "Blatt 12", status: "done" },
          { id: "b", title: 7 },
        ],
        courseLinks: {
          "m-dm": [{ id: "l", label: "Böse", url: "javascript:alert(1)" }],
        },
        moduleNotes: { "m-dm": "ok", "m-web": 5 },
      }),
    );
    const store = await connected(moodle.storage);
    fill(store);
    await store.getState().restoreFromMoodle();
    const state = store.getState();
    expect(state.coursework).toEqual([
      { id: "a", moduleId: "m-dm", title: "Blatt 12", status: "done" },
    ]);
    expect(state.courseLinks).toEqual({});
    expect(state.moduleNotes).toEqual({ "m-dm": "ok" });
    expect(state.personalDeadlines).toEqual([]);
  });

  it.each([
    ["no file", null, "noch keine Sicherung"],
    ["not JSON", "<html>", "lässt sich nicht lesen"],
    ["another app", '{"app":"x","format":1}', "lässt sich nicht lesen"],
    [
      "a newer format",
      '{"app":"studicompass","format":2}',
      "lässt sich nicht lesen",
    ],
  ])(
    "keeps the local entries when Moodle holds %s",
    async (_name, text, error) => {
      const store = await connected(memoryStorage(text).storage);
      fill(store);
      const result = await store.getState().restoreFromMoodle();
      expect(result).toEqual({
        ok: false,
        error: expect.stringContaining(error) as string,
      });
      expect(store.getState().coursework).toHaveLength(1);
    },
  );

  it("reports whether a backup exists and what went wrong", async () => {
    const empty = await connected(memoryStorage().storage);
    await empty.getState().checkMoodleBackup();
    expect(empty.getState().moodleBackupAt).toBe("none");

    const failing = await connected({
      save: () => Promise.reject(new MoodleError("network")),
      load: () => Promise.reject(new MoodleError("invalidToken")),
    });
    expect(await failing.getState().saveToMoodle()).toEqual({
      ok: false,
      error: expect.stringContaining("nicht erreichbar") as string,
    });
    expect(await failing.getState().checkMoodleBackup()).toEqual({
      ok: false,
      error: expect.stringContaining("Zugriffsschlüssel") as string,
    });
  });

  it("needs a connected Moodle and forgets the backup state on disconnect", async () => {
    const store = await connected(memoryStorage("{}").storage);
    await store.getState().checkMoodleBackup();
    await store.getState().setMoodleSource("demo");
    expect(store.getState().moodleBackupAt).toBeNull();
    expect(await store.getState().saveToMoodle()).toEqual({
      ok: false,
      error: "Verbinde zuerst ein eigenes Moodle.",
    });
  });
});

describe("createMoodleStorage", () => {
  const connection = { baseUrl: "http://moodle.example/", token: "k e/y" };
  const listed = {
    files: [
      { contextid: 11, filename: "andere.txt", timemodified: 5 },
      {
        contextid: 11,
        filename: "studicompass.json",
        timemodified: 1800000000,
      },
    ],
  };
  function setup(responses: Record<string, unknown>) {
    const calls: { url: string; body: unknown }[] = [];
    const request = vi.fn<typeof fetch>((input, init) => {
      const url = `${input as string}`;
      calls.push({ url, body: init?.body });
      const name =
        init?.body instanceof URLSearchParams
          ? (init.body.get("wsfunction") ?? "")
          : url.includes("upload.php")
            ? "upload"
            : "download";
      const body = responses[name];
      return Promise.resolve(
        new Response(typeof body === "string" ? body : JSON.stringify(body), {
          status: body === undefined ? 404 : 200,
        }),
      );
    });
    const client = createMoodleClient(connection, { fetch: request });
    return {
      storage: createMoodleStorage(connection, client, 3, { fetch: request }),
      calls,
    };
  }

  it("uploads the file as a draft, moves it into the private files and returns Moodle's time", async () => {
    const { storage, calls } = setup({
      upload: [{ itemid: 77 }],
      core_user_add_user_private_files: null,
      core_files_get_files: listed,
    });
    expect(await storage.save('{"a":1}')).toBe("2027-01-15T08:00:00.000Z");

    expect(calls[0].url).toBe("http://moodle.example/webservice/upload.php");
    const form = calls[0].body as FormData;
    expect(form.get("token")).toBe("k e/y");
    expect((form.get("file_1") as File).name).toBe("studicompass.json");
    expect(await (form.get("file_1") as File).text()).toBe('{"a":1}');
    expect((calls[1].body as URLSearchParams).get("draftid")).toBe("77");
  });

  it("reads the file of the user's own context", async () => {
    const { storage, calls } = setup({
      core_files_get_files: listed,
      download: '{"a":1}',
    });
    expect(await storage.load()).toEqual({
      text: '{"a":1}',
      savedAt: "2027-01-15T08:00:00.000Z",
    });
    expect(calls[1].url).toBe(
      "http://moodle.example/webservice/pluginfile.php/11/user/private/studicompass.json?token=k%20e%2Fy",
    );
    expect(Object.fromEntries(calls[0].body as URLSearchParams)).toMatchObject({
      contextlevel: "user",
      instanceid: "3",
      filearea: "private",
    });
  });

  it("returns null without a file and maps failures to MoodleError", async () => {
    expect(
      await setup({ core_files_get_files: { files: [] } }).storage.load(),
    ).toBeNull();
    await expect(
      setup({
        upload: { error: "Invalid token", errorcode: "invalidtoken" },
      }).storage.save("x"),
    ).rejects.toMatchObject({ kind: "invalidToken" });
    await expect(
      setup({
        upload: { error: "No", errorcode: "nopermissions" },
      }).storage.save("x"),
    ).rejects.toMatchObject({ kind: "accessDenied" });
    await expect(
      setup({ core_files_get_files: { files: "?" } }).storage.load(),
    ).rejects.toMatchObject({ kind: "unexpected" });
  });
});
