import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProviders } from "@/app/providers";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";
import { DeadlinesPage } from "./DeadlinesPage";

afterEach(() => vi.useRealTimers());

it("P5-F01: meldet beim Erstladen keine leeren Fristengruppen", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  render(
    <RouterProvider
      router={createMemoryRouter([{ path: "/", Component: DeadlinesPage }])}
    />,
  );
  expect(
    screen.queryAllByText("Keine Fristen in diesem Zeitraum."),
  ).toHaveLength(0);
  expect(
    screen.getByRole("status", { name: "Fristen werden geladen" }),
  ).toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(LATENCY_MS);
    await ready;
  });
  expect(
    screen.queryByRole("status", { name: "Fristen werden geladen" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Abmeldung Statistik" }),
  ).toBeInTheDocument();
});

it("P5-F01: unterscheidet fehlende Kanaldaten von einer vollständig leeren Liste", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  const resources = demoStore.getState().resources;
  demoStore.setState({
    connectedChannels: {
      pos: false,
      moodle: false,
      mail: false,
      website: false,
    },
    resources: {
      ...resources,
      pos: { ...resources.pos, status: "idle", data: null },
      moodle: { ...resources.moodle, status: "idle", data: null },
      mail: { ...resources.mail, status: "idle", data: null },
      website: { ...resources.website, status: "idle", data: null },
    },
  });
  render(
    <RouterProvider
      router={createMemoryRouter([{ path: "/", Component: DeadlinesPage }])}
    />,
  );
  expect(
    screen.getByText(/Die Fristen sind unvollständig/),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("status", { name: "Fristen werden geladen" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("Keine anstehenden Fristen"),
  ).not.toBeInTheDocument();
  act(() => {
    demoStore.setState({
      resources: {
        ...resources,
        pos: {
          ...resources.pos,
          data: resources.pos.data && { ...resources.pos.data, deadlines: [] },
        },
        moodle: {
          ...resources.moodle,
          data: resources.moodle.data && {
            ...resources.moodle.data,
            deadlines: [],
          },
        },
        mail: {
          ...resources.mail,
          data: resources.mail.data && {
            ...resources.mail.data,
            deadlines: [],
          },
        },
        website: {
          ...resources.website,
          data: resources.website.data && {
            ...resources.website.data,
            deadlines: [],
          },
        },
      },
    });
  });
  expect(screen.getByText("Keine anstehenden Fristen")).toBeInTheDocument();
  expect(
    screen.queryByText(/Die Fristen sind unvollständig/),
  ).not.toBeInTheDocument();
});

it("P5-13: legt einen eigenen Termin an, prüft das Datum und löscht ihn mit Rückgängig", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  vi.useRealTimers();
  const user = userEvent.setup();
  render(
    <AppProviders>
      <RouterProvider
        router={createMemoryRouter([{ path: "/", Component: DeadlinesPage }])}
      />
    </AppProviders>,
  );
  await user.click(screen.getByRole("button", { name: "Termin hinzufügen" }));
  const dialog = screen.getByRole("dialog", { name: "Termin hinzufügen" });
  await user.click(within(dialog).getByRole("button", { name: "Speichern" }));
  expect(within(dialog).getByText("Gib einen Titel ein.")).toBeVisible();
  expect(within(dialog).getByLabelText("Titel")).toHaveFocus();
  await user.type(
    within(dialog).getByLabelText("Titel"),
    "Lerngruppe Statistik",
  );
  await user.clear(within(dialog).getByLabelText("Datum"));
  await user.type(within(dialog).getByLabelText("Datum"), "2027-01-20");
  await user.click(within(dialog).getByRole("button", { name: "Speichern" }));
  expect(
    within(dialog).getByText(/liegt vor dem heutigen Demo-Datum/),
  ).toBeVisible();
  await user.clear(within(dialog).getByLabelText("Datum"));
  await user.type(within(dialog).getByLabelText("Datum"), "2027-01-26");
  await user.type(within(dialog).getByLabelText("Uhrzeit (optional)"), "10:00");
  await user.selectOptions(within(dialog).getByLabelText("Art"), "Termin");
  await user.click(within(dialog).getByRole("button", { name: "Speichern" }));

  // The keyboard focus returns to the button that opened the dialog (P5-13 review).
  await vi.waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Termin hinzufügen" }),
    ).toHaveFocus(),
  );
  const week = screen.getByRole("region", { name: "Diese Woche" });
  const entry = within(week)
    .getByRole("heading", { name: "Lerngruppe Statistik" })
    .closest("li");
  expect(entry).toHaveTextContent("Eigener Eintrag");
  expect(entry).toHaveTextContent("Termin");
  expect(entry).toHaveTextContent("Quelle: Von dir eingetragen");
  expect(entry).not.toHaveTextContent("Beispiel");

  await user.click(
    within(entry as HTMLElement).getByRole("button", {
      name: "Lerngruppe Statistik löschen",
    }),
  );
  expect(demoStore.getState().personalDeadlines).toEqual([]);
  await user.click(await screen.findByRole("button", { name: "Rückgängig" }));
  expect(demoStore.getState().personalDeadlines).toHaveLength(1);
});
