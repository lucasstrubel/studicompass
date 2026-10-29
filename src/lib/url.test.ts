import { describe, expect, it } from "vitest";
import { parseWebUrl } from "./url";

describe("parseWebUrl", () => {
  it("accepts http and https addresses", () => {
    expect(parseWebUrl(" https://www.hs-mannheim.de/ ")).toBe(
      "https://www.hs-mannheim.de/",
    );
    expect(parseWebUrl("http://example.org/kurs?id=7")).toBe(
      "http://example.org/kurs?id=7",
    );
  });

  it("rejects empty input, other protocols and text without a scheme", () => {
    expect(parseWebUrl("")).toBeNull();
    expect(parseWebUrl("javascript:alert(1)")).toBeNull();
    expect(parseWebUrl("mailto:pruefungsamt@hochschule.example")).toBeNull();
    expect(parseWebUrl("moodle.hs-mannheim.de")).toBeNull();
  });
});
