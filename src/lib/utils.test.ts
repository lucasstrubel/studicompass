import { describe, expect, it } from "vitest";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps text colours next to the type scale (KONZEPT §12.3)", () => {
    expect(cn("text-primary-foreground text-meta")).toBe(
      "text-primary-foreground text-meta",
    );
    expect(cn("text-meta", "text-status-tight-foreground")).toBe(
      "text-meta text-status-tight-foreground",
    );
  });

  it("still lets a later type step replace an earlier one", () => {
    expect(cn("text-body", "text-meta")).toBe("text-meta");
    expect(cn("text-sm", "text-card-title")).toBe("text-card-title");
  });
});

describe("buttonVariants", () => {
  it("keeps the primary text colour on small buttons", () => {
    for (const size of ["sm", "xs"] as const) {
      const classes = buttonVariants({ size }).split(" ");
      expect(classes).toContain("text-primary-foreground");
      expect(classes).toContain("text-meta");
    }
  });
});
