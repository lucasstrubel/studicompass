import { expect, test } from "@playwright/test";

test("P5-F10: alle Bereiche bei 320 px ohne Seitenüberlauf", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/start");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  for (const path of [
    "/",
    "/verlauf",
    "/entscheidung/e-stat-ws26",
    "/entscheidung/e-mkt-ws26",
    "/module",
    "/module/m-stat",
    "/postfach",
    "/postfach?eintrag=i-02",
    "/assistent?frage=A-02",
    "/fristen",
    "/fristen?ansicht=kalender",
    "/anlaufstellen",
    "/einstellungen",
    "/start",
  ]) {
    await page.goto(path);
    // A deep-linked inbox dialog correctly hides the background heading from accessibility APIs.
    await expect(
      page.getByRole("heading", { level: 1, includeHidden: true }),
    ).toHaveCount(1);
    await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
    if (path.startsWith("/entscheidung/")) {
      const module = path.endsWith("e-stat-ws26") ? "Statistik" : "Marketing";
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: `${module} – antreten oder abmelden?`,
          exact: true,
        }),
      ).toBeVisible();
    }
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect.soft(dimensions.page, path).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("P5-F10: Menü, Assistent und Termin-Dialog bleiben bei 320 px bedienbar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/fristen");
  await page.getByRole("button", { name: "Navigation öffnen" }).click();
  await expect(
    page.getByRole("dialog", { name: "Alle Bereiche" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Navigation öffnen" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Assistent öffnen" }).click();
  const assistant = page.getByRole("dialog", {
    name: "Assistent",
    exact: true,
  });
  await expect(assistant.getByRole("textbox")).toBeInViewport();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Termin hinzufügen" }).click();
  const dialog = page.getByRole("dialog", { name: "Termin hinzufügen" });
  await expect(
    dialog.getByRole("button", { name: "Speichern" }),
  ).toBeInViewport();
  await expect(
    dialog.getByRole("button", { name: "Abbrechen" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test("P5-F10: Studienverlauf lädt erst beim Öffnen und bietet bei Ladefehler eine Wiederholung", async ({
  page,
}) => {
  const plannerRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/PlannerPage-[^/]+\.js$/.test(request.url()))
      plannerRequests.push(request.url());
  });
  await page.goto("/start");
  await expect(
    page.getByRole("button", { name: "Demo ohne Einrichtung starten" }),
  ).toBeVisible();
  expect(plannerRequests).toHaveLength(0);
  let failRequest: () => Promise<void> = () =>
    Promise.reject(new Error("Planner request not intercepted"));
  await page.route("**/PlannerPage-*.js", (route) => {
    failRequest = () => route.abort();
  });
  await page.goto("/verlauf", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("status", { name: "Studienverlauf wird geladen" }),
  ).toBeVisible();
  await failRequest();
  await expect(page.getByRole("alert")).toContainText(
    "Studienverlauf konnte nicht geladen werden",
  );
  await expect(
    page.getByRole("button", { name: "Profil", exact: true }),
  ).toBeVisible();
  await page.unroute("**/PlannerPage-*.js");
  await page.getByRole("button", { name: "Seite neu laden" }).click();
  await expect(page.getByRole("region", { name: /^Zeitleiste/ })).toBeVisible();
});
