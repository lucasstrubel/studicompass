import { expect, test } from "@playwright/test";

test("P5-14: Kalender zeigt Abmeldefrist, Prüfung und Links; URL und Neuladen behalten die Ansicht", async ({
  page,
}) => {
  await page.goto("/fristen");
  await page.getByRole("button", { name: "Kalender", exact: true }).click();
  await expect(page).toHaveURL(/ansicht=kalender/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Januar 2027" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Di, 26.01.2027,/ }).click();
  const selected = page.getByRole("region", {
    name: "Einträge am ausgewählten Tag",
  });
  await expect(
    selected.getByRole("heading", { name: "Abmeldung Statistik", exact: true }),
  ).toBeVisible();
  await expect(
    selected.getByRole("link", { name: "Folgen prüfen" }),
  ).toHaveAttribute("href", "/entscheidung/e-stat-ws26");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: /Mi, 27.01.2027,/ }),
  ).toBeFocused();
  await expect(
    selected.getByRole("heading", { name: "Prüfung Statistik", exact: true }),
  ).toBeVisible();
  await expect(
    selected.getByRole("link", { name: "Zum Modul" }),
  ).toHaveAttribute("href", "/module/m-stat");
  await page.keyboard.press("PageDown");
  await expect(
    page.getByRole("heading", { name: "Februar 2027" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Sa, 27.02.2027,/ }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Heute", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Mo, 25.01.2027, heute/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Liste", exact: true }).click();
  await expect(page).not.toHaveURL(/ansicht=kalender/);
  await expect(page.getByRole("region", { name: "Diese Woche" })).toBeVisible();
});

test("P5-14: eigener Termin am ausgewählten Tag ist bearbeitbar und bleibt nach Neuladen erhalten", async ({
  page,
}) => {
  await page.goto("/fristen?ansicht=kalender");
  await page.getByRole("button", { name: "Termin hinzufügen" }).click();
  const dialog = page.getByRole("dialog", { name: "Termin hinzufügen" });
  await dialog.getByLabel("Titel").fill("Kalender-Lerngruppe");
  await dialog.getByLabel("Datum", { exact: true }).fill("2027-01-26");
  await dialog.getByRole("button", { name: "Speichern" }).click();
  await page.getByRole("button", { name: /Di, 26.01.2027,/ }).click();
  const own = page
    .getByRole("region", { name: "Einträge am ausgewählten Tag" })
    .getByRole("listitem")
    .filter({
      has: page.getByRole("heading", {
        name: "Kalender-Lerngruppe",
        exact: true,
      }),
    });
  await expect(own).toContainText("Eigener Eintrag");
  await own.getByRole("button", { name: "Bearbeiten", exact: true }).click();
  const edit = page.getByRole("dialog", { name: "Termin bearbeiten" });
  await edit.getByLabel("Titel").fill("Kalender-Lerngruppe geändert");
  await edit.getByRole("button", { name: "Speichern" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Di, 26.01.2027,/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Kalender-Lerngruppe geändert",
      exact: true,
    }),
  ).toBeVisible();
});

test("P5-14: Kalender ohne horizontales Scrollen bei 360 px", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Touch interaction on the mobile project");
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/fristen?ansicht=kalender");
  await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
  await page.getByRole("button", { name: /Di, 26.01.2027,/ }).tap();
  await expect(
    page.getByRole("region", { name: "Einträge am ausgewählten Tag" }),
  ).toContainText("Abmeldung Statistik");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(0);
});
