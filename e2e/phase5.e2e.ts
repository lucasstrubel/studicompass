import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`P5: T1, T3 und T4 auf Demodaten (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Demo ohne Einrichtung starten" })
      .click();
    const progress = page.getByRole("region", { name: "Dein Studienstand" });
    await expect(progress).toContainText("12 ECTS hinter dem Regelverlauf");
    await expect(progress).toContainText("78 von 90");
    const milestone = page.getByRole("region", { name: /^Praxissemester/ });
    await expect(milestone).toContainText("7 Module des Grundstudiums");
    await expect(milestone).toContainText(
      "Programmieren 2 und Wirtschaftsprivatrecht",
    );
    await page.goto("/assistent");
    await page
      .getByRole("button", {
        name: "Wie viele Versuche habe ich für eine Prüfung?",
        exact: true,
      })
      .click();
    const answer = page.getByRole("log").getByRole("article");
    await expect(answer).toContainText("höchstens dreimal ablegen");
    await expect(answer.getByRole("list", { name: "Quellen" })).toContainText(
      "SPO",
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
      .getByRole("button", { name: /Raumänderung: Klausur Statistik/ })
      .click();
    await expect(page.getByRole("dialog")).toContainText("Raum A 210");
  });

  test(`P5: T5 Marketing ohne Meilensteinverschiebung (${theme})`, async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/entscheidung/e-mkt-ws26");
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
    await expect(consequences).toContainText("SS 2027: 48 ECTS geplant");
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
}
