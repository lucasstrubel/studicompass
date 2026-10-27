import { expect, test, type Page } from "@playwright/test";

// Hero flow (KONZEPT §9): overview → Folgen-Check → simulated withdrawal → overview → Rückgängig.

async function openOverview(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Guten Abend, Niklas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Dein Studienstand" }).getByText("Knapp"),
  ).toBeVisible();
}

test("withdraws Statistik in the simulation and undoes it", async ({
  page,
}) => {
  await openOverview(page);
  const progress = page.getByRole("region", { name: "Dein Studienstand" });
  await expect(progress).toContainText("78 von 90");

  await page
    .getByRole("region", { name: "Jetzt wichtig" })
    .getByRole("link", { name: "Folgen prüfen" })
    .click();
  await expect(page).toHaveURL(/\/entscheidung\/e-stat-ws26$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Statistik – antreten oder abmelden?",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Abmeldung vornehmen" }).click();
  const dialog = page.getByRole("alertdialog", {
    name: "Von Statistik abmelden?",
  });
  await expect(dialog).toContainText("Im Prototyp wird sie simuliert.");
  await dialog.getByRole("button", { name: "Abmeldung simulieren" }).click();

  await expect(page).toHaveURL(/\/$/);
  const toast = page.locator("[data-sonner-toast]");
  await expect(toast).toContainText("Statistik: Abmeldung simuliert");
  await expect(progress.getByText("Kritisch")).toBeVisible();
  await expect(progress).toContainText("SS 2028");
  await expect(progress).toContainText("SS 2029");

  await toast.getByRole("button", { name: "Rückgängig" }).click();
  await expect(progress.getByText("Knapp")).toBeVisible();
  await expect(progress).toContainText("WS 2028/29 – in Regelstudienzeit");
});

test("runs the same flow by keyboard only", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard flow is checked on the desktop viewport.");
  await openOverview(page);

  const focusByTab = async (name: string) => {
    for (let step = 0; step < 120; step++) {
      await page.keyboard.press("Tab");
      const text = await page.evaluate(
        () => document.activeElement?.textContent?.trim() ?? "",
      );
      if (text === name) return;
    }
    throw new Error(`${name} not reachable by Tab`);
  };

  await focusByTab("Folgen prüfen");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/entscheidung\/e-stat-ws26$/);
  await focusByTab("Abmeldung vornehmen");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await focusByTab("Abmeldung simulieren");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page
      .getByRole("region", { name: "Dein Studienstand" })
      .getByText("Kritisch"),
  ).toBeVisible();
  await focusByTab("Rückgängig");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Dein Studienstand" }).getByText("Knapp"),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Dein Studienstand" }),
  ).toContainText("78 von 90");
});

test("keeps the page within the viewport width", async ({ page }) => {
  for (const path of ["/", "/entscheidung/e-stat-ws26", "/verlauf"]) {
    await page.goto(path);
    if (path === "/")
      await page
        .getByRole("button", { name: "Demo ohne Einrichtung starten" })
        .click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // The h1 shows while loading; measure only once every skeleton has given way to the content.
    await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow, path).toBe(false);
  }
});
