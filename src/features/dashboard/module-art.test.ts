import { describe, expect, it } from "vitest";
import { moduleTone, moduleToneStyle } from "./module-art";

describe("module colours (KONZEPT §12.2 Farbfamilie)", () => {
  it("gives each module of this semester its own colour", () => {
    const tones = ["m-stat", "m-db", "m-se1", "m-gpm", "m-mkt"].map(moduleTone);
    expect(new Set(tones).size).toBe(5);
  });

  it("gives the three recent grades different colours", () => {
    const tones = ["m-klr", "m-bsrn", "m-mathe2"].map(moduleTone);
    expect(new Set(tones).size).toBe(3);
  });

  it("keeps the colour of modules without an entry stable", () => {
    expect(moduleTone("m-web")).toBe(moduleTone("m-web"));
  });

  it("points the custom properties at the family tokens", () => {
    expect(moduleToneStyle("m-stat")).toEqual({
      "--module-tone": "var(--tone-violet)",
      "--module-tone-soft": "var(--tone-violet-soft)",
    });
  });
});
