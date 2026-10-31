// Verify the extracted ZIP independently of Vite and the original repository server.
import { chromium, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const extracted = path.join(
  repo,
  "test-results/p6-extracted/studicompass-lokal",
);
const manifest = JSON.parse(
  await readFile(path.join(extracted, "manifest.json"), "utf8"),
);
for (const file of manifest.files) {
  const full = path.resolve(extracted, file.path);
  const relative = path.relative(extracted, full);
  if (relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error("Manifest-Pfad liegt außerhalb des Pakets");
  const bytes = await readFile(full);
  if (
    bytes.length !== file.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== file.sha256
  ) {
    throw new Error(`Prüfsumme stimmt nicht: ${file.path}`);
  }
}
const base = "http://127.0.0.1:4174";
for (const [route, method, status] of [
  ["/", "GET", 200],
  ["/verlauf", "HEAD", 200],
  ["/assets/missing.js", "GET", 404],
  ["/", "POST", 405],
  ["/%", "GET", 400],
  ["/..%2fCLAUDE.md", "GET", 403],
]) {
  const response = await fetch(base + route, { method });
  if (response.status !== status)
    throw new Error(`${method} ${route}: ${response.status} statt ${status}`);
}
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    locale: "de-DE",
  });
  const remote = [];
  const errors = [];
  await page.route(/^https?:/, (route) => {
    if (new URL(route.request().url()).origin === base) return route.continue();
    remote.push(route.request().url());
    return route.abort();
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base + "/verlauf");
  await expect(
    page.getByRole("heading", { level: 1, name: "Studienverlauf" }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: /^Zeitleiste/ })).toBeVisible();
  await page.goto(base + "/einstellungen");
  await page
    .getByRole("button", { name: "Demo zurücksetzen", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Zurücksetzen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await expect(
    page.getByRole("region", { name: "Dein Studienstand" }),
  ).toContainText("78 von 90");
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(base + "/entscheidung/e-stat-ws26");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Statistik – antreten oder abmelden?",
      }),
    ).toBeVisible();
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      throw new Error("Überlauf am Beamer-Viewport");
  }
  if (remote.length || errors.length)
    throw new Error(JSON.stringify({ remote, errors }));
  const result = {
    manifestFilesVerified: manifest.files.length,
    appBaseCommit: manifest.appBaseCommit,
    extractedZipStartup: true,
    directRoute: true,
    reset: true,
    viewports: ["1280x720", "1920x1080"],
    externalRequests: remote.length,
    pageErrors: errors.length,
  };
  await writeFile(
    path.join(repo, "test-results/p6-package-validation.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
