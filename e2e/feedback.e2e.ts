import { expect, test, type Page } from "@playwright/test";

// Feedback round of 28.10.2026 (ROADMAP P5-09 ff.): checks that need a real layout engine.

test("P5-09: ab 1280 px alle Bereiche in einer Topbar-Zeile, ohne Hamburger", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop breakpoints only");
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/module");
    await expect(
      page.getByRole("button", { name: "Navigation öffnen" }),
    ).toBeHidden();
    const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
    await expect(nav.getByRole("link")).toHaveText([
      "Übersicht",
      "Studienverlauf",
      "Module & Noten",
      "Fristen",
      "Postfach",
      "Assistent",
    ]);
    // One row: the links sit level with the profile button, so nothing wrapped.
    const header = page.getByRole("banner");
    const profile = await header
      .getByRole("button", { name: "Profil" })
      .boundingBox();
    const fristen = await nav
      .getByRole("link", { name: "Fristen" })
      .boundingBox();
    expect(Math.abs((profile?.y ?? 0) - (fristen?.y ?? 999))).toBeLessThan(20);
  }
  await page.setViewportSize({ width: 1279, height: 900 });
  await expect(
    page.getByRole("button", { name: "Navigation öffnen" }),
  ).toBeVisible();
});

test("P5-09: Quellen stehen als Fußzeile unter den Aktionen der Karte", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  const important = page.getByRole("region", { name: "Jetzt wichtig" });
  const action = await important
    .getByRole("link", { name: "Folgen prüfen" })
    .boundingBox();
  const sources = important.getByRole("list", { name: "Quellen" });
  await expect(sources).toContainText("SPO Wirtschaftsinformatik");
  const box = await sources.boundingBox();
  expect(box?.y ?? 0).toBeGreaterThan((action?.y ?? 0) + (action?.height ?? 0));
});

test("P5-10: Modulname führt zum Moduleintrag, Meilenstein markiert seine Module", async ({
  page,
}) => {
  await page.goto("/verlauf");
  const current = page.getByRole("listitem", { name: /^WS 2026\/27,/ });
  await page
    .getByRole("button", { name: "Praxissemester", exact: true })
    .click();
  await expect(page.locator("[data-marked]")).toHaveCount(15);
  await expect(current).toContainText("für Praxissemester · noch offen");
  await current.getByRole("link", { name: "Statistik", exact: true }).click();
  await expect(page).toHaveURL(/\/module\/m-stat$/);
});

