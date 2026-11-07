import { describe, expect, it } from "vitest";
import { moduleTone, moduleToneStyle } from "./module-art";

describe("module colours", () => {
  it("gives each module of this semester its own colour", () => {
    const tones = ["m-pr2", "m-dm", "m-web", "m-bwl2", "m-wi3"].map(moduleTone);
    expect(new Set(tones).size).toBe(5);
  });

  it("keeps the colour of modules without an entry stable", () => {
    expect(moduleTone("m-web")).toBe(moduleTone("m-web"));
  });

  it("points the custom properties at the family tokens", () => {
    expect(moduleToneStyle("m-pr2")).toEqual({
      "--module-tone": "var(--tone-violet)",
      "--module-tone-soft": "var(--tone-violet-soft)",
    });
  });
});
