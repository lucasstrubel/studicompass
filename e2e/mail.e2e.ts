import { expect, test, type Page } from "@playwright/test";

// University mail through the bridge (ADR 0005). Connecting needs the mail sandbox from infra/mail
// and a preview server that points to it (BRIDGE_MAIL_HOST set, see .github/workflows/mail.yml).

const USER = process.env.MAIL_USER ?? "2212345";
const PASSWORD = process.env.MAIL_PASSWORD ?? "Sandbox-2026";
const sandbox = Boolean(process.env.BRIDGE_MAIL_HOST);

async function openSettings(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/einstellungen");
  return page.getByRole("region", { name: "Hochschul-Mail" });
}

test("a server without a bridge offers no password field", async ({ page }) => {
  // The static deployment answers every path with the page itself.
  await page.route("**/api/bridge/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html>" }),
  );
  const mail = await openSettings(page);
  await mail.getByRole("button", { name: "Eigenes Postfach" }).click();
  await expect(mail).toContainText("Das geht nur in der lokalen Version.");
  await expect(mail.locator("input")).toHaveCount(0);

  await page.goto("/postfach");
  await expect(
    page.getByText("Raumänderung: Klausur Programmierung 2 am 27.01.").first(),
  ).toBeVisible();
});

test("connects the mailbox, shows its mails and forgets the password on reload", async ({
  page,
}) => {
  test.skip(!sandbox, "needs the mail sandbox (npm run mail:up)");
  const mail = await openSettings(page);
  await mail.getByRole("button", { name: "Eigenes Postfach" }).click();
  await mail.getByLabel("Benutzerkennung").fill(USER);
  await mail.getByLabel("Passwort").fill(PASSWORD);
  await mail.getByRole("button", { name: "Postfach verbinden" }).click();
  await expect(mail.getByRole("status")).toContainText(`Verbunden als ${USER}`);
  await expect(page.getByText("Mail (verbunden)")).toBeVisible();

  // Client-side navigation keeps the session; a full reload drops the password.
  const menu = page.getByRole("button", { name: "Navigation öffnen" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "Postfach" }).first().click();
  await expect(
    page.getByText("Infoveranstaltung Praxissemester WS 2027/28").first(),
  ).toBeVisible();
  await expect(page.getByText("(Kein Betreff)").first()).toBeVisible();
  // The example mails are gone, the other channels stay.
  await expect(
    page.getByText("Tutorium zur Klausurvorbereitung Programmierung 2"),
  ).toHaveCount(0);
  await page
    .getByText("Raumänderung: Klausur Programmierung 2 am 27.01.")
    .first()
    .click();
  await expect(
    page.getByText("findet in Raum A 210 statt").first(),
  ).toBeVisible();

  // Reading in the app leaves the mail unread on the server.
  const response = await page.request.post("/api/bridge/mail", {
    data: { user: USER, password: PASSWORD },
  });
  const { messages } = (await response.json()) as {
    messages: { subject: string; seen: boolean }[];
  };
  expect(
    messages.find((item) => item.subject.startsWith("Raumänderung"))?.seen,
  ).toBe(false);

  await page.reload();
  await page.goto("/einstellungen");
  await expect(
    mail.getByRole("button", { name: "Beispieldaten" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage })),
  ).not.toContain(PASSWORD);
});

test("explains a wrong password", async ({ page }) => {
  test.skip(!sandbox, "needs the mail sandbox (npm run mail:up)");
  const mail = await openSettings(page);
  await mail.getByRole("button", { name: "Eigenes Postfach" }).click();
  await mail.getByLabel("Benutzerkennung").fill(USER);
  await mail.getByLabel("Passwort").fill("falsch");
  await mail.getByRole("button", { name: "Postfach verbinden" }).click();
  await expect(mail.getByRole("alert")).toContainText(
    "Die Anmeldung am Mailserver wurde abgelehnt.",
  );
  await expect(mail.getByLabel("Passwort")).toHaveValue("");
});
