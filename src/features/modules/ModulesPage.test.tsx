import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
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
