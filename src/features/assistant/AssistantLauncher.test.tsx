import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";
import { LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";

beforeEach(async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  demoStore.getState().completeOnboarding();
});
afterEach(() => vi.useRealTimers());

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

/** jsdom does not scroll: set the position and report it like the browser would. */
function scrollWindowTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  fireEvent.scroll(window);
}
afterEach(() => {
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});

const launcher = () => screen.getByRole("button", { name: "Assistent öffnen" });
const assistantWindow = () => screen.getByRole("dialog", { name: "Assistent" });

describe("assistant button and window (P5-06)", () => {
  it("introduces the assistant with a speech bubble that can be hidden", () => {
    renderApp("/");
    expect(launcher()).toBeInTheDocument();
    const hint = screen.getByRole("button", {
      name: /Hallo Niklas! Fragen zur Prüfungsordnung\? Ich antworte mit Quelle\./,
    });
    expect(launcher()).toHaveAccessibleDescription(hint.textContent ?? "");

    fireEvent.click(screen.getByRole("button", { name: "Hinweis ausblenden" }));
    expect(
      screen.queryByText(/Ich antworte mit Quelle/),
    ).not.toBeInTheDocument();
    expect(launcher()).toBeInTheDocument();
  });

  it("retires the speech bubble on a deliberate scroll, not on a small jump (P5-07)", () => {
    renderApp("/");
    scrollWindowTo(30);
    expect(screen.getByText(/Ich antworte mit Quelle/)).toBeInTheDocument();
    scrollWindowTo(80);
    expect(
      screen.queryByText(/Ich antworte mit Quelle/),
    ).not.toBeInTheDocument();
  });

  it("shows the speech bubble once per demo state (P5-07)", async () => {
    renderApp("/");
    fireEvent.click(screen.getByRole("button", { name: "Hinweis ausblenden" }));
    // A reload mounts the shell again; the bubble stays away.
    cleanup();
    const router = renderApp("/");
    expect(
      screen.queryByText(/Ich antworte mit Quelle/),
    ).not.toBeInTheDocument();
    // "Demo zurücksetzen" leads through the onboarding; the next session starts with the bubble.
    await act(async () => {
      const reset = demoStore.getState().resetDemo();
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
      await reset;
    });
    expect(router.state.location.pathname).toBe("/start");
    act(() => demoStore.getState().completeOnboarding());
    await act(() => router.navigate("/"));
    expect(screen.getByText(/Ich antworte mit Quelle/)).toBeInTheDocument();
  });

  it("is not shown on the assistant page itself", () => {
    renderApp("/assistent");
    expect(
      screen.queryByRole("button", { name: "Assistent öffnen" }),
    ).not.toBeInTheDocument();
  });

  it("answers in place with sources and keeps the conversation after closing", async () => {
    renderApp("/entscheidung/e-stat-ws26");
    fireEvent.click(launcher());
    const panel = within(assistantWindow());
    expect(panel.getByRole("textbox", { name: "Deine Frage" })).toHaveFocus();

    fireEvent.click(
      panel.getByRole("button", { name: "Wie viele ECTS fehlen mir noch?" }),
    );
    await act(() => vi.advanceTimersByTimeAsync(800));
    const log = within(panel.getByRole("log"));
    expect(log.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Wie viele ECTS fehlen mir noch?",
    );
    expect(log.getByRole("list", { name: "Quellen" })).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Radix returns the focus in a zero-delay timeout.
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(launcher()).toHaveFocus();

    fireEvent.click(launcher());
    expect(within(assistantWindow()).getByRole("log")).toHaveTextContent(
      "Wie viele ECTS fehlen mir noch?",
    );
  });

  it("keeps a question that is still being answered when the window closes", async () => {
    renderApp("/");
    fireEvent.click(launcher());
    fireEvent.click(
      within(assistantWindow()).getByRole("button", {
        name: "Wie viele ECTS fehlen mir noch?",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Assistent schließen" }),
    );
    await act(() => vi.advanceTimersByTimeAsync(800));

    fireEvent.click(launcher());
    expect(within(assistantWindow()).getByRole("log")).toHaveTextContent(
      "Wie viele ECTS fehlen mir noch?",
    );
  });

  it("closes on navigation and continues the conversation on the assistant page", async () => {
    const router = renderApp("/");
    fireEvent.click(launcher());
    fireEvent.change(
      within(assistantWindow()).getByRole("textbox", { name: "Deine Frage" }),
      { target: { value: "Wann wird Statistik angeboten?" } },
    );
    fireEvent.click(
      within(assistantWindow()).getByRole("button", { name: "Frage stellen" }),
    );
    await act(() => vi.advanceTimersByTimeAsync(800));

    fireEvent.click(
      within(assistantWindow()).getByRole("link", {
        name: "Auf der Assistent-Seite öffnen",
      }),
    );
    expect(router.state.location.pathname).toBe("/assistent");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("log")).toHaveTextContent(
      "Wann wird Statistik angeboten?",
    );

    await act(() => router.navigate("/"));
    expect(launcher()).toBeInTheDocument();
    expect(
      screen.queryByText(/Ich antworte mit Quelle/),
    ).not.toBeInTheDocument();
  });
});
