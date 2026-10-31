import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const previews = path.join(repo, "test-results/p6-slides");
await mkdir(previews, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 782 },
    deviceScaleFactor: 1,
  });
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  const remote = [];
  await page.route(/^https?:/, (route) => {
    remote.push(route.request().url());
    return route.abort();
  });
  const deck = pathToFileURL(
    path.join(repo, "docs/praesentation/studicompass.html"),
  ).href;
  await page.goto(deck);
  await page.evaluate(() => document.fonts.ready);
  const count = await page.locator(".slide").count();
  if (count !== 12) throw new Error(`Erwartet: 12 Folien, erhalten: ${count}`);
  const measurements = [];
  for (let index = 1; index <= count; index++) {
    await page.goto(`${deck}#${index}`);
    await page.evaluate(() => document.fonts.ready);
    const slide = page.locator('.slide[aria-hidden="false"]');
    await slide.screenshot({
      path: path.join(previews, `slide-${String(index).padStart(2, "0")}.png`),
    });
    measurements.push(
      await slide.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          id: node.id,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
          overflows: [...node.querySelectorAll("h1,h2,h3,p,figure,table")]
            .filter((item) => {
              const child = item.getBoundingClientRect();
              return (
                child.left < rect.left - 1 ||
                child.right > rect.right + 1 ||
                child.bottom > rect.bottom + 1
              );
            })
            .map((item) => item.textContent.slice(0, 90)),
          brokenImages: [...node.querySelectorAll("img")].filter(
            (img) => !img.complete || img.naturalWidth === 0,
          ).length,
        };
      }),
    );
  }
  await page.goto(`${deck}#1`);
  await page.keyboard.press("End");
  if ((await page.locator("#count").textContent()) !== "12 / 12")
    throw new Error("Ende-Navigation fehlgeschlagen");
  await page.keyboard.press("Home");
  await page.keyboard.press("n");
  if (!(await page.locator("#notes").isVisible()))
    throw new Error("Notizen fehlen");
  await page.keyboard.press("n");
  await page.getByRole("button", { name: "Nächste Folie" }).click();
  if ((await page.locator("#count").textContent()) !== "2 / 12")
    throw new Error("Button-Navigation fehlgeschlagen");
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${deck}#4`);
    const within = await page
      .locator('.slide[aria-hidden="false"]')
      .evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return (
          rect.left >= -1 &&
          rect.top >= -1 &&
          rect.right <= innerWidth + 1 &&
          rect.bottom <= innerHeight + 1
        );
      });
    if (!within)
      throw new Error(
        `Folie passt nicht in ${viewport.width} × ${viewport.height}`,
      );
  }
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => {
    document.title = "StudiCompass – Präsentation";
  });
  const pdfPath = path.join(repo, "docs/praesentation/studicompass.pdf");
  await page.pdf({
    path: pdfPath,
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });
  const pdf = (await readFile(pdfPath)).toString("latin1");
  const pdfPages = (pdf.match(/\/Type\s*\/Page\b/g) ?? []).length;
  const report = { count, pdfPages, remote, failures, measurements };
  await writeFile(
    path.join(previews, "validation.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  if (
    pdfPages !== count ||
    remote.length ||
    failures.length ||
    measurements.some(
      (item) =>
        item.overflows.length ||
        item.brokenImages ||
        item.scrollHeight > item.clientHeight,
    )
  ) {
    throw new Error(`Folienprüfung fehlgeschlagen: ${JSON.stringify(report)}`);
  }
  console.log(
    JSON.stringify({
      slides: count,
      pdfPages,
      remoteRequests: remote.length,
      previews,
      pdfPath,
    }),
  );
} finally {
  await browser.close();
}
