/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { DEMO_NOW, DEMO_TIME_ZONE } from "@/config/demo";
import { createMoodleClient } from "./client";
import { MoodleError } from "./errors";
import { createMoodleService, fetchSiteInfo } from "./service";
import { createMoodleStorage } from "./storage";

/**
 * Runs against the Moodle sandbox (infra/moodle), not in `npm run check`:
 *   npm run moodle:up && npm run test:moodle
 * The assertions hold before and after infra/moodle/seed/advance.php.
 */
const baseUrl = process.env.MOODLE_URL ?? "http://localhost:8080";
const token = process.env.MOODLE_TOKEN ?? "5c0de5a1dbeef0000000000000000001";
const options = { now: () => DEMO_NOW, timeZone: DEMO_TIME_ZONE };

describe("Moodle sandbox", () => {
  it("identifies the owner of the access key", async () => {
    const site = await fetchSiteInfo(createMoodleClient({ baseUrl, token }));
    expect(site.fullname).toBe("Niklas Brandt");
    expect(site.sitename).toContain("Sandbox");
  });

  it("loads progress, deadlines and announcements of the seeded courses", async () => {
    const data = await createMoodleService(
      createMoodleClient({ baseUrl, token }),
      options,
    ).load();

    expect(
      Object.fromEntries(
        data.progress.map((item) => [
          item.moduleId,
          item.total ? `${item.completed}/${item.total}` : item.label,
        ]),
      ),
    ).toEqual({
      "m-pr2": "5/12",
      "m-dm": "11/12",
      "m-web": "Abgabe eingereicht",
      "m-bwl2": "9/10",
      "m-wi3": "4/6",
    });
    // At the demo time only the last two exercises of Wirtschaftsinformatik 3 are still ahead.
    expect(data.deadlines.map((item) => [item.title, item.dueAt])).toEqual([
      [
        "Abgabe Pflichtübung 5 Wirtschaftsinformatik 3",
        "2027-01-31T23:59:00+01:00",
      ],
      [
        "Abgabe Pflichtübung 6 Wirtschaftsinformatik 3",
        "2027-02-18T23:59:00+01:00",
      ],
    ]);
    expect(data.inbox.map((item) => item.subject)).toContain(
      "Klausurtermin Programmierung 2",
    );
  });

  it("stores a file in the private files, replaces it and reads it back", async () => {
    const connection = { baseUrl, token };
    const client = createMoodleClient(connection);
    const site = await fetchSiteInfo(client);
    const storage = createMoodleStorage(connection, client, site.userid);
    const first = JSON.stringify({ app: "studicompass", n: Math.random() });
    const second = JSON.stringify({ app: "studicompass", n: Math.random() });

    await storage.save(first);
    expect((await storage.load())?.text).toBe(first);
    const savedAt = await storage.save(second);
    const loaded = await storage.load();
    expect(loaded?.text).toBe(second);
    expect(loaded?.savedAt).toBe(savedAt);
    expect(Date.parse(savedAt ?? "")).toBeGreaterThan(Date.parse("2026-01-01"));
  });

  it("reports an invalid access key", async () => {
    const client = createMoodleClient({ baseUrl, token: "wrong" });
    await expect(fetchSiteInfo(client)).rejects.toMatchObject({
      kind: "invalidToken",
    });
  });

  it("reports a site that cannot be reached", async () => {
    const client = createMoodleClient({
      baseUrl: "http://localhost:9",
      token,
    });
    const error = await fetchSiteInfo(client).catch(
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(MoodleError);
    expect((error as MoodleError).kind).toBe("network");
  });
});
