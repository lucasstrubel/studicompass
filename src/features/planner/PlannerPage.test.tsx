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
  demoStore.getState().completeOnboarding();
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

/** After each move the result dialog opens (P5-11); "Weiter simulieren" returns to the timeline. */
async function continueSimulating(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Weiter simulieren" }));
}

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
    expect(
      screen.getByRole("dialog", {
        name: "Simulation: Statistik → WS 2027/28",
      }),
    ).toBeInTheDocument();
    await continueSimulating(user);

    const banner = screen.getByRole("status", { name: "Simulationsstatus" });
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

describe("Studienverlauf (P3-04 review)", () => {
  it("labels the header as the real plan while simulating and shows the simulated status", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));
    await continueSimulating(user);

    expect(
      screen.getByText(/Echter Plan ohne Simulation/).closest("p"),
    ).toHaveTextContent("WS 2028/29");
    expect(
      within(
        screen.getByRole("status", { name: "Simulationsstatus" }),
      ).getByText("Kritisch"),
    ).toBeVisible();
  });

  it("cites the moved module's own offering rule in the simulation (Marketing)", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Marketing verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "SS 2027" }));
    const why = screen.getByRole("button", {
      name: /^Warum\?.*Marketing: nächster Termin$/,
    });
    await user.click(why);
    const details = document.getElementById(
      why.getAttribute("aria-controls") ?? "",
    );
    expect(details).toHaveTextContent(
      "Quelle: Modulhandbuch Wirtschaftsinformatik, Modul Marketing",
    );
    expect(details).not.toHaveTextContent("Modul Statistik");
  });

  it("offers only targets that change the plan after a milestone shift", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2028/29" }));
    await continueSimulating(user);
    await user.click(
      screen.getByRole("button", { name: "IT-Sicherheit verschieben" }),
    );
    const options = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(options.length).toBeGreaterThan(0);
    expect(options).not.toContain("SS 2028");
  });

  it("shows the load hint with job hours and its source (DR-10)", () => {
    renderPlanner();
    expect(semester("SS 2027")).toHaveTextContent(
      "Hohe Belastung: 42 ECTS bei 15 Std. Nebenjob pro Woche",
    );
    expect(
      within(semester("SS 2027")).getAllByText("Beispiel").length,
    ).toBeGreaterThan(0);
  });

  it("marks a withdrawal from the Folgen-Check as a simulation here too", () => {
    act(() => {
      demoStore.getState().withdrawExam("e-stat-ws26");
    });
    renderPlanner();
    expect(screen.getByText(/Simulierte Abmeldung: Statistik/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Rückgängig" })).toBeVisible();
  });
});

describe("Studienverlauf (P3-06 review: focus)", () => {
  it("keeps the keyboard focus on the moved module's menu button", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    screen.getByRole("button", { name: "Statistik verschieben" }).focus();
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));
    await continueSimulating(user);

    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Statistik verschieben" }),
      ),
    );
    expect(semester("WS 2027/28")).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it("moves the focus to the simulation switch after discarding", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));
    await user.click(
      screen.getByRole("button", { name: "Simulation verwerfen" }),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("switch", { name: "Simulation" }),
    );
  });

  it("moves the focus to the main content after undoing a withdrawal", async () => {
    const user = userEvent.setup();
    act(() => {
      demoStore.getState().withdrawExam("e-stat-ws26");
    });
    renderPlanner();
    await user.click(screen.getByRole("button", { name: "Rückgängig" }));
    expect(document.activeElement).toBe(screen.getByRole("main"));
  });
});

