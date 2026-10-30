import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { SettingsPage } from "./SettingsPage";
import { NotificationsButton } from "@/features/notifications/NotificationsButton";

afterEach(() => vi.useRealTimers());
it("P4-05: Hinweis-Stil, Benachrichtigungstypen und Gelesenstatus", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter([
          {
            path: "/",
            element: (
              <>
                <SettingsPage />
                <NotificationsButton />
              </>
            ),
          },
        ])}
      />
    </AppProviders>,
  );
  fireEvent.click(screen.getByRole("radio", { name: "Sachlich" }));
  expect(demoStore.getState().hintTone).toBe("neutral");
  fireEvent.click(screen.getByRole("checkbox", { name: "Postfach" }));
  expect(
    screen.getByRole("button", { name: "Benachrichtigungen, 3 ungelesen" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Benachrichtigungen, 3 ungelesen" }),
  );
  expect(screen.getByRole("dialog")).toHaveTextContent(
    "Die Abmeldefrist für Statistik endet morgen",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Alle als gelesen markieren" }),
  );
  expect(demoStore.getState().readNotificationIds).toHaveLength(4);
  await act(() => vi.advanceTimersByTimeAsync(300));
});

it("P5-15: Profil bearbeiten fokussiert den Abschnitt, prüft Namen und speichert alle Profilfelder", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter(
          [{ path: "/einstellungen", Component: SettingsPage }],
          { initialEntries: ["/einstellungen#profil"] },
        )}
      />
    </AppProviders>,
  );
  expect(screen.getByRole("region", { name: "Profil" })).toHaveFocus();
  expect(screen.getByLabelText("Vorname")).toHaveValue("Niklas");
  fireEvent.change(screen.getByLabelText("Vorname"), {
    target: { value: " " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Profil speichern" }));
  expect(screen.getByLabelText("Vorname")).toHaveFocus();
  expect(demoStore.getState().profileName).toBeNull();
  fireEvent.change(screen.getByLabelText("Vorname"), {
    target: { value: "Alex" },
  });
  fireEvent.change(screen.getByLabelText("Nachname"), {
    target: { value: "Muster" },
  });
  fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Mein Ziel: Abschluss in Regelstudienzeit",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Profil speichern" }));
  expect(demoStore.getState()).toMatchObject({
    profileName: { firstName: "Alex", lastName: "Muster" },
    jobHoursPerWeek: 20,
    goalRegularTime: false,
  });
});
