import { defineConfig } from "vitest/config";

// Integration tests of the bridge against the mail sandbox (infra/mail); not part of `npm run check`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["server/**/*.integration.ts"],
    testTimeout: 30_000,
  },
});
