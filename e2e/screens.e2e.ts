import { expect, test } from "@playwright/test";

// Screenshots of the core screens for reviews and slides (ROADMAP P3-05): 2 viewports × 2 themes.
// Run with `npm run screens`; files go to docs/screens/<screen>-<viewport>-<theme>.png.

const SCREENS = [
  { name: "uebersicht", path: "/" },
  { name: "folgen-check-statistik", path: "/entscheidung/e-stat-ws26" },
  { name: "folgen-check-marketing", path: "/entscheidung/e-mkt-ws26" },
  { name: "studienverlauf", path: "/verlauf" },
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
        await page.setViewportSize(viewport);
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await page.goto(screen.path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        // Wait until every skeleton is gone, so the data of all channels is shown.
        await expect(page.locator("[data-slot=skeleton]")).toHaveCount(0);
        await page.screenshot({
          path: `docs/screens/${screen.name}-${viewport.name}-${theme}.png`,
          fullPage: true,
        });
      });
