import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without Vitest globals, Testing Library does not clean up on its own.
afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver; Radix (Slider, ScrollArea) and Recharts need one.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
