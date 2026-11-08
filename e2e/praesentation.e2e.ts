import { expect, test, type Page } from "@playwright/test";

// The slides under /praesentation/: local assets only, and the page keys leave the demo iframe.

async function openDeck(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator(".reveal.ready")).toBeAttached();
}

const slideHash = (page: Page) =>
  page.evaluate(() => window.location.hash.replace(/^#\/?/, ""));

test.describe("Präsentation", () => {
  test.skip(({ isMobile }) => isMobile, "Presented on a desktop browser");

  test("loads all slides from local files", async ({ page }) => {
    const foreign: string[] = [];
    const failed: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).hostname !== "localhost") {
        foreign.push(request.url());
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 400) failed.push(response.url());
    });

    await openDeck(page, "/praesentation/");

    await expect(page.locator(".reveal .slides > section")).toHaveCount(21);
    await expect(page.locator(".brand")).toContainText("StudiCompass");
    await page.waitForLoadState("networkidle");
    expect(foreign).toEqual([]);
    expect(failed).toEqual([]);
  });

  test("PageDown leaves the demo after clicking and navigating inside the app", async ({
    page,
  }) => {
    await openDeck(page, "/praesentation/#/11");
    const app = page.frameLocator("#demo-app");
    await app
      .getByRole("button", { name: "Demo ohne Einrichtung starten" })
      .click();
    await app
      .getByRole("heading", { level: 1, name: "Guten Abend, Niklas" })
      .waitFor();

    // A real click inside the app moves the focus into the iframe and changes the route.
    await app
      .getByRole("link", { name: "Fristen", exact: true })
      .first()
      .click();
    await app.getByRole("heading", { level: 1, name: /Fristen/ }).waitFor();
    await page.keyboard.press("PageDown");
    await expect.poll(() => slideHash(page)).toBe("12");

    // Back on a normal slide the keys reach the deck again.
    await page.keyboard.press("PageUp");
    await expect.poll(() => slideHash(page)).toBe("11");
    await page.keyboard.press("PageUp");
    await expect.poll(() => slideHash(page)).toBe("10");
  });

  test("the app keeps its page keys outside the presentation", async ({
    page,
  }) => {
    await page.goto("/");
    const messages = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let count = 0;
          window.addEventListener("message", () => (count += 1));
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "PageDown" }),
          );
          setTimeout(() => resolve(count), 100);
        }),
    );
    expect(messages).toBe(0);
  });
});
