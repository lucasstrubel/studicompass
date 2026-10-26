import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import { DESKTOP_QUERY } from "@/components/layout/navigation";
import type { RouteHandle } from "@/components/layout/route-handle";

afterEach(() => {
  vi.restoreAllMocks();
});

function renderShell(handle: RouteHandle) {
  const router = createMemoryRouter([
    { Component: AppShell, children: [{ index: true, element: null, handle }] },
  ]);
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

// Replaces the matchMedia stub from setupTests: only the desktop breakpoint matches.
function mockDesktopViewport() {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query === DESKTOP_QUERY,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

function NextDeadline() {
  return <p>Abmeldung Statistik</p>;
}

describe("AppShell", () => {
  it("shows the right column for a page that fills it", () => {
    renderShell({ title: "Übersicht", rightRail: NextDeadline });

    expect(
      within(screen.getByRole("complementary")).getByText(
        "Abmeldung Statistik",
      ),
    ).toBeInTheDocument();
  });

  it("leaves the right column out otherwise", () => {
    renderShell({ title: "Studienverlauf" });

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("names the icons of the icon bar in tooltips below 1280 px", async () => {
    const user = userEvent.setup();
    renderShell({ title: "Übersicht" });

    await user.tab(); // skip link
    await user.tab(); // Übersicht

    expect(
      await screen.findByRole("tooltip", { name: "Übersicht" }),
    ).toBeInTheDocument();
  });

  it("shows no tooltips from 1280 px, where the labels are visible", async () => {
    const user = userEvent.setup();
    mockDesktopViewport();
    renderShell({ title: "Übersicht" });

    await user.tab(); // skip link
    await user.tab(); // Übersicht

    expect(
      within(screen.getByTestId("sidebar")).getByRole("link", {
        name: "Übersicht",
      }),
    ).toHaveFocus();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
