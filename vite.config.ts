/// <reference types="vitest/config" />
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { APP_NAME } from "./src/config/demo.ts";

// Fills %APP_NAME% in index.html, so the app name is defined only in src/config/demo.ts.
function appNameInHtml(): Plugin {
  return {
    name: "app-name-in-html",
    transformIndexHtml: (html) => html.replaceAll("%APP_NAME%", APP_NAME),
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), appNameInHtml()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
