import { describe, expect, it, vi } from "vitest";
import {
  installPresentationBridge,
  PRESENTATION_MESSAGE,
} from "./presentation";

function fakeWindow(search: string, framed: boolean) {
  const target = new EventTarget();
  const postMessage = vi.fn();
  const fake: Record<string, unknown> = {
    location: { search, origin: "https://demo.example" },
    addEventListener: target.addEventListener.bind(target),
  };
  fake.parent = framed ? { postMessage } : fake;
  const win = fake as unknown as Window;
  const press = (key: string) => {
    const event = new KeyboardEvent("keydown", { key, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };
  return { win, postMessage, press };
}

describe("installPresentationBridge", () => {
  it("forwards the page keys to the slides and keeps them from the app", () => {
    const { win, postMessage, press } = fakeWindow("?praesentation=1", true);
    installPresentationBridge(win);

    const event = press("PageDown");
    press("PageUp");

    expect(event.defaultPrevented).toBe(true);
    expect(postMessage.mock.calls).toEqual([
      [{ type: PRESENTATION_MESSAGE, key: "PageDown" }, "https://demo.example"],
      [{ type: PRESENTATION_MESSAGE, key: "PageUp" }, "https://demo.example"],
    ]);
  });

  it("leaves every other key to the app", () => {
    const { win, postMessage, press } = fakeWindow("?praesentation=1", true);
    installPresentationBridge(win);

    expect(press("Enter").defaultPrevented).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it.each([
    ["without the parameter", "", true],
    ["with another value", "?praesentation=0", true],
    ["outside a frame", "?praesentation=1", false],
  ])("does nothing %s", (_case, search, framed) => {
    const { win, postMessage, press } = fakeWindow(search, framed);
    installPresentationBridge(win);

    expect(press("PageDown").defaultPrevented).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });
});
