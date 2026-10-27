import { expect, test } from "@playwright/test";

test("P4: Tastatur-Onboarding, Tour und Überspringen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/start$/);
  const focus = async (name: string) => {
    for (let index = 0; index < 40; index++) {
      await page.keyboard.press("Tab");
      if (
        await page
          .getByRole("button", { name, exact: true })
          .evaluate((node) => node === document.activeElement)
      )
        return;
    }
    throw new Error(`Nicht per Tab erreichbar: ${name}`);
  };
  await focus("Mit Hochschul-Login anmelden (Demo)");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Kanäle verbinden" }),
  ).toBeFocused();
  await focus("Weiter");
  await page.keyboard.press("Enter");
  const slider = page.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("16");
  await focus("Weiter");
  await page.keyboard.press("Enter");
  await page.getByRole("checkbox", { name: /Danach die Produkt-Tour/ }).focus();
  await page.keyboard.press("Space");
  await focus("Einrichtung abschließen");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Dein Studienstand");
  await focus("Weiter");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toContainText("Jetzt wichtig");
  await focus("Weiter");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/assistent\?tour=3$/);
  await focus("Tour abschließen");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
});

test("P4: Postfach-Deep-Link, Gelesenstatus nach Neuladen und Browser-Zurück", async ({
  page,
}) => {
  await page.goto("/postfach?eintrag=i-02");
  await expect(page.getByRole("dialog")).toContainText("Raum A 210");
  await page
    .getByRole("button", { name: "Als gelesen markieren", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Gelesen", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Schließen", exact: true }).click();
  await page
    .getByRole("button", { name: /Übungsblatt 12 und Lösungen/ })
    .click();
  await expect(page).toHaveURL(/eintrag=i-01/);
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("P4: alle acht Fragen, Fallback, Kontext und ICS-Download", async ({
  page,
}) => {
  const questions = [
    "Bis wann kann ich mich von einer Prüfung abmelden?",
    "Was passiert, wenn ich Statistik schiebe?",
    "Was brauche ich für die Zulassung zum Praxissemester?",
    "Wie viele Versuche habe ich für eine Prüfung?",
    "Darf ich ins Hauptstudium, wenn noch Prüfungen aus dem Grundstudium offen sind?",
    "Wie viele ECTS fehlen mir noch?",
    "Wie wird mein Notenschnitt berechnet?",
    "Wann wird Statistik angeboten?",
  ];
  await page.goto("/assistent?module=m-stat");
  await expect(page.getByText("bezogen auf: Statistik")).toBeVisible();
  for (const question of questions) {
    await page.getByRole("textbox", { name: "Deine Frage" }).fill(question);
    await page.getByRole("button", { name: "Frage stellen" }).click();
    await expect(
      page
        .getByRole("log")
        .getByRole("heading", { name: question, exact: true }),
    ).toBeVisible();
  }
  await expect(page.getByRole("log").getByRole("article")).toHaveCount(8);
  await page
    .getByRole("textbox", { name: "Deine Frage" })
    .fill(
      "Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?",
    );
  await page.getByRole("button", { name: "Frage stellen" }).click();
  await page.getByRole("button", { name: "Anfrage vorbereiten" }).click();
  await expect(
    page.getByRole("textbox", { name: "Dein Anfrageentwurf" }),
  ).toContainText("Praxissemester im Ausland");
  await page.goto("/fristen");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Alle Fristen zum Kalender hinzufügen" })
    .click();
  expect((await download).suggestedFilename()).toBe("studienfristen.ics");
});

test("P4: Screens ohne Überlauf von 360 bis 1920 px in beiden Themes", async ({
  page,
}) => {
  const paths = [
    "/start",
    "/module",
    "/module/m-stat",
    "/postfach",
    "/postfach?eintrag=i-02",
    "/assistent?frage=A-02",
    "/fristen",
    "/einstellungen",
  ];
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
      if (path.includes("frage="))
        await expect(page.getByRole("log")).toContainText("KI-Antwort");
      for (const width of [360, 390, 834, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          `${path}, ${theme}, ${width}`,
        ).toBe(true);
      }
    }
  }
});

test("P4: alle Katalogfragen und der Sonderfall per Klick", async ({
  page,
}) => {
  test.setTimeout(60000);
  for (let index = 0; index < 9; index++) {
    await page.goto("/assistent");
    await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
    if (index >= 6) {
      await page.getByText("Weitere Beispielfragen", { exact: true }).click();
      await page
        .locator("details")
        .getByRole("button")
        .nth(index - 6)
        .click();
    } else {
      await page
        .getByRole("button")
        .filter({
          hasText:
            /Bis wann kann|Was passiert|Was brauche|Wie viele Versuche|Darf ich ins|Wie viele ECTS/,
        })
        .nth(index)
        .click();
    }
    await expect(page.getByRole("log")).toContainText("KI-Antwort");
    if (index === 8)
      await expect(
        page.getByRole("button", { name: "Anfrage vorbereiten" }),
      ).toBeVisible();
    else
      await expect(
        page.getByRole("log").getByRole("list", { name: "Quellen" }),
      ).toBeVisible();
  }
});

test("P4: Ziel, Nebenjob, Kanaltrennung und Demo-Reset wirken zusammen", async ({
  page,
}) => {
  await page.goto("/start");
  await page
    .getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" })
    .click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Mein Ziel: Abschluss in Regelstudienzeit" })
    .uncheck();
  await page.getByRole("slider").focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Einrichtung abschließen" }).click();
  await page.goto("/entscheidung/e-mkt-ws26");
  await expect(
    page.getByText("Dein Ziel: Studium im eigenen Tempo"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Warum.*Hohe Belastung/ })
    .first()
    .click();
  await expect(page.getByText(/16 Stunden Nebenjob/).first()).toBeVisible();
  await page.goto("/verlauf");
  await expect(page.getByText(/16 Std\./).first()).toBeVisible();
  await page.goto("/einstellungen");
  await page
    .getByRole("button", { name: "Moodle: Verbindung trennen (Simulation)" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Moodle: Verbinden (Simulation)" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Moodle: Verbinden (Simulation)" })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Moodle: Verbindung trennen (Simulation)",
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Demo zurücksetzen", exact: true })
    .click();
  await page.getByRole("button", { name: "Zurücksetzen", exact: true }).click();
  await expect(page).toHaveURL(/\/start$/);
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await page.goto("/entscheidung/e-mkt-ws26");
  await expect(
    page.getByText(/Dein Ziel: Abschluss in Regelstudienzeit/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Warum.*Hohe Belastung/ })
    .first()
    .click();
  await expect(page.getByText(/15 Stunden Nebenjob/).first()).toBeVisible();
});
