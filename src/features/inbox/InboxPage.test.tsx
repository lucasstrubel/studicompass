import { act, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { InboxPage } from "./InboxPage";

afterEach(() => vi.useRealTimers());
it("P4-02: Deep-Link, gelesen markieren und Filter", async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  const router = createMemoryRouter(
    [{ path: "/postfach", Component: InboxPage }],
    { initialEntries: ["/postfach?eintrag=i-02"] },
  );
  render(<RouterProvider router={router} />);
  expect(screen.getByRole("dialog")).toHaveTextContent("Raum A 210");
  fireEvent.click(
    screen.getByRole("button", { name: "Als gelesen markieren" }),
  );
  expect(demoStore.getState().readInboxIds).toContain("i-02");
  fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
  await act(() => vi.advanceTimersByTimeAsync(300));
  expect(router.state.location.search).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "POS" }));
  expect(
    screen.getByText("Prüfungsanmeldung WS 2026/27 bestätigt"),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("Raumänderung: Klausur Statistik am 27.01."),
  ).not.toBeInTheDocument();
});
