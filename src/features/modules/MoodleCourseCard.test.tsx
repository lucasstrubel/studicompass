import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";
import { MoodleCourseCard } from "./MoodleCourseCard";

beforeEach(async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  vi.useRealTimers();
});

it("shows only the progress line with the example data", () => {
  render(<MoodleCourseCard moduleId="m-pr2" />);
  expect(screen.getByText(/Übungsblätter 5\/12/)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Moodle abgleichen" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Kursinhalt/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Quelle/)).not.toBeInTheDocument();
});

it("lists the course, then shows what is new after a sync until it is marked as seen", async () => {
  const user = userEvent.setup();
  await demoStore.getState().setMoodleSource("recording");
  render(<MoodleCourseCard moduleId="m-pr2" />);

  expect(screen.getByText(/Abgaben 5\/12/)).toBeInTheDocument();
  expect(
    screen.getByText(
      "Seit dem letzten Abgleich hat sich in diesem Kurs nichts geändert.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Kursinhalt: 2 Dateien, 12 Abgaben"),
  ).toBeInTheDocument();
  expect(screen.getByText(/Aufzeichnung der Sandbox/)).toBeInTheDocument();
  // The recording has no site a link could lead to.
  expect(screen.queryByRole("link")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Moodle abgleichen" }));
  const news = await screen.findByRole("heading", { name: "Neu in Moodle" });
  const list = within(news.parentElement as HTMLElement);
  expect(
    list.getByText("Neue Datei: Vorlesung 03: Ausnahmen und Ein-/Ausgabe"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Kursinhalt: 3 Dateien, 12 Abgaben"),
  ).toBeInTheDocument();

  await user.click(
    list.getByRole("button", {
      name: "Gesehen: Vorlesung 03: Ausnahmen und Ein-/Ausgabe",
    }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("heading", { name: "Neu in Moodle" }),
    ).not.toBeInTheDocument(),
  );
});

it("shows submission state and grade of an assignment", async () => {
  await demoStore.getState().setMoodleSource("recording");
  await demoStore.getState().refreshMoodle();
  render(<MoodleCourseCard moduleId="m-web" />);
  expect(
    screen.getByText("Bewertung: Pflichtübung (8 von 10 Punkten)"),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/eingereicht · 8 von 10 Punkten/),
  ).toBeInTheDocument();
});

it("links to the connected Moodle only in live mode", async () => {
  const state = demoStore.getState();
  await state.setMoodleSource("recording");
  const data = demoStore.getState().resources.moodle.data;
  demoStore.setState({
    moodleSource: "live",
    moodleSite: {
      baseUrl: "http://localhost:8080",
      siteName: "Hochschul-Sandbox",
      userName: "Niklas Brandt",
    },
    resources: {
      ...demoStore.getState().resources,
      moodle: { status: "ready", data, updatedAt: null, error: null },
    },
  });
  render(<MoodleCourseCard moduleId="m-pr2" />);
  expect(
    screen.getByRole("link", { name: "Kurs in Moodle öffnen" }),
  ).toHaveAttribute(
    "href",
    expect.stringMatching(
      /^http:\/\/localhost:8080\/course\/view\.php\?id=\d+$/,
    ),
  );
  expect(screen.getByText(/Moodle – Hochschul-Sandbox/)).toBeInTheDocument();
});
