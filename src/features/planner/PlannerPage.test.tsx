import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";
import { DEMO_STORAGE_KEY, FLAGS, LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";

beforeEach(async () => {
  vi.useFakeTimers();
  FLAGS.simulateErrors = false;
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  // user-event drives menus and focus; the data is loaded, so real timers from here on.
  vi.useRealTimers();
});
afterEach(() => {
  FLAGS.simulateErrors = false;
  vi.useRealTimers();
});

function renderPlanner() {
  const router = createMemoryRouter(routes, { initialEntries: ["/verlauf"] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

const semester = (name: string) =>
  screen.getByRole("listitem", { name: new RegExp(`^${name},`) });

describe("Studienverlauf (KONZEPT §8 S2, §10.4)", () => {
  it("shows the forecast, status and goal consistent with overview and Folgen-Check", () => {
    renderPlanner();
    expect(
      screen.getByRole("heading", { level: 1, name: "Studienverlauf" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Voraussichtlicher Abschluss:/).closest("p"),
    ).toHaveTextContent("WS 2028/29 – in Regelstudienzeit");
    expect(screen.getAllByText("Knapp").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /Dein Ziel: Abschluss in Regelstudienzeit \(WS 2028\/29\)/,
      ),
    ).toBeInTheDocument();
  });

  it("lists seven semesters with ECTS, status, milestones and the load hint", () => {
    renderPlanner();
    for (const [term, number] of [
      ["WS 2025/26", 1],
      ["SS 2026", 2],
      ["WS 2026/27", 3],
      ["SS 2027", 4],
      ["WS 2027/28", 5],
      ["SS 2028", 6],
      ["WS 2028/29", 7],
    ] as const)
      expect(semester(term)).toHaveAccessibleName(
        `${term}, ${number}. Fachsemester`,
      );

    expect(semester("WS 2025/26")).toHaveTextContent(
      "30 ECTS geplant · 30 erreicht",
    );
    expect(semester("WS 2026/27")).toHaveAttribute("aria-current", "step");
    expect(
      within(semester("WS 2026/27")).getAllByText("Angemeldet"),
    ).toHaveLength(5);
    expect(semester("SS 2027")).toHaveTextContent("Hohe Belastung: 42 ECTS");
    expect(semester("SS 2027")).toHaveTextContent("Ende Grundstudium");
    expect(semester("WS 2027/28")).toHaveTextContent("Praxissemester");
    expect(semester("SS 2028")).toHaveTextContent("Projektsemester");
    expect(semester("WS 2028/29")).toHaveTextContent("Bachelorarbeit");
    expect(
      within(semester("WS 2026/27")).getAllByRole("link", {
        name: "Folgen prüfen",
      })[0],
    ).toHaveAttribute("href", "/entscheidung/e-stat-ws26");
  });

  it("follows a simulated withdrawal like the other screens (SS 2029)", () => {
    act(() => {
      demoStore.getState().withdrawExam("e-stat-ws26");
    });
    renderPlanner();
    expect(
      screen.getByText(/Voraussichtlicher Abschluss:/).closest("p"),
    ).toHaveTextContent("SS 2029 – nach der Regelstudienzeit");
    expect(semester("SS 2028")).toHaveTextContent("Praxissemester");
  });

  it("moves a module only into allowed terms, marks the simulation and discards it without touching real data", async () => {
    const user = userEvent.setup();
    renderPlanner();
    const storedBefore = localStorage.getItem(DEMO_STORAGE_KEY);

    expect(
      screen.queryByRole("button", { name: "Statistik verschieben" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));

    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    const options = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(options).toEqual([
      "WS 2027/28",
      "WS 2028/29",
      "WS 2029/30",
      "WS 2030/31",
    ]);
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));

    const banner = screen.getByRole("status");
    expect(banner).toHaveTextContent("Simulation");
    expect(banner).toHaveTextContent(
      "Abschluss in der Simulation: SS 2029 (echter Plan: WS 2028/29) · Praxissemester SS 2028",
    );
    expect(semester("WS 2027/28")).toHaveTextContent(
      "Simulation: verschoben aus WS 2026/27",
    );
    expect(demoStore.getState().withdrawnExamIds).toEqual([]);
    expect(localStorage.getItem(DEMO_STORAGE_KEY)).toBe(storedBefore);

    await user.click(
      screen.getByRole("button", { name: "Simulation verwerfen" }),
    );
    expect(demoStore.getState().whatIf).toEqual([]);
    expect(
      screen.queryByText(/Abschluss in der Simulation/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Simulation" }),
    ).not.toBeChecked();
  });

  it("explains the rules DR-4, DR-6 and DR-7 with sources", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(
      screen.getByRole("button", { name: "Welche Regeln gelten?" }),
    );
    const panel = screen.getByRole("region", { name: "Welche Regeln gelten?" });
    expect(panel).toHaveTextContent(
      "frühestens im nächsten Semester dieses Typs",
    );
    expect(panel).toHaveTextContent(
      "Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind.",
    );
    expect(panel).toHaveTextContent(
      "höchstens drei Prüfungen des Grundstudiums",
    );
    expect(within(panel).getAllByText("Beispiel").length).toBeGreaterThan(0);
  });
});
