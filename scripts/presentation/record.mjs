// Actual browser recording of the scripted flow; --quick runs assertions without timing/video.
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { writePlayer } from "./player.mjs";

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const quick = process.argv.includes("--quick");
const output = path.join(repo, "artifacts/presentation");
const evidence = path.join(repo, "test-results/p6-recording");
await mkdir(output, { recursive: true });
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "de-DE",
  timezoneId: "Europe/Berlin",
  reducedMotion: "reduce",
  ...(quick
    ? {}
    : {
        recordVideo: {
          dir: path.join(output, "raw"),
          size: { width: 1440, height: 900 },
        },
      }),
});
const page = await context.newPage();
const failures = [];
const remote = [];
page.on("pageerror", (error) => failures.push(error.message));
await page.route(/^https?:/, (route) => {
  if (new URL(route.request().url()).origin === "http://127.0.0.1:4173")
    return route.continue();
  remote.push(route.request().url());
  return route.abort();
});
const started = performance.now();
const chapters = [];
const waitTo = async (seconds) => {
  if (!quick) {
    const remaining = seconds * 1000 - (performance.now() - started);
    if (remaining > 0) await page.waitForTimeout(remaining);
  }
};
const chapter = async (name) => {
  chapters.push({
    name,
    seconds: Number(((performance.now() - started) / 1000).toFixed(2)),
    path: new URL(page.url()).pathname,
  });
  console.log(`Kapitel: ${name}`);
  await page.screenshot({
    path: path.join(
      evidence,
      `${String(chapters.length).padStart(2, "0")}.png`,
    ),
  });
};
const goto = async (route) => {
  await page.goto(`http://127.0.0.1:4173${route}`);
  await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
};
try {
  await goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  const progress = page.getByRole("region", { name: "Dein Studienstand" });
  await expect(progress).toContainText("78 von 90");
  await expect(progress).toContainText("48");
  await expect(progress).toContainText("Knapp");
  await page.mouse.move(650, 380);
  await chapter("Übersicht: Studienstand und Jetzt wichtig");
  await waitTo(25);
  await page
    .getByRole("region", { name: "Jetzt wichtig" })
    .getByRole("link", { name: "Folgen prüfen" })
    .click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Statistik – antreten oder abmelden?",
    }),
  ).toBeVisible();
  const table = page.getByRole("table");
  await expect(table).toContainText("72");
  await expect(table).toContainText("SS 2028");
  await expect(table).toContainText("SS 2029");
  await chapter("Statistik: Optionen und Quellen vergleichen");
  await waitTo(45);
  await page
    .getByRole("button", { name: "Warum? – Praxissemester", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Warum? – Praxissemester", exact: true })
    .scrollIntoViewIfNeeded();
  await waitTo(57);
  await page
    .getByRole("button", { name: "Abmeldung vornehmen" })
    .scrollIntoViewIfNeeded();
  await waitTo(60);
  await page.getByRole("button", { name: "Abmeldung vornehmen" }).click();
  const dialog = page.getByRole("alertdialog", {
    name: "Von Statistik abmelden?",
  });
  await expect(dialog).toContainText("Im Prototyp wird sie simuliert.");
  await waitTo(67);
  await dialog.getByRole("button", { name: "Abmeldung simulieren" }).click();
  await expect(progress).toContainText("72 von 90");
  await expect(progress).toContainText("48");
  await expect(progress).toContainText("Kritisch");
  await expect(progress).toContainText("SS 2028");
  await expect(progress).toContainText("SS 2029");
  await chapter("Simulation: 72 ECTS und verschobene Meilensteine");
  await waitTo(95);
  await goto("/entscheidung/e-stat-ws26");
  await expect(
    page.getByRole("button", { name: "Rückgängig", exact: true }),
  ).toBeVisible();
  await chapter("Dauerhaftes Rückgängig beim Folgen-Check");
  await waitTo(102);
  await page.getByRole("button", { name: "Rückgängig", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Statistik – antreten oder abmelden?",
    }),
  ).toBeVisible();
  await waitTo(110);
  await goto("/entscheidung/e-mkt-ws26");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Marketing – antreten oder abmelden?",
    }),
  ).toBeVisible();
  const internship = page
    .getByRole("row")
    .filter({ hasText: "Praxissemester" });
  await expect(internship).toContainText("WS 2027/28 – erreichbar");
  await expect(internship).not.toContainText("SS 2028");
  await chapter("Marketing: Praxissemester bleibt erreichbar");
  await waitTo(135);
  await goto("/assistent");
  const question = page.getByRole("textbox", { name: "Deine Frage" });
  await question.fill("Was passiert, wenn ich Statistik schiebe?");
  await page.getByRole("button", { name: "Frage stellen" }).click();
  const log = page.getByRole("log");
  await expect(log.getByRole("list", { name: "Quellen" })).toBeVisible();
  await chapter("Assistent: Antwort mit nachvollziehbarer Quelle");
  await waitTo(160);
  await log.getByRole("list", { name: "Quellen" }).scrollIntoViewIfNeeded();
  await waitTo(180);
  await question.fill(
    "Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?",
  );
  await page.getByRole("button", { name: "Frage stellen" }).click();
  await expect(
    page.getByRole("button", { name: "Anfrage vorbereiten" }),
  ).toBeVisible();
  await chapter("Sonderfall: Grenze des Antwortkatalogs");
  await waitTo(200);
  await page.getByRole("button", { name: "Anfrage vorbereiten" }).click();
  await expect(
    page.getByRole("textbox", { name: "Dein Anfrageentwurf" }),
  ).toContainText("Praxissemester im Ausland");
  await chapter("Anfrageentwurf ohne Versand");
  await waitTo(220);
  if (remote.length || failures.length)
    throw new Error(JSON.stringify({ remote, failures }));
  const durationSeconds = Number(
    ((performance.now() - started) / 1000).toFixed(2),
  );
  await context.close();
  if (!quick) {
    await page.video().saveAs(path.join(output, "hero-flow.webm"));
    await page.video().delete();
    const timestamp = (seconds) =>
      new Date(seconds * 1000).toISOString().slice(11, 23);
    const vtt =
      "WEBVTT\n\n" +
      chapters
        .map(
          (item, index) =>
            `${timestamp(item.seconds)} --> ${timestamp(chapters[index + 1]?.seconds ?? durationSeconds)}\n${item.name}\n`,
        )
        .join("\n");
    await writeFile(path.join(output, "hero-flow.vtt"), vtt);
    await writeFile(
      path.join(output, "manifest.json"),
      JSON.stringify(
        {
          kind: "actual-browser-recording",
          appBaseCommit: "862fbb62639a3722b1a2195cfce94109f6a30617",
          durationSeconds,
          viewport: { width: 1440, height: 900 },
          audio: false,
          remoteRequests: remote,
          pageErrors: failures,
          chapters,
        },
        null,
        2,
      ) + "\n",
    );
    await writePlayer(output, vtt);
    if (durationSeconds < 180 || durationSeconds > 240)
      throw new Error(`Dauer außerhalb des Skripts: ${durationSeconds}`);
  }
  console.log(
    JSON.stringify({
      quick,
      durationSeconds,
      chapters: chapters.length,
      remoteRequests: remote.length,
      pageErrors: failures.length,
    }),
  );
} finally {
  await context.close();
  await browser.close();
}
