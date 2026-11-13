import path from "node:path";
import { defineConfig } from "vitest/config";

// Integration tests against the Moodle sandbox (infra/moodle); not part of `npm run check`.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.integration.ts"],
    testTimeout: 30_000,
  },
});
