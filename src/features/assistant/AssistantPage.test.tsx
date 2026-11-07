import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { AssistantPage } from "./AssistantPage";
import { preloadAssistantChat } from "./assistant-chat-module";
import { StrictMode } from "react";

beforeAll(() => preloadAssistantChat());
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
        { initialEntries: ["/assistent?module=m-pr2"] },
      )}
    />,
  );
  expect(screen.getByText("bezogen auf: Programmierung 2")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Wie viele ECTS fehlen mir noch?" }),
  );
  await act(() => vi.advanceTimersByTimeAsync(800));
  expect(screen.getAllByText(/Du hast 45 von 210 ECTS/).length).toBeGreaterThan(
    0,
  );
  expect(
    screen.getByRole("heading", { name: "Zuständig" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Deine Frage"), {
    target: {
      value:
        "Kann ich das Praxissemester im Ausland machen und Betriebswirtschaftslehre 3 im selben Semester schreiben?",
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
    "2,3 aus 8 bestandenen Modulen",
  );
});

it.each(["Sonderfall", "Freitext"])(
  "P5-15: Anfrageentwurf verwendet den Profilnamen (%s)",
  async (kind) => {
    vi.useFakeTimers();
    const ready = demoStore.getState().resetDemo();
    await vi.advanceTimersByTimeAsync(LATENCY_MS);
    await ready;
    demoStore.getState().saveProfile({
      firstName: "Alex",
      lastName: "Muster",
      goalRegularTime: true,
      jobHoursPerWeek: 15,
    });
    const question =
      kind === "Sonderfall"
        ? demoStore.getState().resources.assistant.data?.fallback.question
        : "Wie plane ich ein Urlaubssemester?";
    render(
      <RouterProvider
        router={createMemoryRouter(
          [{ path: "/assistent", Component: AssistantPage }],
          {
            initialEntries: [
              `/assistent?frage=${encodeURIComponent(question ?? "")}`,
            ],
          },
        )}
      />,
    );
    await act(() => vi.advanceTimersByTimeAsync(800));
    fireEvent.click(
      screen.getByRole("button", { name: "Anfrage vorbereiten" }),
    );
    const draft = screen.getByLabelText<HTMLTextAreaElement>(
      "Dein Anfrageentwurf",
    );
    expect(draft.value).toContain("Viele Grüße\nAlex Muster");
    expect(draft.value).not.toContain("Niklas Brandt");
  },
);
