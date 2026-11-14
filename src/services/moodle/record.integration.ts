/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { DEMO_NOW, DEMO_TIME_ZONE } from "@/config/demo";
import {
  detectMoodleChanges,
  knownMoodleItems,
  moodleChangeText,
} from "@/domain/moodle-changes";
import { createMoodleClient } from "./client";
import { createRecordingClient, type MoodleRecording } from "./replay";
import { createMoodleService, fetchSiteInfo } from "./service";

/**
 * `npm run moodle:record` on a freshly seeded sandbox (`npm run moodle:reset`): records the seeded
 * state, lets the lecturer act (infra/moodle/seed/advance.php), records again and writes both
 * states to src/data/recordings/moodle.json. Also the end-to-end proof of "Neu in Moodle".
 */
const baseUrl = process.env.MOODLE_URL ?? "http://localhost:8080";
const token = process.env.MOODLE_TOKEN ?? "5c0de5a1dbeef0000000000000000001";
const options = { now: () => DEMO_NOW, timeZone: DEMO_TIME_ZONE };

describe.skipIf(!process.env.MOODLE_RECORD)("recording the sandbox", () => {
  it("detects what the lecturer changed between two syncs", async () => {
    const before = createRecordingClient(
      createMoodleClient({ baseUrl, token }),
    );
    const seeded = await createMoodleService(before.client, options).load();
    const site = await fetchSiteInfo(before.client);
    expect(
      seeded.courses.flatMap((course) =>
        course.items.map((item) => item.title),
      ),
      "The sandbox is not in its seeded state. Run `npm run moodle:reset` first.",
    ).not.toContain("Vorlesung 03: Ausnahmen und Ein-/Ausgabe");

    const { execFileSync } = await import("node:child_process");
    execFileSync(
      "docker",
      [
        "compose",
        "-f",
        "infra/moodle/docker-compose.yml",
        "exec",
        "-T",
        "-u",
        "www-data",
        "moodle",
        "php",
        "/opt/studicompass/seed/advance.php",
      ],
      { stdio: "inherit", env: { ...process.env, MSYS_NO_PATHCONV: "1" } },
    );

    const after = createRecordingClient(createMoodleClient({ baseUrl, token }));
    const advanced = await createMoodleService(after.client, options).load();
    await fetchSiteInfo(after.client);

    const changes = detectMoodleChanges(
      knownMoodleItems(seeded.courses),
      advanced.courses,
      "2027-01-25T19:30:00+01:00",
    );
    expect(
      changes
        .map((change) => `${change.moduleId}: ${moodleChangeText(change)}`)
        .sort(),
    ).toEqual([
      "m-dm: Neue Ankündigung: Zusatztermin zur Klausurvorbereitung",
      "m-pr2: Neue Datei: Vorlesung 03: Ausnahmen und Ein-/Ausgabe",
      "m-web: Bewertung: Pflichtübung (8 von 10 Punkten)",
    ]);

    // The list of offered functions is long and the same in both states; without it every function counts as offered.
    for (const calls of [before.calls, after.calls])
      for (const [key, value] of Object.entries(calls))
        if (key.startsWith("core_webservice_get_site_info"))
          calls[key] = { ...(value as object), functions: [] };
    const recording: MoodleRecording = {
      recordedAt: new Date().toISOString(),
      release: site.release ?? "",
      phases: [before.calls, after.calls],
    };
    const { writeFile } = await import("node:fs/promises");
    await writeFile(
      new URL("../../data/recordings/moodle.json", import.meta.url),
      `${JSON.stringify(recording, null, 2)}\n`,
    );
  });
});