describe("Studienverlauf: Orientierung (P5-10)", () => {
  it("links every module name to its module entry (P5-F13)", () => {
    renderPlanner();
    expect(
      within(semester("WS 2026/27")).getByRole("link", { name: "Statistik" }),
    ).toHaveAttribute("href", "/module/m-stat");
    expect(
      within(semester("WS 2027/28")).getByRole("link", {
        name: "Praxissemester",
      }),
    ).toHaveAttribute("href", "/module/m-praxis");
  });

  it("toggles the marking of a milestone's modules with the rule and its source (DR-6, DR-12)", async () => {
    const user = userEvent.setup();
    renderPlanner();
    const internship = within(semester("WS 2027/28")).getByRole("button", {
      name: "Praxissemester",
    });
    expect(internship).toHaveAttribute("aria-pressed", "false");
    await user.click(internship);
    expect(internship).toHaveAttribute("aria-pressed", "true");
    const status = screen.getByRole("status", { name: "Markierte Module" });
    expect(status).toHaveTextContent(
      "Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind.",
    );
    expect(within(status).getByRole("list", { name: "Quellen" })).toBeVisible();
    // 15 foundation modules: passed ones are marked, open ones also say "noch offen".
    expect(document.querySelectorAll("[data-marked]")).toHaveLength(15);
    expect(semester("WS 2026/27")).toHaveTextContent(
      "für Praxissemester · noch offen",
    );
    expect(semester("WS 2025/26")).toHaveTextContent("für Praxissemester");
    expect(semester("WS 2025/26")).not.toHaveTextContent("noch offen");

    // Another milestone replaces the marking; a second click clears it.
    const thesis = within(semester("WS 2028/29")).getByRole("button", {
      name: "Bachelorarbeit",
    });
    await user.click(thesis);
    expect(document.querySelectorAll("[data-marked]")).toHaveLength(2);
    expect(
      screen.getByRole("status", { name: "Markierte Module" }),
    ).toHaveTextContent(
      "Zur Bachelorarbeit wirst du zugelassen, wenn du Praxis- und Projektsemester bestanden hast.",
    );
    await user.click(thesis);
    expect(document.querySelectorAll("[data-marked]")).toHaveLength(0);
  });

  it("explains why milestone boxes stay put (P5-F18)", () => {
    renderPlanner();
    expect(semester("WS 2027/28")).toHaveTextContent(
      "Fester MeilensteinRutscht automatisch nach hinten, wenn Module des Grundstudiums fehlen.",
    );
    expect(semester("SS 2028")).toHaveTextContent(
      "Folgt auf das Praxissemester und rutscht mit ihm.",
    );
  });

  it("hides completed semesters and passed modules and remembers the choice (P5-F16)", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(
      screen.getByRole("switch", { name: "Abgeschlossenes ausblenden" }),
    );
    // WS 2025/26 and SS 2026 hold only passed modules (the open ones of SS 2026 are planned for SS 2027).
    for (const term of [/^WS 2025\/26,/, /^SS 2026,/])
      expect(
        screen.queryByRole("listitem", { name: term }),
      ).not.toBeInTheDocument();
    expect(semester("WS 2026/27")).toBeInTheDocument();
    expect(
      screen.getByText(/2 abgeschlossene Semester sind ausgeblendet/),
    ).toBeInTheDocument();
    expect(demoStore.getState().plannerHideCompleted).toBe(true);
  });
});

describe("Was-wäre-wenn: Ergebnis-Dialog (P5-11)", () => {
  it("shows what changes right after a move, including modules that moved along", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));
    const dialog = screen.getByRole("dialog", {
      name: "Simulation: Statistik → WS 2027/28",
    });
    expect(dialog).toHaveTextContent("AbschlussWS 2028/29wird zuSS 2029");
    expect(dialog).toHaveTextContent("PraxissemesterWS 2027/28wird zuSS 2028");
    expect(within(dialog).getByText("Kritisch")).toBeVisible();
    expect(dialog).toHaveTextContent(/Mit verschoben: \d+ Module/);
    expect(dialog).toHaveTextContent("Praxissemester");
    // Consequences come with "Warum?" and sources, as before in the banner.
    expect(
      within(dialog).getAllByRole("button", { name: /^Warum\?/ }).length,
    ).toBeGreaterThan(0);
  });

  it("takes back only the last move and reopens the result from the status", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Marketing verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "SS 2027" }));
    await continueSimulating(user);
    await user.click(screen.getByRole("button", { name: "Folgen ansehen" }));
    expect(
      screen.getByRole("dialog", { name: "Simulation: Marketing → SS 2027" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Verschiebung zurücknehmen" }),
    );
    expect(demoStore.getState().whatIf).toEqual([]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The simulation stays switched on for the next try.
    expect(screen.getByRole("switch", { name: "Simulation" })).toBeChecked();
  });

  it("discards the simulation from the dialog and returns the focus to the switch", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Simulation verwerfen",
      }),
    );
    expect(demoStore.getState().whatIf).toEqual([]);
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("switch", { name: "Simulation" }),
      ),
    );
  });

  it("makes open modules draggable only while simulating, milestones never (P5-F20)", async () => {
    const user = userEvent.setup();
    renderPlanner();
    expect(document.querySelectorAll("[data-draggable]")).toHaveLength(0);
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    const draggable = [...document.querySelectorAll("[data-draggable]")].map(
      (node) => node.querySelector("a")?.textContent,
    );
    expect(draggable).toContain("Statistik");
    expect(draggable).not.toContain("Praxissemester");
    expect(draggable).not.toContain("Mathematik 1");
  });

  it("takes back exactly the last step when the same module moves twice (P5-11 review)", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "Marketing verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "SS 2027" }));
    await continueSimulating(user);
    const first = structuredClone(demoStore.getState().whatIf);
    await user.click(
      screen.getByRole("button", { name: "Marketing verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2027/28" }));
    await user.click(
      screen.getByRole("button", { name: "Verschiebung zurücknehmen" }),
    );
    expect(demoStore.getState().whatIf).toEqual(first);
  });

  it("lists modules the rules push further, even if moved by hand before (P5-11 review)", async () => {
    const user = userEvent.setup();
    renderPlanner();
    await user.click(screen.getByRole("switch", { name: "Simulation" }));
    await user.click(
      screen.getByRole("button", { name: "IT-Sicherheit verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2028/29" }));
    await continueSimulating(user);
    await user.click(
      screen.getByRole("button", { name: "Statistik verschieben" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "WS 2028/29" }));
    const dialog = screen.getByRole("dialog", {
      name: "Simulation: Statistik → WS 2028/29",
    });
    expect(
      within(dialog)
        .getByText(/^Mit verschoben:/)
        .closest("p"),
    ).toHaveTextContent("IT-Sicherheit");
  });
});
