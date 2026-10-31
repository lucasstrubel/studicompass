import { chromium, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const output = path.join(repo, "test-results/p6-media");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto(
    pathToFileURL(path.join(repo, "artifacts/presentation/backup.html")).href,
  );
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video.readyState >= 1 || video.error;
  });
  const metadata = await page
    .locator("video")
    .evaluate((video) => ({
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      error: video.error?.message ?? null,
    }));
  if (
    metadata.error ||
    !Number.isFinite(metadata.duration) ||
    metadata.duration < 180 ||
    metadata.duration > 240 ||
    metadata.width !== 1440 ||
    metadata.height !== 900
  ) {
    throw new Error(`Video-Metadaten: ${JSON.stringify(metadata)}`);
  }
  const manifest = JSON.parse(
    await readFile(
      path.join(repo, "artifacts/presentation/manifest.json"),
      "utf8",
    ),
  );
  for (let index = 0; index < manifest.chapters.length; index++) {
    const seconds = Math.min(
      manifest.chapters[index].seconds + 2,
      metadata.duration - 1,
    );
    await page.locator("video").evaluate(
      (video, time) =>
        new Promise((resolve, reject) => {
          video.addEventListener("seeked", resolve, { once: true });
          video.addEventListener(
            "error",
            () => reject(new Error("Video lässt sich nicht lesen")),
            { once: true },
          );
          video.currentTime = time;
        }),
      seconds,
    );
    await page.locator("video").evaluate((video) => {
      video.muted = true;
      return video.play();
    });
    await page.waitForTimeout(200);
    await page.locator("video").evaluate((video) => video.pause());
    await page
      .locator("video")
      .screenshot({
        path: path.join(
          output,
          `video-${String(index + 1).padStart(2, "0")}.png`,
        ),
      });
  }
  const trackCues = await page
    .locator("video")
    .evaluate((video) => video.textTracks[0]?.cues?.length ?? 0);
  if (trackCues !== 8)
    throw new Error(`Kapitelhinweise nicht lokal verfügbar: ${trackCues}`);

  const pdf = pathToFileURL(
    path.join(repo, "docs/praesentation/studicompass.pdf"),
  ).href;
  await page.goto(pdf);
  await page.waitForTimeout(1000);
  const viewer = page
    .frames()
    .find((frame) => frame.url().startsWith("chrome-extension:"));
  if (!viewer) throw new Error("Chrome-PDF-Betrachter fehlt");
  const selector = viewer.getByRole("textbox", {
    name: "Page number",
    exact: true,
  });
  for (let number = 1; number <= 12; number++) {
    // Native page selection is necessary: a changed URL fragment did not move this viewer.
    await selector.fill(String(number));
    await selector.press("Enter");
    await expect(selector).toHaveValue(String(number));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(output, `pdf-${String(number).padStart(2, "0")}.png`),
    });
  }
  await expect(selector).toHaveValue("12");
  const report = {
    video: metadata,
    chapterFrames: manifest.chapters.length,
    localSubtitleCues: trackCues,
    pdfViewerCaptures: 12,
  };
  await writeFile(
    path.join(output, "validation.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
