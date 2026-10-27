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

describe("Übersicht (KONZEPT §8 S1, §10.4)", () => {
  it("shows the study progress from the store: 48 of 210, target 60, Knapp, forecast 78 of 90", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { level: 1, name: "Guten Abend, Niklas" }),
    ).toBeInTheDocument();
    const progress = region("Dein Studienstand");
    expect(within(progress).getByText("48")).toBeInTheDocument();
    expect(within(progress).getByText("ECTS von 210")).toBeInTheDocument();
    expect(within(progress).getByText("Knapp")).toBeInTheDocument();
    expect(progress).toHaveTextContent(
      "12 ECTS hinter dem Regelverlauf (Soll nach 2 Semestern: 60)",
    );
    expect(progress).toHaveTextContent(
      "78 von 90 – wenn du alle angemeldeten Prüfungen bestehst",
    );
    expect(progress).toHaveTextContent("WS 2028/29 – in Regelstudienzeit");
  });

  it("raises Statistik under Jetzt wichtig with deadline, countdown, sources and the way to the Folgen-Check", () => {
    renderOverview();
    const important = region("Jetzt wichtig");

    expect(
      within(important).getByRole("heading", {
        level: 3,
        name: "Statistik: Abmeldung nur noch bis morgen, 23:59 Uhr",
      }),
    ).toBeInTheDocument();
    expect(important).toHaveTextContent("Morgen um 23:59 ist Schluss.");
    expect(important).toHaveTextContent("noch 1 Tag, 4 Std.");
    expect(within(important).getAllByText("Beispiel").length).toBeGreaterThan(
      0,
    );
    expect(
      within(important).getByRole("link", { name: "Folgen prüfen" }),
    ).toHaveAttribute("href", "/entscheidung/e-stat-ws26");
  });

  it("lists the five modules of this semester and the next milestone", () => {
    renderOverview();

    const modules = region("Dieses Semester (WS 2026/27)");
    expect(within(modules).getAllByRole("heading", { level: 3 })).toHaveLength(
      5,
    );
    expect(modules).toHaveTextContent("Übungsblätter 5/12");
    expect(modules).toHaveTextContent("nur im WS");

    const milestone = region(/^Praxissemester/);
    expect(milestone).toHaveTextContent("Praxissemester · WS 2027/28");
    expect(milestone).toHaveTextContent(
      "Noch offen: 7 Module des Grundstudiums (5 davon in diesem Semester angemeldet)",
    );
    expect(milestone).toHaveTextContent(
      "Erreichbar, wenn du Programmieren 2 und Wirtschaftsprivatrecht im SS 2027 bestehst.",
    );
  });

  it("shows the new state after a simulated withdrawal and restores it with Rückgängig (§9)", () => {
    renderOverview();
    act(() => {
      demoStore.getState().withdrawExam("e-stat-ws26");
    });

    const progress = region("Dein Studienstand");
    expect(within(progress).getByText("Kritisch")).toBeInTheDocument();
    expect(progress).toHaveTextContent(
      "Dein Praxissemester verschiebt sich voraussichtlich auf SS 2028.",
    );
    expect(progress).toHaveTextContent("72 von 90");
    expect(progress).toHaveTextContent(
      "SS 2029 – 1 Semester nach der Regelstudienzeit",
    );
    expect(region(/^Praxissemester/)).toHaveTextContent(
      "Praxissemester · SS 2028 (+1 Semester)",
    );
    expect(region("Jetzt wichtig")).toHaveTextContent(
      "Gerade steht keine Entscheidung mit Sonderregel an.",
    );
    expect(screen.getByText(/Simulierte Abmeldung: Statistik/)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Rückgängig" }));
    expect(
      within(region("Dein Studienstand")).getByText("Knapp"),
    ).toBeInTheDocument();
    expect(region(/^Praxissemester/)).toHaveTextContent(
      "Praxissemester · WS 2027/28",
    );
    expect(screen.queryByText(/Simulierte Abmeldung/)).not.toBeInTheDocument();
  });

  it("cites the sources of the withdrawal deadline and the offering labels (Beispiel)", () => {
    renderOverview();
    const deadline = screen.getAllByRole("region", {
      name: "Nächste Frist",
    })[0];
    expect(deadline).toHaveTextContent(
      "Quelle: SPO WirtschaftsinformatikBeispiel",
    );
    expect(region("Dieses Semester (WS 2026/27)")).toHaveTextContent(
      "Quelle: Modulhandbuch WirtschaftsinformatikBeispiel",
    );
  });

  it("keeps the mobile order: Studienstand, Jetzt wichtig, Nächste Frist, Dieses Semester, Meilenstein", () => {
    renderOverview();
    const main = screen.getByRole("main");
    const order = [
      "Dein Studienstand",
      "Jetzt wichtig",
      "Nächste Frist",
      "Dieses Semester (WS 2026/27)",
      "Praxissemester · WS 2027/28",
    ].map((name) =>
      within(main)
        .getAllByRole("heading", { level: 2 })
        .findIndex((heading) => heading.textContent === name),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("shows skeletons while loading and an error with retry per channel", async () => {
    FLAGS.simulateErrors = true;
    const reload = demoStore.getState().resetDemo();
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
    expect(
      screen.getByRole("button", { name: "Assistent erneut laden" }),
    ).toBeInTheDocument();

    FLAGS.simulateErrors = false;
    for (const name of ["Regelwerk erneut laden", "POS erneut laden"])
      fireEvent.click(screen.getAllByRole("button", { name })[0]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
    });
    expect(
      within(region("Dein Studienstand")).getByText("48"),
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
