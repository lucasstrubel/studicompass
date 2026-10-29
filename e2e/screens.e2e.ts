import { expect, test } from "@playwright/test";

// Screenshots of the core screens for reviews and slides (ROADMAP P3-05): 2 viewports, light design only.
// Run with `npm run screens`; files go to docs/screens/<screen>-<viewport>.png.

const SCREENS = [
  { name: "uebersicht", path: "/" },
  { name: "assistent-hinweis", path: "/" },
  { name: "folgen-check-statistik", path: "/entscheidung/e-stat-ws26" },
  { name: "folgen-check-marketing", path: "/entscheidung/e-mkt-ws26" },
  { name: "studienverlauf", path: "/verlauf" },
  { name: "studienverlauf-meilenstein", path: "/verlauf" },
  { name: "studienverlauf-ergebnis", path: "/verlauf" },
  { name: "module", path: "/module" },
  { name: "modul-statistik", path: "/module/m-stat" },
  { name: "modul-pruefungsvorleistung", path: "/module/m-stat" },
  { name: "postfach", path: "/postfach" },
  { name: "postfach-detail", path: "/postfach?eintrag=i-02" },
  { name: "assistent", path: "/assistent" },
  { name: "assistent-antwort", path: "/assistent?frage=A-02" },
  {
    name: "assistent-fallback",
    path: "/assistent?frage=Kann%20ich%20Statistik%20im%20Ausland%20schreiben%3F",
  },
  { name: "fristen", path: "/fristen" },
  { name: "fristen-laden", path: "/fristen" },
  { name: "fristen-eigener-termin", path: "/fristen" },
  { name: "assistent-wartet", path: "/assistent?frage=A-04" },
  { name: "einstellungen", path: "/einstellungen" },
  { name: "benachrichtigungen", path: "/module" },
  { name: "navigation", path: "/module" },
  { name: "folgen-check-assistent", path: "/entscheidung/e-stat-ws26" },
  { name: "onboarding-1", path: "/start" },
  { name: "onboarding-2", path: "/start" },
  { name: "onboarding-3", path: "/start" },
  { name: "onboarding-4", path: "/start" },
];
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];
for (const screen of SCREENS)
  for (const viewport of VIEWPORTS.filter(
    // From 1280 px the top bar lists every area and there is no menu to open (P5-09).
    (item) => screen.name !== "navigation" || item.name === "390",
  ))
    test(`${screen.name} ${viewport.name}`, async ({ page }) => {
      const loadingDeadlines = screen.name === "fristen-laden";
      const clockTime = new Date("2027-01-25T18:30:00Z");
      if (loadingDeadlines) {
        await page.clock.install({ time: clockTime });
        await page.clock.pauseAt(clockTime);
      }
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(screen.path);
      if (screen.path === "/")
        await page
          .getByRole("button", { name: "Demo ohne Einrichtung starten" })
          .click();
      if (screen.path === "/")
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: "Guten Abend, Niklas",
          }),
        ).toBeVisible();
      if (
        screen.name.startsWith("onboarding-") &&
        screen.name !== "onboarding-1"
      ) {
        await page
          .getByRole("button", {
            name: "Mit Hochschul-Login anmelden (Demo)",
          })
          .click();
        for (let step = 2; step < Number(screen.name.at(-1)); step++)
          await page
            .getByRole("button", { name: "Weiter", exact: true })
            .click();
      }
      await expect(
        page.getByRole("heading", { level: 1, includeHidden: true }),
      ).toBeVisible();
      // Wait until every skeleton is gone, so the data of all channels is shown.
      if (loadingDeadlines) {
        await expect(
          page.getByRole("status", { name: "Fristen werden geladen" }),
        ).toBeVisible();
        await expect(
          page.getByText("Keine Fristen in diesem Zeitraum."),
        ).toHaveCount(0);
      } else {
        await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
      }
      if (screen.name === "onboarding-2")
        await expect(
          page.getByText("Verbunden (Demo)", { exact: true }),
        ).toHaveCount(4);
      if (screen.path.startsWith("/assistent?"))
        await expect(page.getByRole("log")).toContainText("KI-Antwort");
      // The speech bubble introduces the assistant once per demo state (P5-07); only its own view shows it.
      const hint = page.getByRole("button", { name: "Hinweis ausblenden" });
      if (screen.name === "assistent-hinweis") await expect(hint).toBeVisible();
      else if (await hint.isVisible()) await hint.click();
      if (screen.name === "assistent-wartet") {
        await page.clock.install({ time: clockTime });
        await page.clock.pauseAt(clockTime);
        const followUp = page
          .getByRole("log")
          .getByRole("button", { name: "Wie viele ECTS fehlen mir noch?" });
        await followUp.click();
        await expect(followUp).toBeDisabled();
      }
      if (screen.name === "benachrichtigungen")
        await page.getByRole("button", { name: /^Benachrichtigungen/ }).click();
      if (screen.name === "studienverlauf-meilenstein")
        await page
          .getByRole("button", { name: "Praxissemester", exact: true })
          .click();
      if (screen.name === "studienverlauf-ergebnis") {
        await page.getByRole("switch", { name: "Simulation" }).click();
        await page
          .getByRole("button", { name: "Statistik verschieben" })
          .click();
        await page.getByRole("menuitem", { name: "WS 2027/28" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
      }
      if (screen.name === "modul-pruefungsvorleistung") {
        const card = page.getByRole("region", { name: "Prüfungsvorleistung" });
        await card
          .getByRole("button", { name: "Prüfungsvorleistung eintragen" })
          .click();
        await card
          .getByLabel("Was ist zu erbringen?")
          .fill("8 von 12 Übungsblättern");
        await card.getByLabel("Frist (optional)").fill("2027-01-26");
        await card.getByRole("button", { name: "Eintragen" }).click();
        await card.scrollIntoViewIfNeeded();
      }
      if (screen.name === "fristen-eigener-termin") {
        await page.getByRole("button", { name: "Termin hinzufügen" }).click();
        const dialog = page.getByRole("dialog");
        await dialog.getByLabel("Titel").fill("Lerngruppe Statistik");
        await dialog.getByLabel("Datum").fill("2027-01-26");
        await dialog.getByLabel("Uhrzeit (optional)").fill("10:00");
        await dialog.getByLabel("Art").selectOption("appointment");
        await dialog.getByRole("button", { name: "Speichern" }).click();
        await expect(dialog).toHaveCount(0);
      }
      if (screen.name === "navigation")
        await page.getByRole("button", { name: "Navigation öffnen" }).click();
      if (screen.name === "folgen-check-assistent") {
        await page.getByRole("button", { name: "Assistent öffnen" }).click();
        const assistant = page.getByRole("dialog", { name: "Assistent" });
        await assistant
          .getByRole("button", {
            name: "Was passiert, wenn ich Statistik schiebe?",
          })
          .click();
        await expect(assistant.getByRole("log")).toContainText("KI-Antwort");
      }
      await page.evaluate(() => document.fonts.ready);
      // The pointer stays where the last click happened; move it away so no hover style shows.
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: `docs/screens/${screen.name}-${viewport.name}.png`,
        fullPage: ![
          "assistent-hinweis",
          "postfach-detail",
          "benachrichtigungen",
          "navigation",
          "studienverlauf-ergebnis",
          "folgen-check-assistent",
        ].includes(screen.name),
      });
    });
