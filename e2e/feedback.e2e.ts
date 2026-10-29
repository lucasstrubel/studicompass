import { expect, test } from "@playwright/test";

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
