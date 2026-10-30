import { expect, test } from "@playwright/test";

test("P5-15: Überspringen behält das Profil; Bearbeiten, Neuladen, Anfrage und Reset verwenden den Namen", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/start");
  await page
    .getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" })
    .click();
  await page.getByRole("checkbox", { name: "Moodle", exact: true }).uncheck();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await expect(page.getByLabel("Vorname", { exact: true })).toHaveValue(
    "Niklas",
  );
  await page.getByLabel("Vorname", { exact: true }).fill("Alex");
  await page.getByLabel("Nachname", { exact: true }).fill("Muster");
  await page
    .getByRole("checkbox", { name: "Mein Ziel: Abschluss in Regelstudienzeit" })
    .uncheck();
  const hours = page.getByRole("slider");
  await hours.focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("radio", { name: "Sachlich" }).check();
  const tour = page.getByRole("checkbox", { name: /Danach die Produkt-Tour/ });
  await expect(tour).toBeChecked();
  await tour.uncheck();
  await page.getByRole("button", { name: "Überspringen", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Guten Abend, Alex",
  );
  await expect(
    page.getByRole("button", { name: "Profil", exact: true }),
  ).toHaveText("AM");
  await expect(page.getByText("Hallo Alex!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Profil", exact: true }).click();
  await page.getByRole("menuitem", { name: "Profil bearbeiten" }).click();
  await expect(page).toHaveURL(/einstellungen#profil$/);
  await expect(page.getByRole("region", { name: "Profil" })).toBeFocused();
  await expect(page.getByLabel("Vorname", { exact: true })).toHaveValue("Alex");
  await expect(page.getByRole("slider")).toHaveValue("16");
  await expect(
    page.getByRole("checkbox", {
      name: "Mein Ziel: Abschluss in Regelstudienzeit",
    }),
  ).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Sachlich" })).toBeChecked();
  await expect(
    page.getByRole("button", {
      name: "Moodle: Verbinden (Simulation)",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Vorname", { exact: true }).fill("Mara");
  await page.getByLabel("Nachname", { exact: true }).fill("Test");
  await page.getByRole("button", { name: "Profil speichern" }).click();
  await expect(
    page.getByRole("button", { name: "Profil", exact: true }),
  ).toHaveText("MT");
  await page.reload();
  await expect(page.getByLabel("Vorname", { exact: true })).toHaveValue("Mara");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Guten Abend, Mara",
  );
  await page.goto(
    "/assistent?frage=" +
      encodeURIComponent(
        "Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?",
      ),
  );
  await page.getByRole("button", { name: "Anfrage vorbereiten" }).click();
  await expect(
    page.getByRole("textbox", { name: "Dein Anfrageentwurf" }),
  ).toHaveValue(/Viele Grüße\nMara Test$/);
  await page.goto("/einstellungen");
  await page
    .getByRole("button", { name: "Demo zurücksetzen", exact: true })
    .click();
  await page.getByRole("button", { name: "Zurücksetzen", exact: true }).click();
  await expect(page).toHaveURL(/\/start$/);
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Guten Abend, Niklas",
  );
  await expect(
    page.getByRole("button", { name: "Profil", exact: true }),
  ).toHaveText("NB");
});

test("P5-15: Anlaufstellen verlinken passende Fragen; Assistent verlinkt zurück zur zuständigen Stelle", async ({
  page,
}) => {
  await page.goto("/anlaufstellen#o-pa");
  const office = page.getByRole("region", { name: "Prüfungsamt", exact: true });
  await expect(office).toBeFocused();
  await expect(office).toContainText("Rücktritt mit Attest");
  await expect(office.getByRole("list", { name: "Quellen" })).toContainText(
    "Beispiel",
  );
  const questionTarget = await office
    .getByRole("link", {
      name: "Wie viele Versuche habe ich für eine Prüfung?",
    })
    .boundingBox();
  expect(questionTarget?.height ?? 0).toBeGreaterThanOrEqual(36);
  await office
    .getByRole("link", {
      name: "Wie viele Versuche habe ich für eine Prüfung?",
    })
    .click();
  await expect(page).toHaveURL(/assistent\?frage=A-04$/);
  const answer = page.getByRole("log");
  await answer.getByRole("link", { name: "Prüfungsamt", exact: true }).click();
  await expect(page).toHaveURL(/anlaufstellen#o-pa$/);
  await expect(
    page.getByRole("region", { name: "Prüfungsamt", exact: true }),
  ).toBeFocused();
  await page.goto("/assistent?frage=A-09");
  await expect(page.getByRole("log")).toContainText("Das hängt vom Thema ab");
  await expect(
    page.getByRole("log").getByRole("list", { name: "Quellen" }),
  ).toContainText("Website der Hochschule");
  await page
    .getByRole("link", { name: "Anlaufstellen öffnen", exact: true })
    .click();
  await expect(page).toHaveURL(/anlaufstellen$/);

  // The assistant window must hand keyboard focus to the linked office as well.
  await page.goto("/module");
  await page.getByRole("button", { name: "Assistent öffnen" }).click();
  const panel = page.getByRole("dialog", { name: "Assistent", exact: true });
  await panel
    .getByRole("button", {
      name: "Wie viele Versuche habe ich für eine Prüfung?",
      exact: true,
    })
    .click();
  await panel.getByRole("link", { name: "Prüfungsamt", exact: true }).click();
  await expect(page).toHaveURL(/anlaufstellen#o-pa$/);
  await expect(
    page.getByRole("region", { name: "Prüfungsamt", exact: true }),
  ).toBeFocused();
});
