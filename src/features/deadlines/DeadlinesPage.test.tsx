import { act, render, screen } from "@testing-library/react";
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
