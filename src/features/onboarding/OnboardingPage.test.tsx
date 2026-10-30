import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { OnboardingPage } from "./OnboardingPage";
import { OverviewEntry } from "./OverviewEntry";
import { selectAcademicState, selectBasePlan } from "@/store/selectors";

afterEach(() => vi.useRealTimers());
it("P5-15: wartet auf POS, ohne früh eingegebene Namen zu überschreiben", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  render(
    <RouterProvider
      router={createMemoryRouter([{ path: "/", Component: OnboardingPage }])}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Mit Hochschul-Login anmelden (Demo)" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  fireEvent.change(screen.getByLabelText("Vorname"), {
    target: { value: "Alex" },
  });
  expect(screen.getByRole("button", { name: "Weiter" })).toBeDisabled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(LATENCY_MS);
    await ready;
  });
  expect(screen.getByLabelText("Vorname")).toHaveValue("Alex");
  expect(screen.getByLabelText("Nachname")).toHaveValue("Brandt");
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  expect(screen.getByRole("heading", { name: "Hinweis-Stil" })).toBeVisible();
});
async function prepare() {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
}

it.each([
  { saved: false, action: "Weiter" },
  { saved: true, action: "Überspringen" },
])(
  "P5-15: $action mit getrenntem POS und gültigem Profil (gespeichert: $saved)",
  async ({ saved, action }) => {
    vi.useFakeTimers();
    const ready = demoStore.getState().resetDemo();
    if (saved)
      demoStore.getState().saveProfile({
        firstName: "Alex",
        lastName: "Muster",
        goalRegularTime: true,
        jobHoursPerWeek: 15,
      });
    const router = createMemoryRouter(
      [
        { path: "/start", Component: OnboardingPage },
        { path: "/", element: <p>Übersicht</p> },
      ],
      { initialEntries: ["/start"] },
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Mit Hochschul-Login anmelden (Demo)",
      }),
    );
    // Disconnect before the first POS response: no cached data can fill the profile.
    fireEvent.click(screen.getByRole("checkbox", { name: "POS" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
      await ready;
    });
    expect(demoStore.getState().resources.pos).toMatchObject({
      status: "idle",
      data: null,
    });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    if (!saved) {
      fireEvent.change(screen.getByLabelText("Vorname"), {
        target: { value: "Alex" },
      });
      fireEvent.change(screen.getByLabelText("Nachname"), {
        target: { value: "Muster" },
      });
    }
    expect(screen.getByRole("button", { name: "Weiter" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Überspringen" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: action }));
    if (action === "Weiter") {
      expect(
        screen.getByRole("heading", { name: "Hinweis-Stil" }),
      ).toBeVisible();
      fireEvent.click(
        screen.getByRole("button", { name: "Einrichtung abschließen" }),
      );
    }
    expect(router.state.location.pathname).toBe("/");
    expect(demoStore.getState()).toMatchObject({
      onboardingComplete: true,
      connectedChannels: { pos: false },
      profileName: { firstName: "Alex", lastName: "Muster" },
    });
  },
);

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
  expect(
    screen.getByRole("checkbox", { name: /Danach die Produkt-Tour/ }),
  ).toBeChecked();
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

it("P5-15: Pflichtnamen prüfen; Überspringen behält Profil, Kanalwahl, Ziel, Nebenjob und Hinweis-Stil", async () => {
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
  fireEvent.click(screen.getByRole("checkbox", { name: "Moodle" }));
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  expect(screen.getByLabelText("Vorname")).toHaveValue("Niklas");
  fireEvent.change(screen.getByLabelText("Vorname"), {
    target: { value: " " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  expect(screen.getByLabelText("Vorname")).toHaveFocus();
  expect(screen.getByRole("heading", { name: "Dein Profil" })).toBeVisible();
  fireEvent.change(screen.getByLabelText("Vorname"), {
    target: { value: "Alex" },
  });
  fireEvent.change(screen.getByLabelText("Nachname"), {
    target: { value: "Muster" },
  });
  fireEvent.click(
    screen.getByLabelText("Mein Ziel: Abschluss in Regelstudienzeit"),
  );
  fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  fireEvent.click(screen.getByRole("radio", { name: "Sachlich" }));
  fireEvent.click(
    screen.getByRole("checkbox", { name: /Danach die Produkt-Tour/ }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
  expect(demoStore.getState()).toMatchObject({
    profileName: { firstName: "Alex", lastName: "Muster" },
    connectedChannels: { moodle: false },
    goalRegularTime: false,
    jobHoursPerWeek: 20,
    hintTone: "neutral",
    onboardingComplete: true,
  });
  expect(router.state.location.pathname).toBe("/");
  expect(router.state.location.search).toBe("");
});
