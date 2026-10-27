import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

/**
 * Smoke test of the hero flow and screenshots of the core screens (ROADMAP P3-05). Runs against the
 * production build in the locally installed Google Chrome (channel "chrome"); no browser download.
 * Files end in .e2e.ts so Vitest does not pick them up.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.e2e\.ts/,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "hero",
      testIgnore: /screens\.e2e\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "hero-mobile",
      testIgnore: /screens\.e2e\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        channel: "chrome",
      },
    },
    {
      name: "screens",
      testMatch: /screens\.e2e\.ts/,
      use: { channel: "chrome" },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
