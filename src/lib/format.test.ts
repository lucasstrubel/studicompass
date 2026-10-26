import { describe, expect, it } from "vitest";
import { DEMO_NOW } from "@/config/demo";
import { formatDate } from "@/lib/format";

describe("formatDate", () => {
  it("shows the demo time as in KONZEPT §10.2", () => {
    expect(formatDate(DEMO_NOW)).toBe("Mo, 25.01.2027");
  });
});
