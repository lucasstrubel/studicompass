import { expect, test, type Page } from "@playwright/test";

// Moodle data modes (ADR 0002): the recording runs everywhere, the live connection only where the
// sandbox from infra/moodle is up (MOODLE_URL set, see .github/workflows/moodle.yml).

async function openSettings(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/einstellungen");
  return page.getByRole("region", { name: "Moodle-Daten" });
}

async function expectMoodleData(page: Page) {
  await page.goto("/");
  await expect(page.getByText("Abgaben 5/12")).toBeVisible();
  await page.goto("/fristen");
  await expect(
    page.getByText("Abgabe Pflichtübung 6 Wirtschaftsinformatik 3").first(),
  ).toBeVisible();
  await page.goto("/postfach");
  await expect(
    page.getByText("Klausurtermin Programmierung 2").first(),
  ).toBeVisible();
}

test("shows the recorded Moodle data on overview, deadlines and inbox and keeps it after a reload", async ({
  page,
}) => {
  const moodle = await openSettings(page);
  await moodle.getByRole("button", { name: "Aufzeichnung" }).click();
  await expect(page.getByText("Moodle (Aufzeichnung)")).toBeVisible();

  await expectMoodleData(page);

  await page.reload();
  await expect(
    page.getByText("Klausurtermin Programmierung 2").first(),
  ).toBeVisible();
  await page.goto("/einstellungen");
  await expect(
    page.getByRole("button", { name: "Aufzeichnung" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("connects to the Moodle sandbox from the browser and forgets the key on reload", async ({
  page,
}) => {
  const url = process.env.MOODLE_URL;
  test.skip(!url, "needs the Moodle sandbox (npm run moodle:up)");
  const moodle = await openSettings(page);
  await moodle.getByRole("button", { name: "Eigenes Moodle" }).click();
  await moodle.getByLabel("Adresse des Moodle").fill(url ?? "");
  await moodle
    .getByLabel("Zugriffsschlüssel")
    .fill(process.env.MOODLE_TOKEN ?? "5c0de5a1dbeef0000000000000000001");
  await moodle.getByRole("button", { name: "Mit Moodle verbinden" }).click();
  await expect(moodle.getByRole("status")).toContainText(
    "Verbunden mit Hochschul-Sandbox (StudiCompass) als Niklas Brandt",
  );
  await expect(page.getByText("Moodle (verbunden)")).toBeVisible();

  // Client-side navigation keeps the session; a full reload drops the access key.
  const menu = page.getByRole("button", { name: "Navigation öffnen" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "Postfach" }).first().click();
  await expect(
    page.getByText("Klausurtermin Programmierung 2").first(),
  ).toBeVisible();

  await page.reload();
  await page.goto("/einstellungen");
  await expect(
    page.getByRole("button", { name: "Beispieldaten" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage })),
  ).not.toContain("5c0de5a1dbeef");
});

test("explains a wrong access key", async ({ page }) => {
  const url = process.env.MOODLE_URL;
  test.skip(!url, "needs the Moodle sandbox (npm run moodle:up)");
  const moodle = await openSettings(page);
  await moodle.getByRole("button", { name: "Eigenes Moodle" }).click();
  await moodle.getByLabel("Adresse des Moodle").fill(url ?? "");
  await moodle.getByLabel("Zugriffsschlüssel").fill("falsch");
  await moodle.getByRole("button", { name: "Mit Moodle verbinden" }).click();
  await expect(moodle.getByRole("alert")).toContainText(
    "Der Zugriffsschlüssel ist ungültig oder abgelaufen.",
  );
});
