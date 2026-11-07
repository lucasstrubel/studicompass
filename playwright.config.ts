import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

/**
 * End-to-end tests of the hero flow and the core screens. Runs against the production build in the
 * locally installed Google Chrome (channel "chrome"); no browser download.
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
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "hero-mobile",
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        channel: "chrome",
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
