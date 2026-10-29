import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without Vitest globals, Testing Library does not clean up on its own.
// The persisted demo state lives in localStorage, so it is reset after every test as well.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom has no ResizeObserver; Radix (Slider, ScrollArea) and Recharts need one.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

// jsdom does not scroll; React Router's ScrollRestoration calls window.scrollTo on every navigation.
window.scrollTo = () => undefined;

// jsdom has no matchMedia; the navigation menu asks for hover support. Default: no query matches.
// Tests that need a matching query replace it with vi.spyOn(window, "matchMedia").
window.matchMedia = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  addListener: () => undefined,
  removeListener: () => undefined,
  dispatchEvent: () => false,
});

// jsdom has no pointer capture; sonner calls it when a toast button is pressed.
for (const [name, value] of [
  ["setPointerCapture", () => undefined],
  ["releasePointerCapture", () => undefined],
  ["hasPointerCapture", () => false],
] as const)
  if (!(name in Element.prototype))
    Object.defineProperty(Element.prototype, name, { value });
