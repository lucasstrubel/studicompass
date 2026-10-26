import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_NOW } from "@/config/demo";
import { formatDate } from "@/lib/format";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("formatDate", () => {
  // Node applies a changed TZ immediately, so the test can move the "device" to another time zone.
  it.each(["Europe/Berlin", "Asia/Tokyo", "America/Los_Angeles"])(
    "shows the demo time as in KONZEPT §10.2, also on a device in %s",
    (deviceTimeZone) => {
      vi.stubEnv("TZ", deviceTimeZone);

      expect(formatDate(DEMO_NOW)).toBe("Mo, 25.01.2027");
    },
  );
});
