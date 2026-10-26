import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without Vitest globals, Testing Library does not clean up on its own.
// The theme lives on <html> and in localStorage, so it is reset after every test as well.
afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
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

// jsdom has no matchMedia; the ThemeProvider reads prefers-color-scheme. Default: light system theme.
// Tests that need a dark or changing system theme replace it with vi.spyOn(window, "matchMedia").
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
