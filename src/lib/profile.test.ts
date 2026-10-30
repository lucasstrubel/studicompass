import { describe, expect, it } from "vitest";
import { parseProfileName } from "./profile";

describe("P5-15: Profilname", () => {
  it("trims names, keeps German characters and permits forty characters per name", () => {
    expect(
      parseProfileName({
        firstName: "  Jörg ",
        lastName: " Müller-Lüdenscheidt  ",
      }),
    ).toEqual({ firstName: "Jörg", lastName: "Müller-Lüdenscheidt" });
    expect(
      parseProfileName({ firstName: "A".repeat(40), lastName: "B".repeat(40) }),
    ).not.toBeNull();
  });
  it.each([
    null,
    {},
    [],
    "Niklas",
    { firstName: " ", lastName: "Brandt" },
    { firstName: "Niklas", lastName: "" },
    { firstName: "A".repeat(41), lastName: "Brandt" },
    { firstName: 42, lastName: "Brandt" },
  ])("rejects incomplete, empty, oversized or malformed input: %j", (value) => {
    expect(parseProfileName(value)).toBeNull();
  });
});
