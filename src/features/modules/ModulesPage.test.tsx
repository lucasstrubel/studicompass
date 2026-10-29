import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { ModulesPage } from "./ModulesPage";

afterEach(() => vi.useRealTimers());
it.each(["/module", "/module/m-stat", "/module/unbekannt"])(
  "P4-03: Liste und Moduldetail %s",
  async (path) => {
    vi.useFakeTimers();
    const ready = demoStore.getState().resetDemo();
    await vi.advanceTimersByTimeAsync(LATENCY_MS);
    await ready;
    render(
      <RouterProvider
        router={createMemoryRouter(
          [{ path: "/module/:moduleId?", Component: ModulesPage }],
          { initialEntries: [path] },
        )}
      />,
    );
    if (path === "/module") {
      expect(screen.getByText("48")).toBeInTheDocument();
      expect(screen.getByText("2,4")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
    } else if (path.endsWith("m-stat")) {
      expect(
        screen.getByRole("link", { name: "Folgen einer Abmeldung prüfen" }),
      ).toHaveAttribute("href", "/entscheidung/e-stat-ws26");
      expect(
        screen.getByRole("link", { name: "Frage zu diesem Modul stellen" }),
      ).toHaveAttribute("href", "/assistent?module=m-stat");
      expect(
        screen.getByText("Übungsblätter 5/12 · letzte Aktivität vor 16 Tagen"),
      ).toBeInTheDocument();
    } else
      expect(
        screen.getByText("Dieses Modul gibt es nicht"),
      ).toBeInTheDocument();
  },
);

async function renderAt(path: string) {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  vi.useRealTimers();
  render(
    <RouterProvider
      router={createMemoryRouter(
        [{ path: "/module/:moduleId?", Component: ModulesPage }],
        { initialEntries: [path] },
      )}
    />,
  );
}

describe("Module & Noten kompakt (P5-12)", () => {
  it("opens only the current semester and sums up the others", async () => {
    await renderAt("/module");
    const user = userEvent.setup();
    const trigger = (name: RegExp) => screen.getByRole("button", { name });
    expect(trigger(/^1\. Fachsemester/)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(trigger(/^1\. Fachsemester/)).toHaveTextContent(
      "5 Module · 30 ECTS · alle bestanden",
    );
    expect(trigger(/^2\. Fachsemester/)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(trigger(/^2\. Fachsemester/)).toHaveTextContent(
      "5 Module · 30 ECTS · 3 bestanden, 2 offen",
    );
    expect(trigger(/^3\. Fachsemester/)).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(trigger(/^4\. Fachsemester/)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.getByRole("table", { name: "Module im 3. Fachsemester" }),
    ).toHaveTextContent("Statistik");
    await user.click(screen.getByRole("button", { name: "Alle aufklappen" }));
    expect(
      screen.getByRole("table", { name: "Module im 7. Fachsemester" }),
    ).toHaveTextContent("Bachelorarbeit");
    expect(screen.getByRole("link", { name: "Statistik" })).toHaveAttribute(
      "href",
      "/module/m-stat",
    );
  });
});

describe("Moduldetail: Kurs-Links und Notizen (P5-12)", () => {
  it("shows the Moodle handover as a hint and keeps an own address", async () => {
    await renderAt("/module/m-stat");
    const user = userEvent.setup();
    const links = screen.getByRole("region", { name: "Links zum Kurs" });
    await user.click(
      within(links).getByRole("button", { name: "Moodle-Kurs öffnen" }),
    );
    expect(links).toHaveTextContent(
      "Im echten Betrieb öffnet sich der Moodle-Kurs „Statistik“.",
    );
    await user.click(
      within(links).getByRole("button", { name: "Eigene Adresse festlegen" }),
    );
    await user.type(within(links).getByLabelText("Adresse"), "moodle.example");
    await user.click(
      within(links).getByRole("button", { name: "Adresse speichern" }),
    );
    expect(
      within(links).getByText(
        "Gib eine vollständige Adresse mit https:// ein.",
      ),
    ).toBeVisible();
    expect(within(links).getByLabelText("Adresse")).toHaveFocus();
    await user.clear(within(links).getByLabelText("Adresse"));
    await user.type(
      within(links).getByLabelText("Adresse"),
      "https://moodle.example/course/7",
    );
    await user.click(
      within(links).getByRole("button", { name: "Adresse speichern" }),
    );
    expect(
      within(links).getByRole("link", { name: /Moodle-Kurs öffnen/ }),
    ).toHaveAttribute("href", "https://moodle.example/course/7");
    expect(demoStore.getState().moodleUrls["m-stat"]).toBe(
      "https://moodle.example/course/7",
    );
  });

  it("adds, opens in a new tab and removes an own link", async () => {
    await renderAt("/module/m-stat");
    const user = userEvent.setup();
    const links = screen.getByRole("region", { name: "Links zum Kurs" });
    await user.click(
      within(links).getByRole("button", { name: "Link hinzufügen" }),
    );
    await user.click(
      within(links).getByRole("button", { name: "Link hinzufügen" }),
    );
    expect(within(links).getByText("Gib eine Bezeichnung ein.")).toBeVisible();
    await user.type(
      within(links).getByLabelText("Bezeichnung"),
      "Website Prof. Keller",
    );
    await user.type(
      within(links).getByLabelText("Adresse"),
      "https://example.org/keller",
    );
    await user.click(
      within(links).getByRole("button", { name: "Link hinzufügen" }),
    );
    const own = within(links).getByRole("link", {
      name: /Website Prof\. Keller/,
    });
    expect(own).toHaveAttribute("target", "_blank");
    expect(own).toHaveAttribute("rel", "noopener noreferrer");
    await user.click(
      within(links).getByRole("button", {
        name: "Website Prof. Keller entfernen",
      }),
    );
    expect(demoStore.getState().courseLinks).toEqual({});
  });

  it("saves notes per module while typing", async () => {
    await renderAt("/module/m-stat");
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText("Notizen zum Modul"),
      "Probeklausur rechnen",
    );
    expect(await screen.findByText("Gespeichert")).toBeVisible();
    expect(demoStore.getState().moduleNotes["m-stat"]).toBe(
      "Probeklausur rechnen",
    );
  });

  it("keeps a note typed right before leaving the page (P5-12 review)", async () => {
    await renderAt("/module/m-stat");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Notizen zum Modul"), "Blatt 12");
    // Leave before the save delay ends.
    cleanup();
    expect(demoStore.getState().moduleNotes["m-stat"]).toBe("Blatt 12");
  });
});
