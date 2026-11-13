import { describe, expect, it } from "vitest";
import recording from "@/data/recordings/moodle.json";
import { DEMO_NOW, DEMO_TIME_ZONE } from "@/config/demo";
import { modules } from "@/data/modules";
import type { MoodleClient } from "./client";
import { MoodleError } from "./errors";
import { mapMoodle, plainText, toInstant } from "./mapping";
import { createReplayClient } from "./replay";
import { createMoodleService } from "./service";

const options = { now: () => DEMO_NOW, timeZone: DEMO_TIME_ZONE };
const replay = () => createReplayClient(recording);

describe("createMoodleService with the recording of the sandbox", () => {
  it("counts the submitted assignments per module", async () => {
    const data = await createMoodleService(replay(), options).load();
    expect(data.progress).toEqual([
      {
        moduleId: "m-wi3",
        label: "Abgaben 4/6",
        completed: 4,
        total: 6,
        detail: "nächste Abgabe bis 31.01.",
      },
      { moduleId: "m-bwl2", label: "Abgaben 9/10", completed: 9, total: 10 },
      { moduleId: "m-web", label: "Abgabe eingereicht" },
      { moduleId: "m-dm", label: "Abgaben 11/12", completed: 11, total: 12 },
      { moduleId: "m-pr2", label: "Abgaben 5/12", completed: 5, total: 12 },
    ]);
  });

  it("assigns every course to a module of the app", async () => {
    const data = await createMoodleService(replay(), options).load();
    const known = new Set(modules.map((module) => module.id));
    for (const item of [...data.progress, ...data.deadlines, ...data.inbox])
      expect(known.has(item.moduleId ?? "")).toBe(true);
  });

  it("lists only open assignments that are still ahead, in German time", async () => {
    const data = await createMoodleService(replay(), options).load();
    expect(data.deadlines).toEqual([
      {
        id: expect.stringMatching(/^moodle-assign-\d+$/) as string,
        title: "Abgabe Pflichtübung 5 Wirtschaftsinformatik 3",
        dueAt: "2027-01-31T23:59:00+01:00",
        type: "Abgabe",
        channel: "moodle",
        moduleId: "m-wi3",
      },
      {
        id: expect.stringMatching(/^moodle-assign-\d+$/) as string,
        title: "Abgabe Pflichtübung 6 Wirtschaftsinformatik 3",
        dueAt: "2027-02-18T23:59:00+01:00",
        type: "Abgabe",
        channel: "moodle",
        moduleId: "m-wi3",
      },
    ]);
  });

  it("turns announcements into unread inbox entries with plain text", async () => {
    const data = await createMoodleService(replay(), options).load();
    const item = data.inbox.find(
      (entry) => entry.subject === "Klausurtermin Programmierung 2",
    );
    expect(item).toMatchObject({
      channel: "moodle",
      sender: "Programmierung 2",
      moduleId: "m-pr2",
      read: false,
    });
    expect(item?.body).toBe(
      "Die Klausur findet am 08.02.2027 um 09:00 Uhr statt. Abmeldungen sind bis 26.01.2027 im POS möglich. Jana Hartwig",
    );
    expect(data.inbox).toHaveLength(4);
  });

  it("leaves out what a site does not offer instead of failing", async () => {
    const inner = replay();
    const limited: MoodleClient = {
      async call(wsfunction, params) {
        const payload = await inner.call(wsfunction, params);
        return wsfunction === "core_webservice_get_site_info"
          ? {
              ...(payload as object),
              functions: [
                { name: "core_webservice_get_site_info" },
                { name: "core_enrol_get_users_courses" },
                { name: "mod_assign_get_assignments" },
              ],
            }
          : payload;
      },
    };
    const data = await createMoodleService(limited, options).load();
    expect(data.progress).toEqual([]);
    expect(data.inbox).toEqual([]);
    // Without completion data every assignment ahead counts as open.
    expect(data.deadlines.length).toBeGreaterThan(0);
  });

  it("rejects a response of another shape", async () => {
    const broken: MoodleClient = {
      call: () => Promise.resolve({ sitename: 42 }),
    };
    const error = await createMoodleService(broken, options)
      .load()
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(MoodleError);
    expect((error as MoodleError).kind).toBe("unexpected");
  });
});

describe("mapMoodle", () => {
  const course = { id: 1, shortname: "X", fullname: "Kurs X", idnumber: "" };

  it("keeps deadlines of a course without idnumber, but shows no progress", () => {
    const data = mapMoodle(
      [
        {
          course,
          assignments: [
            { id: 7, cmid: 70, name: "Blatt 1", duedate: 1801000000 },
          ],
          completion: [
            { cmid: 70, modname: "assign", state: 0, hascompletion: true },
          ],
          announcements: [],
        },
      ],
      DEMO_NOW,
      DEMO_TIME_ZONE,
    );
    expect(data.progress).toEqual([]);
    expect(data.deadlines).toEqual([
      {
        id: "moodle-assign-7",
        title: "Abgabe Blatt 1 Kurs X",
        dueAt: "2027-01-26T22:46:40+01:00",
        type: "Abgabe",
        channel: "moodle",
      },
    ]);
  });
});

describe("toInstant", () => {
  it("uses the offset of the time zone, also in summer", () => {
    expect(toInstant(1800000000, "Europe/Berlin")).toBe(
      "2027-01-15T09:00:00+01:00",
    );
    expect(toInstant(1783000000, "Europe/Berlin")).toBe(
      "2026-07-02T15:46:40+02:00",
    );
  });
});

describe("plainText", () => {
  it("drops markup and decodes entities", () => {
    expect(
      plainText('<p>Folien &amp; Skript<br>sind <a href="x">online</a>.</p>'),
    ).toBe("Folien & Skript sind online.");
  });
});
