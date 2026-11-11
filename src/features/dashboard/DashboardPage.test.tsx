import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

function renderOverview() {
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

const region = (name: string | RegExp) => screen.getByRole("region", { name });

describe("Übersicht", () => {
  it("shows the study progress from the store: 45 of 210, target 60, Knapp, forecast 75 of 90", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { level: 1, name: "Guten Abend, Niklas" }),
    ).toBeInTheDocument();
    const progress = region("Dein Studienstand");
    expect(within(progress).getByText("45")).toBeInTheDocument();
    expect(within(progress).getByText("ECTS von 210")).toBeInTheDocument();
    expect(within(progress).getByText("Knapp")).toBeInTheDocument();
    expect(progress).toHaveTextContent("15 ECTS hinter dem Soll von 60");
    expect(progress).toHaveTextContent("75 von 90");
    expect(progress).toHaveTextContent("WS 2028/29 – in Regelstudienzeit");
  });

  it("raises Programmierung 2 under Jetzt wichtig with deadline, countdown, sources and the way to the Folgen-Check", () => {
    renderOverview();
    const important = region("Jetzt wichtig");

    expect(
      within(important).getByRole("heading", {
        level: 3,
        name: "Programmierung 2: Abmeldung nur noch bis morgen, 23:59 Uhr",
      }),
    ).toBeInTheDocument();
    expect(important).toHaveTextContent("Morgen um 23:59 ist Schluss.");
    expect(important).toHaveTextContent("noch 1 Tag, 4 Std.");
    expect(important).toHaveTextContent(
      "StuPO Bachelor (ab 01.09.2026), § 7 Abs. 2",
    );
    expect(important).toHaveTextContent("§ 56 Abs. 2");
    expect(within(important).queryByText("Beispiel")).not.toBeInTheDocument();
    expect(
      within(important).getByRole("link", { name: "Folgen prüfen" }),
    ).toHaveAttribute("href", "/entscheidung/e-pr2-ws26");
  });

  it("lists the five modules of this semester", () => {
    renderOverview();

    const modules = region("Dieses Semester (WS 2026/27)");
    expect(within(modules).getAllByRole("heading", { level: 3 })).toHaveLength(
      5,
    );
    expect(modules).toHaveTextContent("Übungsblätter 5/12");
    expect(modules).toHaveTextContent("nur im SS");
  });

  it("shows the new state after a simulated withdrawal and restores it with Rückgängig", () => {
    renderOverview();
    act(() => {
      demoStore.getState().withdrawExam("e-pr2-ws26");
    });

    const progress = region("Dein Studienstand");
    expect(within(progress).getByText("Kritisch")).toBeInTheDocument();
    expect(progress).toHaveTextContent(
      "Dein Unternehmensinformatikprojekt verschiebt sich voraussichtlich auf SS 2028.",
    );
    expect(progress).toHaveTextContent("65 von 90");
    expect(progress).toHaveTextContent("SS 2029 – 1 Semester später");
    expect(region("Jetzt wichtig")).toHaveTextContent(
      "Gerade steht keine Entscheidung mit Sonderregel an.",
    );
    expect(
      screen.getByText(/Simulierte Abmeldung: Programmierung 2/),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Rückgängig" }));
    expect(
      within(region("Dein Studienstand")).getByText("Knapp"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Simulierte Abmeldung/)).not.toBeInTheDocument();
  });

  it("cites the StuPO for the withdrawal deadline and the handbook for the offering labels", () => {
    renderOverview();
    // "Jetzt wichtig" holds Programmierung 2; the card shows the withdrawal deadline after it.
    const deadline = screen.getAllByRole("region", {
      name: "Nächste Frist danach",
    })[0];
    expect(deadline).toHaveTextContent("Abmeldung Datenmanagement");
    expect(deadline).not.toHaveTextContent("Programmierung 2");
    expect(deadline).toHaveTextContent(
      "Quelle: StuPO Bachelor (ab 01.09.2026), § 7 Abs. 2, § 12 Abs. 1",
    );
    expect(region("Dieses Semester (WS 2026/27)")).toHaveTextContent(
      "Quelle: Modulhandbuch UIB",
    );
  });

  const headingOrder = (names: string[]) => {
    const headings = within(screen.getByRole("main")).getAllByRole("heading", {
      level: 2,
    });
    return names.map((name) =>
      headings.findIndex((heading) => heading.textContent === name),
    );
  };
  const inOrder = (order: number[]) =>
    order.every((index) => index >= 0) &&
    [...order].sort((a, b) => a - b).join() === order.join();

  it("leads with Jetzt wichtig below 1280 px while a deadline is less than two days away", () => {
    renderOverview();
    expect(
      inOrder(
        headingOrder([
          "Jetzt wichtig",
          "Dein Studienstand",
          "ECTS-Verlauf",
          "Nächste Frist danach",
          "Dieses Semester (WS 2026/27)",
        ]),
      ),
    ).toBe(true);
  });

  it("keeps the order from 1280 px: Studienstand, ECTS-Verlauf, Jetzt wichtig, Dieses Semester", () => {
    const matchMedia = vi
      .spyOn(window, "matchMedia")
      .mockImplementation((query) => ({
        matches: query === "(min-width: 80rem)",
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }));
    renderOverview();
    expect(
      inOrder(
        headingOrder([
          "Dein Studienstand",
          "ECTS-Verlauf",
          "Jetzt wichtig",
          "Dieses Semester (WS 2026/27)",
        ]),
      ),
    ).toBe(true);
    matchMedia.mockRestore();
  });

  it("shows skeletons while loading and an error with retry per channel", async () => {
    FLAGS.simulateErrors = true;
    const reload = demoStore.getState().resetDemo();
    demoStore.getState().completeOnboarding();
    renderOverview();
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
      await reload;
    });
    expect(
      screen.getAllByRole("button", { name: "POS erneut laden" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("POS konnte nicht geladen werden").length,
    ).toBeGreaterThan(0);

    FLAGS.simulateErrors = false;
    for (const name of ["Regelwerk erneut laden", "POS erneut laden"])
      fireEvent.click(screen.getAllByRole("button", { name })[0]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
    });
    expect(
      within(region("Dein Studienstand")).getByText("45"),
    ).toBeInTheDocument();
  });
});

