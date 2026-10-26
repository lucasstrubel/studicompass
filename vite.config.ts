/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { APP_NAME, THEME_STORAGE_KEY } from "./src/config/demo.ts";

// Fills %APP_NAME% and %THEME_STORAGE_KEY% in index.html, so both are defined only in src/config/demo.ts.
function demoConfigInHtml(): Plugin {
  return {
    name: "demo-config-in-html",
    transformIndexHtml: (html) =>
      html
        .replaceAll("%APP_NAME%", APP_NAME)
        .replaceAll("%THEME_STORAGE_KEY%", THEME_STORAGE_KEY),
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), demoConfigInHtml()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    // Vitest empties every .css import, ?raw included; the token test reads globals.css?raw as text.
    // Vite and @tailwindcss/vite skip ?raw requests, so the file content arrives unchanged.
    css: { include: [/[?&]raw\b/] },
  },
});
