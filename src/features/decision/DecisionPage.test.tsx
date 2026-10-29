import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";
import { FLAGS, LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";

beforeEach(async () => {
  vi.useFakeTimers();
  FLAGS.simulateErrors = false;
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  demoStore.getState().completeOnboarding();
});
afterEach(() => {
  FLAGS.simulateErrors = false;
  vi.useRealTimers();
});

function renderCheck(examId: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [`/entscheidung/${examId}`],
  });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

/** Table cells of one row, by its header text: [attendPass, attendFail, withdraw]. */
function row(label: string) {
  const table = screen.getByRole("table");
  const header = within(table)
    .getAllByRole("rowheader")
    .find((cell) => cell.textContent?.startsWith(label));
  if (!header) throw new Error(`row ${label} not found`);
  const cells = within(header.closest("tr")!).getAllByRole("cell");
  return cells.map((cell) => cell.textContent);
}

describe("Folgen-Check (KONZEPT §8 S4, §10.4)", () => {
  it("shows head, deadline chip, hint and goal for Statistik", () => {
    renderCheck("e-stat-ws26");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Statistik – antreten oder abmelden?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Abmeldung bis Di, 26\.01\., 23:59/),
    ).toHaveTextContent("noch 1 Tag, 4 Std.");
    expect(screen.getByText(/Morgen um 23:59 ist Schluss\./)).toBeVisible();
    expect(
      screen.getByText(
        /Dein Ziel: Abschluss in Regelstudienzeit \(WS 2028\/29\)/,
      ),
    ).toBeInTheDocument();
  });

  it("compares exactly the values of scenarios B, C and A for Statistik", () => {
    renderCheck("e-stat-ws26");

    expect(row("Nächster Termin Statistik")).toEqual([
      "–",
      "WS 2027/28 (Versuch 2)",
      "WS 2027/28 (Versuch 1)",
    ]);
    expect(row("ECTS Ende WS 2026/27 (Soll 90)")).toEqual(["78", "72", "72"]);
    expect(row("Status")).toEqual(["Knapp", "Kritisch", "Kritisch"]);
    expect(row("Praxissemester")).toEqual([
      "WS 2027/28 – erreichbar",
      "SS 2028 (+1 Semester)",
      "SS 2028 (+1 Semester)",
    ]);
    expect(row("Voraussichtlicher Abschluss")).toEqual([
      "WS 2028/29",
      "SS 2029",
      "SS 2029",
    ]);
    expect(row("Offene Grundstudiums-Prüfungen")).toEqual([
      "2",
      "3 – Grenze erreicht",
      "3 – Grenze erreicht",
    ]);
    expect(row("Prüfungsversuche Statistik")).toEqual([
      "1 von 3 genutzt",
      "1 von 3 genutzt",
      "0 von 3 genutzt",
    ]);
    expect(
      screen.getByText(
        "Annahme: Du bestehst alle anderen angemeldeten Prüfungen.",
      ),
    ).toBeInTheDocument();
  });

  it("explains a row with its rule and source under Warum?", () => {
    renderCheck("e-stat-ws26");
    const table = screen.getByRole("table");
    const why = within(table).getByRole("button", {
      name: /^Warum\?.*Praxissemester$/,
    });
    expect(why).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(why);
    expect(why).toHaveAttribute("aria-expanded", "true");
    const details = document.getElementById(
      why.getAttribute("aria-controls") ?? "",
    );
    expect(details).toBeVisible();
    expect(details).toHaveTextContent(
      "Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind.",
    );
    expect(details).toHaveTextContent(
      "Quelle: SPO WirtschaftsinformatikBeispiel",
    );
  });

  it("shows Marketing without a milestone shift but with the load hint (scenario D)", () => {
    renderCheck("e-mkt-ws26");

    expect(row("Nächster Termin Marketing")[2]).toBe("SS 2027 (Versuch 1)");
    expect(row("ECTS Ende WS 2026/27 (Soll 90)")[2]).toBe("72");
    expect(row("Status")[2]).toBe("Knapp");
    expect(row("Praxissemester")[2]).toBe("WS 2027/28 – erreichbar");
    expect(row("Voraussichtlicher Abschluss")[2]).toBe("WS 2028/29");
    expect(row("Offene Grundstudiums-Prüfungen")[2]).toBe(
      "3 – Grenze erreicht",
    );

    const withdraw = screen.getByRole("region", {
      name: "Wenn du dich abmeldest",
    });
    expect(withdraw).toHaveTextContent("Hohe Belastung");
    expect(withdraw).toHaveTextContent("SS 2027: 48 ECTS geplant");
    expect(withdraw).not.toHaveTextContent("Praxissemester verschiebt sich");
    expect(screen.getByText(/Marketing gibt es jedes Semester/)).toBeVisible();
  });

  it("weights both actions equally", () => {
    renderCheck("e-stat-ws26");
    const attend = screen.getByRole("button", { name: "Ich trete an" });
    const withdraw = screen.getByRole("button", {
      name: "Abmeldung vornehmen",
    });
    expect(attend.className).toBe(withdraw.className);
  });

  it("simulates the withdrawal after confirmation, updates the overview and undoes it (hero flow §9)", async () => {
    const router = renderCheck("e-stat-ws26");

    fireEvent.click(
      screen.getByRole("button", { name: "Abmeldung vornehmen" }),
    );
    const dialog = screen.getByRole("alertdialog", {
      name: "Von Statistik abmelden?",
    });
    expect(dialog).toHaveTextContent(
      "Im echten Betrieb leitet StudiCompass dich zur Abmeldung ins POS weiter. Im Prototyp wird sie simuliert.",
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Abmeldung simulieren" }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(router.state.location.pathname).toBe("/");
    expect(
      screen.getByText("Statistik: Abmeldung simuliert"),
    ).toBeInTheDocument();
    const progress = screen.getByRole("region", { name: "Dein Studienstand" });
    expect(within(progress).getByText("Kritisch")).toBeInTheDocument();
    expect(progress).toHaveTextContent("SS 2028");
    expect(progress).toHaveTextContent("SS 2029");

    const toastUndo = screen
      .getAllByRole("button", { name: "Rückgängig" })
      .find((button) => button.closest("[data-sonner-toast]"));
    expect(toastUndo).toBeDefined();
    fireEvent.click(toastUndo!);
    expect(within(progress).getByText("Knapp")).toBeInTheDocument();
    expect(progress).toHaveTextContent("WS 2028/29 – in Regelstudienzeit");
  });

  it("runs the core flow by keyboard: Jetzt wichtig → Folgen prüfen → Abmeldung → confirm", async () => {
    // user-event drives real focus changes; the data is already loaded, so real timers are fine here.
    vi.useRealTimers();
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });
    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );
    async function tabTo(name: string) {
      for (let step = 0; step < 150; step++) {
        await user.tab();
        const active = document.activeElement;
        if (active?.textContent?.trim() === name) return active;
      }
      throw new Error(`${name} not reachable by Tab`);
    }

    await tabTo("Folgen prüfen");
    await user.keyboard("{Enter}");
    expect(router.state.location.pathname).toBe("/entscheidung/e-stat-ws26");

    await tabTo("Abmeldung vornehmen");
    await user.keyboard("{Enter}");
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await tabTo("Abmeldung simulieren");
    await user.keyboard("{Enter}");
    expect(router.state.location.pathname).toBe("/");
    expect(demoStore.getState().withdrawnExamIds).toEqual(["e-stat-ws26"]);
  }, 20_000);

  it("keeps the dialog cancellable and returns to the comparison", async () => {
    renderCheck("e-stat-ws26");
    fireEvent.click(
      screen.getByRole("button", { name: "Abmeldung vornehmen" }),
    );
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Zurück zum Vergleich" }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(demoStore.getState().withdrawnExamIds).toEqual([]);
  });

  it("shows the simulated state with undo when the exam is already withdrawn", () => {
    act(() => {
      demoStore.getState().withdrawExam("e-stat-ws26");
    });
    renderCheck("e-stat-ws26");

    expect(screen.getByText("Abmeldung von Statistik simuliert")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Rückgängig" }));
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("answers an unknown exam with a way back", () => {
    renderCheck("e-gibt-es-nicht");
    expect(screen.getByText("Diese Prüfung gibt es nicht")).toBeVisible();
    expect(screen.getByRole("link", { name: "Zur Übersicht" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("Folgen-Check (P3-03 review)", () => {
  it("offers Rückgängig only for the latest decision", () => {
    act(() => {
      demoStore.getState().withdrawExam("e-stat-ws26");
      demoStore.getState().withdrawExam("e-mkt-ws26");
    });
    renderCheck("e-stat-ws26");
    expect(screen.getByText("Abmeldung von Statistik simuliert")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Rückgängig" }),
    ).not.toBeInTheDocument();
  });

  it("explains the offering of the module itself (Marketing: jedes Semester)", () => {
    renderCheck("e-mkt-ws26");
    const table = screen.getByRole("table");
    const why = within(table).getByRole("button", {
      name: /^Warum\?.*Nächster Termin Marketing$/,
    });
    fireEvent.click(why);
    const details = document.getElementById(
      why.getAttribute("aria-controls") ?? "",
    );
    expect(details).toHaveTextContent(
      "Marketing wird jedes Semester angeboten.",
    );
    expect(details).toHaveTextContent(
      "Quelle: Modulhandbuch Wirtschaftsinformatik, Modul Marketing",
    );
    expect(details).not.toHaveTextContent("Statistik");
  });

  it("does not repeat a base hint that an option changes (scenario D: 48, not 42 ECTS)", () => {
    renderCheck("e-mkt-ws26");
    expect(
      screen.queryByRole("region", {
        name: "Gilt unabhängig von deiner Entscheidung",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/42 ECTS geplant/)).not.toBeInTheDocument();
  });

  it("shows channel errors with retry next to the help offers", async () => {
    renderCheck("e-stat-ws26");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
    });
    FLAGS.simulateErrors = true;
    await act(async () => {
      const reload = Promise.all([
        demoStore.getState().retry("mail"),
        demoStore.getState().retry("moodle"),
      ]);
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
      await reload;
    });
    const help = screen.getByRole("region", {
      name: "Was dir jetzt helfen kann",
    });
    expect(
      within(help).getByRole("button", { name: "Mail erneut laden" }),
    ).toBeInTheDocument();
    expect(
      within(help).getByRole("button", { name: "Moodle erneut laden" }),
    ).toBeInTheDocument();
    // The comparison stays usable while the help channels fail.
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});

describe("Folgen-Check (P3-06 review)", () => {
  it("keeps the page heading when POS fails on first load", async () => {
    FLAGS.simulateErrors = true;
    const reload = demoStore.getState().resetDemo();
    renderCheck("e-stat-ws26");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
      await reload;
    });
    expect(
      screen.getByRole("heading", { level: 1, name: "Folgen-Check" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "POS erneut laden" }),
    ).toBeInTheDocument();
  });
});

describe("Folgen-Check: Zulassung (P5-13)", () => {
  it("shows the admission from an entered Prüfungsvorleistung and keeps the comparison", () => {
    act(() => {
      demoStore.getState().saveCoursework({
        moduleId: "m-stat",
        title: "8 von 12 Übungsblättern",
        status: "failed",
      });
    });
    renderCheck("e-stat-ws26");
    expect(
      screen.getByText("Nicht zugelassen: Prüfungsvorleistung nicht erbracht"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: "Prüfungsvorleistung im Modul ansehen",
      }),
    ).toHaveAttribute("href", "/module/m-stat");
    // The comparison (KONZEPT §10.4) is untouched.
    expect(screen.getAllByText("SS 2029").length).toBeGreaterThan(0);
  });

  it("shows nothing while no Prüfungsvorleistung is entered", () => {
    renderCheck("e-stat-ws26");
    expect(
      screen.queryByText(
        /Zur Prüfung zugelassen|Zulassung offen|Nicht zugelassen/,
      ),
    ).not.toBeInTheDocument();
  });
});
