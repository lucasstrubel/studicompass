import { describe, expect, it } from "vitest";
import { compoundParts } from "./compound-breaks";

describe("compoundParts", () => {
  it("splits long module titles at their compound joints", () => {
    expect(compoundParts("Grundlagen der Wirtschaftsinformatik")).toEqual([
      "Grundlagen der Wirtschafts",
      "informatik",
    ]);
    expect(compoundParts("Geschäftsprozessmanagement")).toEqual([
      "Geschäfts",
      "prozess",
      "management",
    ]);
    expect(compoundParts("Wirtschaftsprivatrecht")).toEqual([
      "Wirtschafts",
      "privat",
      "recht",
    ]);
    expect(compoundParts("Unternehmensplanspiel")).toEqual([
      "Unternehmens",
      "planspiel",
    ]);
  });

  it("leaves short titles and word starts alone", () => {
    expect(compoundParts("Statistik")).toEqual(["Statistik"]);
    expect(compoundParts("Modul Recht")).toEqual(["Modul Recht"]);
    expect(compoundParts("Praxissemester").join("")).toBe("Praxissemester");
  });
});
