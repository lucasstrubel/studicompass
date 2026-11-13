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

test("replays what the lecturer changed: new file at the module, in the inbox and at the bell", async ({
  page,
}) => {
  const moodle = await openSettings(page);
  await moodle.getByRole("button", { name: "Aufzeichnung" }).click();
  await expect(page.getByText("Moodle (Aufzeichnung)")).toBeVisible();

  await page.goto("/module/m-pr2");
  const card = page.getByRole("region", { name: "Moodle", exact: true });
  await expect(card).toContainText("Kursinhalt: 2 Dateien, 12 Abgaben");
  await expect(card).toContainText("nichts geändert");
  await card.getByRole("button", { name: "Moodle abgleichen" }).click();
  await expect(
    card.getByText("Neue Datei: Vorlesung 03: Ausnahmen und Ein-/Ausgabe"),
  ).toBeVisible();
  await expect(card).toContainText("Kursinhalt: 3 Dateien, 12 Abgaben");

  await page.goto("/module/m-web");
  await card.getByRole("button", { name: "Gesehen: Pflichtübung" }).click();
  await expect(card.getByText("Neu in Moodle")).toHaveCount(0);
  await expect(card).toContainText("eingereicht · 8 von 10 Punkten");

  await page.getByRole("button", { name: /^Benachrichtigungen/ }).click();
  const bell = page.getByRole("dialog");
  await expect(bell).toContainText(
    "Webbasierte Systeme: Bewertung: Pflichtübung (8 von 10 Punkten)",
  );
  await expect(bell).toContainText("Moodle – Abgleich der Kurse");
  await page.keyboard.press("Escape");

  await page.goto("/postfach");
  await expect(
    page
      .getByText("Neue Datei: Vorlesung 03: Ausnahmen und Ein-/Ausgabe")
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText("Zusatztermin zur Klausurvorbereitung").first(),
  ).toBeVisible();

  // After a full reload the change is still new, until it is marked as seen.
  await page.goto("/module/m-pr2");
  await expect(card).toContainText("Kursinhalt: 3 Dateien, 12 Abgaben");
  await card
    .getByRole("button", {
      name: "Gesehen: Vorlesung 03: Ausnahmen und Ein-/Ausgabe",
    })
    .click();
  await expect(card.getByText("Neu in Moodle")).toHaveCount(0);
  await page.reload();
  await expect(card).toContainText("Kursinhalt: 3 Dateien, 12 Abgaben");
  await expect(card.getByText("Neu in Moodle")).toHaveCount(0);
});

test("takes Moodle assignments over as Prüfungsvorleistungen and plans the open one", async ({
  page,
}) => {
  const moodle = await openSettings(page);
  await moodle.getByRole("button", { name: "Aufzeichnung" }).click();
  await expect(page.getByText("Moodle (Aufzeichnung)")).toBeVisible();

  await page.goto("/module/m-wi3");
  const card = page.getByRole("region", { name: "Prüfungsvorleistung" });
  await card.getByRole("button", { name: "Aus Moodle übernehmen" }).click();
  await card.getByRole("button", { name: "6 Abgaben übernehmen" }).click();
  await expect(card).toContainText("4 von 6 erbracht");
  await expect(card).toContainText("Zulassung offen");

  await card.getByRole("button", { name: "Pflichtübung 5 bearbeiten" }).click();
  await card.getByLabel("Geplanter Aufwand in Stunden (optional)").fill("4");
  await card.getByRole("button", { name: "Speichern" }).click();
  await card.getByText("Teilschritte planen").first().click();
  const step = card.getByLabel("Neuer Teilschritt für Pflichtübung 5");
  await step.fill("Prozessmodell zeichnen");
  await step.press("Enter");
  await card.getByRole("checkbox", { name: "Prozessmodell zeichnen" }).check();
  await expect(card).toContainText("Teilschritte 1/1");

  await page.goto("/module");
  const overview = page.getByRole("region", {
    name: "Prüfungsvorleistungen im Semester",
  });
  await expect(overview).toContainText("Wirtschaftsinformatik 3");
  await expect(overview).toContainText(
    "4 von 6 erbracht · 4 Std. für offene geplant · nächste Frist So, 31.01.2027",
  );
  await expect(overview).toContainText("neben 15 Std. Nebenjob in der Woche");

  await page.goto("/fristen");
  await expect(
    page.getByText("Prüfungsvorleistung: Pflichtübung 5").first(),
  ).toBeVisible();
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

test("backs the own entries up in Moodle and loads them in a fresh browser", async ({
  page,
  browser,
}) => {
  const url = process.env.MOODLE_URL;
  test.skip(!url, "needs the Moodle sandbox (npm run moodle:up)");
  const token = process.env.MOODLE_TOKEN ?? "5c0de5a1dbeef0000000000000000001";
  // Both projects would write the same file of the same Moodle user at the same time.
  test.skip(test.info().project.name !== "hero", "one writer at a time");
  const note = `Altklausuren rechnen ${Date.now()}`;

  // Expects the settings page of a started demo.
  async function connect(target: Page) {
    const moodle = target.getByRole("region", { name: "Moodle-Daten" });
    await moodle.getByRole("button", { name: "Eigenes Moodle" }).click();
    await moodle.getByLabel("Adresse des Moodle").fill(url ?? "");
    await moodle.getByLabel("Zugriffsschlüssel").fill(token);
    await moodle.getByRole("button", { name: "Mit Moodle verbinden" }).click();
    await expect(moodle.getByRole("status").first()).toContainText(
      "Verbunden mit",
    );
    return moodle;
  }

  await openSettings(page);
  await page.goto("/module/m-pr2");
  await page.getByLabel("Notizen zum Modul").fill(note);
  await page.goto("/einstellungen");
  const first = await connect(page);
  await first.getByRole("button", { name: "In Moodle sichern" }).click();
  await expect(
    first.getByText("Deine Einträge sind in Moodle gesichert."),
  ).toBeVisible();
  await expect(first).toContainText("Letzte Sicherung in Moodle:");

  // Another browser profile: nothing local, everything comes from Moodle.
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  });
  const other = await context.newPage();
  await openSettings(other);
  const second = await connect(other);
  await expect(second).toContainText("Letzte Sicherung in Moodle:");
  await second.getByRole("button", { name: "Aus Moodle laden" }).click();
  await other.getByRole("button", { name: "Laden", exact: true }).click();
  await expect(
    second.getByText("Die Einträge aus Moodle sind geladen."),
  ).toBeVisible();
  const menu = other.getByRole("button", { name: "Navigation öffnen" });
  if (await menu.isVisible()) await menu.click();
  await other.getByRole("link", { name: "Module & Noten" }).first().click();
  await other.getByRole("link", { name: "Programmierung 2" }).first().click();
  await expect(other.getByLabel("Notizen zum Modul")).toHaveValue(note);
  await context.close();
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
