import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";
import { OfficesPage } from "./OfficesPage";

afterEach(() => vi.useRealTimers());

it("P5-15: loads offices, focuses the linked office and links matching questions to the assistant", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  const router = createMemoryRouter(
    [
      { path: "/anlaufstellen", Component: OfficesPage },
      { path: "/assistent", element: <p>Assistent</p> },
    ],
    { initialEntries: ["/anlaufstellen#o-sb"] },
  );
  render(<RouterProvider router={router} />);
  expect(
    screen.getByRole("status", { name: "Anlaufstellen werden geladen" }),
  ).toBeVisible();
  expect(
    screen.queryByText("Keine Anlaufstellen vorhanden"),
  ).not.toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(LATENCY_MS);
    await ready;
  });
  const office = screen.getByRole("region", { name: "Studienberatung" });
  expect(office).toHaveFocus();
  expect(office).toHaveTextContent("Studieren mit Nebenjob");
  expect(
    within(office).getByRole("link", {
      name: "studienberatung@hochschule.example",
    }),
  ).toHaveAttribute("href", "mailto:studienberatung@hochschule.example");
  expect(
    within(office).getByRole("list", { name: "Quellen" }),
  ).toHaveTextContent("Beispiel");
  const exams = screen.getByRole("region", { name: "Prüfungsamt" });
  fireEvent.click(
    within(exams).getByRole("link", {
      name: "Wie viele Versuche habe ich für eine Prüfung?",
    }),
  );
  expect(router.state.location.pathname + router.state.location.search).toBe(
    "/assistent?frage=A-04",
  );
});

it("P5-15: distinguishes failed rules from an empty office list", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  const resources = demoStore.getState().resources;
  const data = resources.rules.data;
  if (!data) throw new Error("Regelwerk fehlt im Testaufbau");
  demoStore.setState({
    resources: {
      ...resources,
      rules: {
        ...resources.rules,
        data: null,
        status: "error",
        error: "Regelwerk nicht erreichbar",
      },
    },
  });
  render(
    <RouterProvider
      router={createMemoryRouter([{ path: "/", Component: OfficesPage }])}
    />,
  );
  expect(
    screen.getByText("Regelwerk konnte nicht geladen werden"),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Regelwerk erneut laden" }),
  ).toBeVisible();
  expect(
    screen.queryByText("Keine Anlaufstellen vorhanden"),
  ).not.toBeInTheDocument();
  await act(() =>
    demoStore.setState({
      resources: {
        ...resources,
        rules: { ...resources.rules, data: { ...data, offices: [] } },
      },
    }),
  );
  expect(screen.getByText("Keine Anlaufstellen vorhanden")).toBeVisible();
});
