// Runs the Moodle integration tests and writes src/data/recordings/moodle.json (see ADR 0002).
import { spawnSync } from "node:child_process";

const result = spawnSync("npx vitest run --config vitest.moodle.config.ts", {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, MOODLE_RECORD: "1" },
});
process.exit(result.status ?? 1);
