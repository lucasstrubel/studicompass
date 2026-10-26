import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FLAGS, LATENCY_MS } from "@/config/demo";
import { demoStore } from "@/store/demo-store";
import { DemoDataPanel } from "./DemoDataPanel";

beforeEach(async () => {
  vi.useFakeTimers();
  FLAGS.simulateErrors = false;
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
});
afterEach(() => {
  FLAGS.simulateErrors = false;
  vi.useRealTimers();
});

describe("developer channel observation", () => {
  it("shows loading, channel-specific errors and successful recovery through labelled controls", async () => {
    render(<DemoDataPanel />);
    expect(screen.getAllByText("Geladen")).toHaveLength(6);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Ladefehler simulieren" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Alle Daten neu laden" }),
    );
    expect(screen.getAllByText("Wird geladen …")).toHaveLength(6);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
    });
    expect(screen.getAllByText("Fehler beim Laden")).toHaveLength(6);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Ladefehler simulieren" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Erneut laden: POS" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LATENCY_MS);
    });
    expect(screen.getAllByText("Geladen")).toHaveLength(1);
    expect(screen.getAllByText("Fehler beim Laden")).toHaveLength(5);
    expect(screen.getByRole("list")).toHaveAttribute("aria-live", "polite");
  });
});
