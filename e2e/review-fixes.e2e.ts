import { expect, test } from "@playwright/test";

test("PR29-Review: Profil ohne POS-Daten abschließen und nach Neuladen erneut überspringen", async ({
  page,
}) => {
  await page.goto("/start");
  await page
    .getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" })
    .click();
  await page.getByRole("checkbox", { name: "POS", exact: true }).uncheck();
  // Reload discards any cached POS response, while retaining the disconnected channel.
  await page.reload();
  await page
    .getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" })
    .click();
  await expect(
    page.getByRole("checkbox", { name: "POS", exact: true }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByLabel("Vorname", { exact: true }).fill("Alex");
  await page.getByLabel("Nachname", { exact: true }).fill("Muster");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("checkbox", { name: /Danach die Produkt-Tour/ })
    .uncheck();
  await page.getByRole("button", { name: "Einrichtung abschließen" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Guten Abend, Alex",
  );

  await page.goto("/start");
  await page
    .getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await expect(page.getByLabel("Vorname", { exact: true })).toHaveValue("Alex");
  await page.getByRole("button", { name: "Überspringen", exact: true }).click();
  await expect(page).toHaveURL(/\/?\?tour=1$/);
});

test("PR29-Review: ungültige Sommerzeit-Uhrzeit hat einen Feldfehler und wird nicht verschoben", async ({
  page,
}) => {
  await page.goto("/fristen");
  await page.getByRole("button", { name: "Termin hinzufügen" }).click();
  const dialog = page.getByRole("dialog", { name: "Termin hinzufügen" });
  await dialog.getByLabel("Titel", { exact: true }).fill("Uhrzeitwechsel");
  await dialog.getByLabel("Datum", { exact: true }).fill("2027-03-28");
  const time = dialog.getByLabel("Uhrzeit (optional)");
  await time.fill("02:30");
  await dialog.getByRole("button", { name: "Speichern" }).click();
  await expect(
    dialog.getByText(/Diese Uhrzeit existiert wegen der Zeitumstellung nicht/),
  ).toBeVisible();
  await expect(time).toBeFocused();
  await time.fill("03:30");
  await dialog.getByRole("button", { name: "Speichern" }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  const entry = page
    .getByRole("listitem")
    .filter({
      has: page.getByRole("heading", { name: "Uhrzeitwechsel", exact: true }),
    });
  await expect(entry).toContainText("03:30");
});