describe("Übersicht (P3-06 review)", () => {
  it("names the calculation popover after its title", () => {
    renderOverview();
    fireEvent.click(
      screen.getByRole("button", { name: "Wie wird das berechnet?" }),
    );
    expect(
      screen.getByRole("dialog", { name: "So rechnet StudiCompass" }),
    ).toBeInTheDocument();
  });

  it("shows Moodle progress as loading, not as unavailable, while Moodle loads", () => {
    // POS is loaded, Moodle has not answered yet (first load).
    act(() => {
      demoStore.setState((state) => ({
        resources: {
          ...state.resources,
          moodle: { ...state.resources.moodle, data: null, status: "loading" },
        },
      }));
    });
    renderOverview();
    const modules = region("Dieses Semester (WS 2026/27)");
    expect(modules).toHaveTextContent("Moodle-Fortschritt wird geladen");
    expect(modules).not.toHaveTextContent("nicht verfügbar");
  });
});

describe("ECTS-Verlauf (P5-12)", () => {
  it("lists the gap to the target per semester up to the graduation in the value table", async () => {
    vi.useRealTimers();
    renderOverview();
    const table = await screen.findByRole(
      "table",
      { name: "ECTS je Semester" },
      { timeout: 5000 },
    );
    const rows = within(table)
      .getAllByRole("row")
      .map((row) => row.textContent);
    expect(rows).toEqual([
      "SemesterIst / PrognoseSollDifferenz",
      "WS 2025/263030±0",
      "SS 20264560−15",
      "WS 2026/2775 (Prognose)90−15",
      "SS 2027115 (Prognose)120−5",
      "WS 2027/28150 (Prognose)150±0",
      "SS 2028180 (Prognose)180±0",
      "WS 2028/29210 (Prognose)210±0",
    ]);
  });
});
