/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { APP_NAME } from "./src/config/demo.ts";

// Fills %APP_NAME% in index.html, so the name is defined only in src/config/demo.ts.
function demoConfigInHtml(): Plugin {
  return {
    name: "demo-config-in-html",
    transformIndexHtml: (html) => html.replaceAll("%APP_NAME%", APP_NAME),
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
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](?:react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    // Vitest empties every .css import, ?raw included; the token test reads globals.css?raw as text.
    // Vite and @tailwindcss/vite skip ?raw requests, so the file content arrives unchanged.
    css: { include: [/[?&]raw\b/] },
    // Full-app tests render the whole shell; under parallel load 5 s was too tight (P3-04).
    testTimeout: 15_000,
  },
});
