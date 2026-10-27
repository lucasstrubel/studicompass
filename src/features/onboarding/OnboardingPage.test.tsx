import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { OnboardingPage } from "./OnboardingPage";
import { OverviewEntry } from "./OverviewEntry";
import { selectAcademicState, selectBasePlan } from "@/store/selectors";

afterEach(() => vi.useRealTimers());
async function prepare() {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
}
it("P4-06: Erststart und Überspringen setzen Standardwerte", async () => {
  await prepare();
  const router = createMemoryRouter(
    [
      { path: "/", Component: OverviewEntry },
      { path: "/start", Component: OnboardingPage },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
  await act(() => vi.advanceTimersByTimeAsync(0));
  expect(router.state.location.pathname).toBe("/start");
  fireEvent.click(
    screen.getByRole("button", { name: "Demo ohne Einrichtung starten" }),
  );
  expect(demoStore.getState().onboardingComplete).toBe(true);
  expect(demoStore.getState().jobHoursPerWeek).toBe(15);
});
it("P4-06: vier Schritte speichern Ziel, Nebenjob, Stil und Tourwahl", async () => {
  await prepare();
  const router = createMemoryRouter(
    [
      { path: "/start", Component: OnboardingPage },
      { path: "/", element: <p>Übersicht</p> },
    ],
    { initialEntries: ["/start"] },
  );
  render(<RouterProvider router={router} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" }),
  );
  expect(
    screen.getByRole("heading", { name: "Kanäle verbinden" }),
  ).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  fireEvent.click(
    screen.getByLabelText("Mein Ziel: Abschluss in Regelstudienzeit"),
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  fireEvent.click(screen.getByRole("radio", { name: "Sachlich" }));
  fireEvent.click(
    screen.getByRole("checkbox", { name: /Danach die Produkt-Tour/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Einrichtung abschließen" }),
  );
  expect(demoStore.getState()).toMatchObject({
    goalRegularTime: false,
    jobHoursPerWeek: 20,
    hintTone: "neutral",
    onboardingComplete: true,
  });
  expect(router.state.location.search).toBe("?tour=1");
  expect(
    selectAcademicState(demoStore.getState())?.student.jobHoursPerWeek,
  ).toBe(20);
  expect(
    selectBasePlan(demoStore.getState())?.consequences.some((item) =>
      item.detail.includes("20 Stunden"),
    ),
  ).toBe(true);
});
