import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Automatic accessibility check (WCAG 2.1 A and AA) of the core screens with axe. It finds what a
// machine can find, such as contrast, names and roles; keyboard flows are covered by the other tests.

const SCREENS: [name: string, path: string][] = [
  ["Übersicht", "/"],
  ["Folgen-Check", "/entscheidung/e-pr2-ws26"],
  ["Studienverlauf", "/verlauf"],
  ["Fristen", "/fristen"],
  ["Fristen als Kalender", "/fristen?ansicht=kalender"],
  ["Postfach", "/postfach"],
  ["Module & Noten", "/module"],
  ["Moduldetail", "/module/m-pr2"],
  ["Assistent", "/assistent"],
  ["Anlaufstellen", "/anlaufstellen"],
  ["Einstellungen", "/einstellungen"],
];

async function violations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Experimental axe rule (WCAG 2.5.3). Two deliberate cases: the profile button shows initials and is
    // named "Profil"; a calendar day shows its number and is named with weekday, full date and entries.
    .disableRules(["label-content-name-mismatch"])
    .analyze();
  return result.violations.map((item) => ({
    rule: item.id,
    impact: item.impact,
    nodes: item.nodes.map((node) => node.target.join(" ")).slice(0, 5),
  }));
}

test("the onboarding has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/start");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test("the core screens have no automatically detectable accessibility violations", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const found: Record<string, unknown> = {};
  for (const [name, path] of SCREENS) {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    // Skeletons give way to content before the scan.
    await expect(page.getByRole("status", { name: /geladen/ })).toHaveCount(0);
    const list = await violations(page);
    if (list.length > 0) found[name] = list;
  }
  expect(found).toEqual({});
});

test("the Moodle views of the recording have no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  await page.goto("/einstellungen");
  const moodle = page.getByRole("region", { name: "Moodle-Daten" });
  await moodle.getByRole("button", { name: "Aufzeichnung" }).click();
  await expect(page.getByText("Moodle (Aufzeichnung)")).toBeVisible();
  await page.goto("/module/m-wi3");
  const coursework = page.getByRole("region", { name: "Prüfungsvorleistung" });
  await coursework
    .getByRole("button", { name: "Aus Moodle übernehmen" })
    .click();
  await coursework.getByRole("button", { name: /Abgaben übernehmen/ }).click();
  await page
    .getByRole("region", { name: "Moodle", exact: true })
    .getByRole("button", { name: "Moodle abgleichen" })
    .click();
  await expect(coursework).toContainText("4 von 6 erbracht");
  expect(await violations(page)).toEqual([]);
  await page.goto("/module");
  await expect(
    page.getByRole("region", { name: "Prüfungsvorleistungen im Semester" }),
  ).toBeVisible();
  expect(await violations(page)).toEqual([]);
});
