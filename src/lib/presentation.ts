/** Message the app sends to the slides (`/praesentation/`) when a page key is pressed inside the demo iframe. */
export const PRESENTATION_MESSAGE = "studicompass:presentation-key";

const FORWARDED_KEYS = new Set(["PageDown", "PageUp"]);

/**
 * On the demo slide the keyboard focus sits inside the iframe, so a presenter clicker would scroll the app instead
 * of leaving the slide. In presentation mode (`?praesentation=1`, framed) the page keys go to the slides instead.
 * Installed once at startup, because the router drops the query parameter on the first navigation.
 */
export function installPresentationBridge(win: Window = window): void {
  const framed = win.parent !== win;
  const requested =
    new URLSearchParams(win.location.search).get("praesentation") === "1";
  if (!framed || !requested) return;

  win.addEventListener(
    "keydown",
    (event) => {
      if (!FORWARDED_KEYS.has(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      win.parent.postMessage(
        { type: PRESENTATION_MESSAGE, key: event.key },
        win.location.origin,
      );
    },
    { capture: true },
  );
}
