import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { AssistantPage } from "./AssistantPage";
import { StrictMode } from "react";

afterEach(() => vi.useRealTimers());

it("P5-F02: sperrt Anschlussfragen während einer Antwort und gibt sie danach frei", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  render(
    <RouterProvider
      router={createMemoryRouter(
        [{ path: "/assistent", Component: AssistantPage }],
        { initialEntries: ["/assistent?frage=A-04"] },
      )}
    />,
  );
  await act(() => vi.advanceTimersByTimeAsync(800));
  const answer = within(screen.getByRole("article"));
  const followUp = answer.getByRole("button", {
    name: "Wie viele ECTS fehlen mir noch?",
  });
  fireEvent.click(followUp);
  expect(followUp).toBeDisabled();
  await act(() => vi.advanceTimersByTimeAsync(800));
  expect(followUp).toBeEnabled();
  expect(
    within(screen.getByRole("log")).getByRole("heading", {
      name: "Wie viele ECTS fehlen mir noch?",
    }),
  ).toBeInTheDocument();
});

it("P4-01: Kontext, Vorschlag und Sonderfall mit kopierbarem Entwurf", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  render(
    <RouterProvider
      router={createMemoryRouter(
        [{ path: "/assistent", Component: AssistantPage }],
        { initialEntries: ["/assistent?module=m-stat"] },
      )}
    />,
  );
  expect(screen.getByText("bezogen auf: Statistik")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Wie viele ECTS fehlen mir noch?" }),
  );
  await act(() => vi.advanceTimersByTimeAsync(800));
  expect(screen.getAllByText(/Du hast 48 von 210 ECTS/).length).toBeGreaterThan(
    0,
  );
  expect(
    screen.getByRole("heading", { name: "Zuständig" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Deine Frage"), {
    target: {
      value:
        "Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?",
    },
  });
  fireEvent.click(screen.getByRole("button", { name: "Frage stellen" }));
  await act(() => vi.advanceTimersByTimeAsync(800));
  fireEvent.click(screen.getByRole("button", { name: "Anfrage vorbereiten" }));
  expect(screen.getByLabelText("Dein Anfrageentwurf")).toHaveValue(
    demoStore.getState().resources.assistant.data!.fallback.draft,
  );
});

it("P4-01: Deep-Link antwortet auch bei StrictMode-Effektwiederholung", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  render(
    <StrictMode>
      <RouterProvider
        router={createMemoryRouter(
          [{ path: "/assistent", Component: AssistantPage }],
          { initialEntries: ["/assistent?frage=A-07"] },
        )}
      />
    </StrictMode>,
  );
  await act(() => vi.advanceTimersByTimeAsync(800));
  expect(screen.getByRole("log")).toHaveTextContent(
    "2,4 aus 8 bestandenen Modulen",
  );
});