test("P5-10: nach Verschiebungen bleiben die Boxen breit, nur die Zeitleiste scrollt", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Columns exist from 1280 px");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/verlauf");
  await page.getByRole("switch", { name: "Simulation" }).click();
  await page.getByRole("button", { name: "Kolloquium verschieben" }).click();
  await page.getByRole("menuitem").last().click();
  await page.getByRole("button", { name: "Weiter simulieren" }).click();
  const columns = page
    .getByRole("region", { name: /^Zeitleiste/ })
    .getByRole("listitem", { name: /Fachsemester$/ });
  expect(await columns.count()).toBeGreaterThanOrEqual(9);
  for (const box of await columns.all())
    expect((await box.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(176);
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

const column = (page: Page, term: RegExp) =>
  page.getByRole("listitem", { name: term });
const marketing = (page: Page) =>
  page.locator("[data-draggable]").filter({
    has: page.getByRole("link", { name: "Marketing", exact: true }),
  });

test("P5-11: Drag & Drop mit der Maus ergibt dieselben Werte wie das Menü (Szenario D)", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Mouse drag on the desktop columns");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/verlauf");
  await page.getByRole("switch", { name: "Simulation" }).click();
  const target = column(page, /^SS 2027,/);
  // Mouse events only reach what is on screen; the SS 2027 column runs alongside at the same height.
  await marketing(page).scrollIntoViewIfNeeded();
  const from = await marketing(page).boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("Boxen nicht gefunden");
  await page.mouse.move(from.x + 20, from.y + 10);
  await page.mouse.down();
  await page.mouse.move(from.x + 40, from.y + 30, { steps: 5 });
  await expect(target).toHaveAttribute("data-drop", "allowed");
  await expect(column(page, /^WS 2027\/28,/)).toHaveAttribute(
    "data-drop",
    "allowed",
  );
  await page.mouse.move(to.x + to.width / 2, from.y + 10, { steps: 15 });
  await page.mouse.up();
  const dialog = page.getByRole("dialog", {
    name: "Simulation: Marketing → SS 2027",
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Weiter simulieren" }).click();
  const status = page.getByRole("status", { name: "Simulationsstatus" });
  const byDrag = await status.textContent();
  await expect(target).toContainText("48 ECTS geplant");
  await expect(status).toContainText("Abschluss in der Simulation: WS 2028/29");

  // Same move through the menu.
  await status.getByRole("button", { name: "Simulation verwerfen" }).click();
  await page.getByRole("switch", { name: "Simulation" }).click();
  await page.getByRole("button", { name: "Marketing verschieben" }).click();
  await page.getByRole("menuitem", { name: "SS 2027" }).click();
  await page.getByRole("button", { name: "Weiter simulieren" }).click();
  await expect(status).toHaveText(byDrag ?? "");
  await expect(target).toContainText("48 ECTS geplant");
});

test("P5-11: Drag & Drop per Touch (langes Drücken)", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Touch drag on the phone layout");
  await page.goto("/verlauf");
  await page.getByRole("switch", { name: "Simulation" }).click();
  const chip = marketing(page);
  await chip.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 250));
  const from = await chip.boundingBox();
  const to = await column(page, /^SS 2027,/).boundingBox();
  if (!from || !to) throw new Error("Boxen nicht gefunden");
  const client = await page.context().newCDPSession(page);
  const touch = (
    type: "touchStart" | "touchMove" | "touchEnd",
    x: number,
    y: number,
  ) =>
    client.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  const start = { x: from.x + 20, y: from.y + 10 };
  const end = { x: to.x + to.width / 2, y: to.y + 20 };
  await touch("touchStart", start.x, start.y);
  await page.waitForTimeout(400);
  for (let step = 1; step <= 12; step++)
    await touch(
      "touchMove",
      start.x + ((end.x - start.x) * step) / 12,
      start.y + ((end.y - start.y) * step) / 12,
    );
  await touch("touchEnd", end.x, end.y);
  await expect(
    page.getByRole("dialog", { name: "Simulation: Marketing → SS 2027" }),
  ).toBeVisible();
});

test("P5-12: ECTS-Verlauf startet bei 0 und zeigt die Differenz beim Überfahren", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Hover needs a mouse");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  const chart = page.locator(".recharts-wrapper").first();
  await chart.scrollIntoViewIfNeeded();
  await expect(chart).toContainText("Studienbeginn");
  const box = await chart.boundingBox();
  if (!box) throw new Error("Diagramm nicht gefunden");
  // Sweep across the chart until the tooltip shows SS 2026.
  const tooltip = page.locator(".recharts-tooltip-wrapper");
  for (let x = box.x + 40; x < box.x + box.width; x += 15) {
    await page.mouse.move(x, box.y + box.height / 2);
    if ((await tooltip.textContent())?.includes("SS 2026")) break;
  }
  await expect(tooltip).toContainText("Ist: 48 ECTS");
  await expect(tooltip).toContainText("Soll: 60 ECTS");
  await expect(tooltip).toContainText("12 ECTS unter Soll");
});

test("P5-12: aktuelles Semester ohne Scrollen sichtbar, Notiz übersteht Neuladen", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Checks the 1440×900 view");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/module");
  await expect(
    page.getByRole("table", { name: "Module im 3. Fachsemester" }),
  ).toBeInViewport({ ratio: 1 });
  await page.getByRole("link", { name: "Statistik", exact: true }).click();
  await page
    .getByLabel("Notizen zum Modul")
    .fill("Probeklausur bis Dienstag rechnen");
  await page.getByLabel("Notizen zum Modul").blur();
  await page.reload();
  await expect(page.getByLabel("Notizen zum Modul")).toHaveValue(
    "Probeklausur bis Dienstag rechnen",
  );
});

test("P5-12: Modulliste am Handy ohne abgeschnittene Werte", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Phone layout");
  await page.goto("/module");
  const table = page.getByRole("table", { name: "Module im 3. Fachsemester" });
  const tableBox = await table.boundingBox();
  const status = table.getByText("Angemeldet").first();
  await expect(status).toBeVisible();
  const statusBox = await status.boundingBox();
  expect((statusBox?.x ?? 0) + (statusBox?.width ?? 0)).toBeLessThanOrEqual(
    (tableBox?.x ?? 0) + (tableBox?.width ?? 0),
  );
  expect(tableBox?.width ?? 999).toBeLessThanOrEqual(390);
});
