import { expect, test } from "@playwright/test";

test("P5: T1, T3 und T4 auf Demodaten", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Demo ohne Einrichtung starten" })
    .click();
  const progress = page.getByRole("region", { name: "Dein Studienstand" });
  await expect(progress).toContainText("15 ECTS hinter dem Soll");
  await expect(progress).toContainText("75 von 90");
  await page.goto("/assistent");
  await page
    .getByRole("button", {
      name: "Wie viele Versuche habe ich für eine Prüfung?",
      exact: true,
    })
    .click();
  const answer = page.getByRole("log").getByRole("article");
  await expect(answer).toContainText("zweimal wiederholen");
  await expect(answer.getByRole("list", { name: "Quellen" })).toContainText(
    "StuPO",
  );
  // Follow-up controls must not offer actions that are silently discarded while pending.
  const followUp = answer.getByRole("button", {
    name: "Wie viele ECTS fehlen mir noch?",
  });
  await followUp.click();
  await expect(followUp).toBeDisabled();
  await expect(followUp).toBeEnabled();
  await expect(page.getByRole("log").getByRole("article")).toHaveCount(2);
  await page.goto("/postfach");
  await page
    .getByRole("button", { name: /Raumänderung: Klausur Programmierung 2/ })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Raum A 210");
});

test("P5: T5 Wirtschaftsinformatik 3 ohne Meilensteinverschiebung", async ({
  page,
  isMobile,
}) => {
  await page.goto("/entscheidung/e-wi3-ws26");
  if (isMobile) {
    await expect(
      page
        .getByRole("definition")
        .filter({ hasText: "WS 2027/28 – erreichbar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("definition").filter({ hasText: "WS 2028/29" }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole("row", { name: /^Praxissemester/ }),
    ).toContainText("WS 2027/28 – erreichbar");
    await expect(
      page.getByRole("row", { name: /^Voraussichtlicher Abschluss/ }),
    ).not.toContainText("SS 2029");
  }
  const consequences = page.getByRole("region", {
    name: "Wenn du dich abmeldest",
    exact: true,
  });
  await expect(consequences).toContainText("SS 2027: 45 ECTS geplant");
  await expect(consequences).not.toContainText(
    "Praxissemester verschiebt sich",
  );
  await consequences
    .getByRole("button", { name: /Warum.*Hohe Belastung/ })
    .click();
  await expect(
    consequences.getByRole("list", { name: "Quellen" }),
  ).toBeVisible();
});

test("P5-07: „Warum?“ reagiert auch knapp neben dem Text", async ({ page }) => {
  // A deep link before the onboarding shows no speech bubble (P5-07).
  await page.goto("/entscheidung/e-pr2-ws26");
  for (const name of [
    "Warum? – Status",
    "Warum? – Unternehmensinformatikprojekt verschiebt sich",
  ]) {
    const why = page.getByRole("button", { name, exact: true });
    await why.scrollIntoViewIfNeeded();
    const box = await why.boundingBox();
    if (!box) throw new Error(`${name} ist nicht sichtbar`);
    // 4 px above the 18 px text line: still inside the hit area of at least 24 px.
    await page.mouse.click(box.x + box.width / 2, box.y - 4);
    await expect(why).toHaveAttribute("aria-expanded", "true");
  }
});
