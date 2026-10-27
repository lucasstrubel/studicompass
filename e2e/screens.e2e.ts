import { expect, test } from "@playwright/test";

// Screenshots of the core screens for reviews and slides (ROADMAP P3-05): 2 viewports × 2 themes.
// Run with `npm run screens`; files go to docs/screens/<screen>-<viewport>-<theme>.png.

const SCREENS = [
  { name: "uebersicht", path: "/" },
  { name: "folgen-check-statistik", path: "/entscheidung/e-stat-ws26" },
  { name: "folgen-check-marketing", path: "/entscheidung/e-mkt-ws26" },
  { name: "studienverlauf", path: "/verlauf" },
  { name: "module", path: "/module" },
  { name: "modul-statistik", path: "/module/m-stat" },
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
  { name: "assistent-wartet", path: "/assistent?frage=A-04" },
  { name: "einstellungen", path: "/einstellungen" },
  { name: "benachrichtigungen", path: "/module" },
  { name: "onboarding-1", path: "/start" },
  { name: "onboarding-2", path: "/start" },
  { name: "onboarding-3", path: "/start" },
  { name: "onboarding-4", path: "/start" },
];
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];
const THEMES = ["light", "dark"] as const;

for (const screen of SCREENS)
  for (const viewport of VIEWPORTS)
    for (const theme of THEMES)
      test(`${screen.name} ${viewport.name} ${theme}`, async ({ page }) => {
        const loadingDeadlines = screen.name === "fristen-laden";
        const clockTime = new Date("2027-01-25T18:30:00Z");
        if (loadingDeadlines) {
          await page.clock.install({ time: clockTime });
          await page.clock.pauseAt(clockTime);
        }
        await page.setViewportSize(viewport);
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
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
        if (screen.name.startsWith("assistent-") && screen.name !== "assistent")
          await expect(page.getByRole("log")).toContainText("KI-Antwort");
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
          await page
            .getByRole("button", { name: /^Benachrichtigungen/ })
            .click();
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `docs/screens/${screen.name}-${viewport.name}-${theme}.png`,
          fullPage: !["postfach-detail", "benachrichtigungen"].includes(
            screen.name,
          ),
        });
      });
