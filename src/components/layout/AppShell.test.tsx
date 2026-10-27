import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import type { RouteHandle } from "@/components/layout/route-handle";
import { APP_NAME } from "@/config/demo";

function renderShell(handle: RouteHandle = { title: "Übersicht" }) {
  const router = createMemoryRouter([
    {
      Component: AppShell,
      children: [
        { index: true, element: <p>Dashboard</p>, handle },
        {
          path: "postfach",
          element: <p>Postfachinhalt</p>,
          handle: { title: "Postfach" },
        },
      ],
    },
  ]);
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function hoverSupport() {
  vi.useFakeTimers();
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query === "(hover: hover) and (pointer: fine)",
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
  class TestPointerEvent extends MouseEvent {
    readonly pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  vi.stubGlobal("PointerEvent", TestPointerEvent);
}
const trigger = () => screen.getByRole("button", { name: "Navigation öffnen" });
const fullMenu = () => screen.getByRole("dialog", { name: APP_NAME });
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("AppShell", () => {
  it("fills the right-column slot only when supplied", () => {
    renderShell({
      title: "Übersicht",
      rightRail: () => <p>Abmeldung Statistik</p>,
    });
    expect(
      within(screen.getByRole("complementary")).getByText(
        "Abmeldung Statistik",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
  it("leaves out its h1 when the page renders its own header", () => {
    renderShell({ title: "Folgen-Check", ownHeader: true });
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("omits an empty right column", () => {
    renderShell();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
});

describe("hamburger disclosure", () => {
  it("opens at 150 ms and stays open while crossing to the menu; closes after 250 ms outside", () => {
    hoverSupport();
    renderShell();
    fireEvent.pointerOver(trigger(), { pointerType: "mouse" });
    advance(149);
    expect(
      screen.queryByRole("navigation", { name: "Alle Bereiche" }),
    ).not.toBeInTheDocument();
    advance(1);
    const navigation = screen.getByRole("navigation", {
      name: "Alle Bereiche",
    });
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerOut(trigger(), {
      relatedTarget: navigation,
      pointerType: "mouse",
    });
    fireEvent.pointerOver(navigation, {
      relatedTarget: trigger(),
      pointerType: "mouse",
    });
    advance(300);
    expect(navigation).toBeInTheDocument();
    fireEvent.pointerOut(navigation, {
      relatedTarget: document.body,
      pointerType: "mouse",
    });
    advance(249);
    expect(navigation).toBeInTheDocument();
    advance(1);
    expect(
      screen.queryByRole("navigation", { name: "Alle Bereiche" }),
    ).not.toBeInTheDocument();
  });
  it("cancels an opening when the pointer leaves early and never previews on touch", () => {
    hoverSupport();
    renderShell();
    fireEvent.pointerOver(trigger(), { pointerType: "mouse" });
    fireEvent.pointerOut(trigger(), {
      relatedTarget: document.body,
      pointerType: "mouse",
    });
    advance(300);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    fireEvent.pointerOver(trigger(), { pointerType: "touch" });
    advance(300);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
  it("pins a hover preview on click and keeps it open after pointer exit", () => {
    hoverSupport();
    renderShell();
    fireEvent.pointerOver(trigger(), { pointerType: "mouse" });
    advance(150);
    const hamburger = trigger();
    fireEvent.click(hamburger);
    expect(fullMenu()).toBeInTheDocument();
    fireEvent.pointerOut(hamburger, {
      relatedTarget: document.body,
      pointerType: "mouse",
    });
    advance(300);
    expect(fullMenu()).toBeInTheDocument();
  });
  it("dismisses the hover preview with outside click or Escape", () => {
    hoverSupport();
    renderShell();
    fireEvent.pointerOver(trigger(), { pointerType: "mouse" });
    advance(150);
    fireEvent.pointerDown(document.body);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    fireEvent.pointerOut(trigger(), { relatedTarget: document.body });
    fireEvent.pointerOver(trigger(), { pointerType: "mouse" });
    advance(150);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
  it("opens by keyboard, traps focus and restores it after Escape or the close button", async () => {
    const user = userEvent.setup();
    renderShell();
    trigger().focus();
    await user.keyboard("{Enter}");
    const close = within(fullMenu()).getByRole("button", {
      name: "Navigation einklappen",
    });
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(
      within(fullMenu()).getByRole("link", { name: "Einstellungen" }),
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    await user.click(trigger());
    await user.click(
      within(fullMenu()).getByRole("button", { name: "Navigation schließen" }),
    );
    expect(trigger()).toHaveFocus();
  });
  it("dismisses the pinned sheet on an outside pointer action", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(trigger());
    const overlay = document.querySelector('[data-slot="sheet-overlay"]');
    expect(overlay).not.toBeNull();
    if (overlay) await user.click(overlay);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("closes for menu selection and external route navigation", async () => {
    const user = userEvent.setup();
    const router = renderShell();
    await user.click(trigger());
    await user.click(
      within(fullMenu()).getByRole("link", { name: "Postfach" }),
    );
    expect(router.state.location.pathname).toBe("/postfach");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(trigger());
    await act(() => router.navigate("/"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
