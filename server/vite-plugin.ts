import type { Plugin } from "vite";
import { createBridge } from "./bridge.ts";

/** Path the app calls; same origin as the page, so the Content Security Policy needs no exception. */
export const BRIDGE_PATH = "/api/bridge";

/**
 * Serves the bridge from the local dev and preview server. The static deployment has no bridge:
 * there the same path answers with the page itself, which the app reads as "not available".
 */
export function bridge(): Plugin {
  return {
    name: "studicompass-bridge",
    configureServer(server) {
      server.middlewares.use(BRIDGE_PATH, createBridge());
    },
    configurePreviewServer(server) {
      server.middlewares.use(BRIDGE_PATH, createBridge());
    },
  };
}
