import { expect, test } from "@playwright/test";

// The production build carries a Content Security Policy (vite.config.ts, docs/SICHERHEIT.md). The
// app must work under it without a single violation, and the policy must stop what it is there for.

const SCREENS = [
  "/",
  "/entscheidung/e-pr2-ws26",
  "/verlauf",
  "/fristen?ansicht=kalender",
  "/postfach",
  "/module/m-pr2",
  "/assistent",
  "/einstellungen",
];

test("the app runs under its Content Security Policy without violations", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const violations: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(
        `CSP violation: ${event.violatedDirective} ${event.blockedURI}`,
      );
    });
  });
  page.on("console", (message) => {
    if (/Content Security Policy|CSP violation/.test(message.text()))
      violations.push(message.text().slice(0, 160));
  });

  await page.goto("/");
  expect(
    await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute("content"),
  ).toContain("script-src 'self'");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  for (const path of SCREENS) {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("status", { name: /geladen/ })).toHaveCount(0);
  }
  // Lazy chunks: the assistant window and the Moodle adapter with the recording.
  await page.goto("/fristen");
  await page.getByRole("button", { name: "Assistent öffnen" }).click();
  await expect(
    page.getByRole("dialog", { name: "Assistent", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/einstellungen");
  await page
    .getByRole("region", { name: "Moodle-Daten" })
    .getByRole("button", { name: "Aufzeichnung" })
    .click();
  await expect(page.getByText("Moodle (Aufzeichnung)")).toBeVisible();

  expect(violations).toEqual([]);
});

test("the policy blocks injected inline scripts", async ({ page }) => {
  await page.goto("/");
  const ran = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.textContent = "window.__injected = true";
        document.body.append(script);
        setTimeout(
          () =>
            resolve((window as { __injected?: boolean }).__injected === true),
          50,
        );
      }),
  );
  expect(ran).toBe(false);
});
