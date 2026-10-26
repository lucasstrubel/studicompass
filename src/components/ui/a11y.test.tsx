import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Accessibility fixes on top of the generated shadcn wrappers (Codex review P1-02).
describe("shadcn wrapper accessibility", () => {
  it("Progress exposes its value to assistive technology", () => {
    render(<Progress value={42} aria-label="Übungsblätter" />);

    const bar = screen.getByRole("progressbar", { name: "Übungsblätter" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("data-state", "loading");
  });

  it("Slider puts the accessible name on the focusable thumb", () => {
    render(
      <>
        <span id="job-label">Nebenjob</span>
        <Slider defaultValue={[15]} max={20} aria-labelledby="job-label" />
      </>,
    );

    expect(screen.getByRole("slider", { name: "Nebenjob" })).toHaveAttribute(
      "aria-valuenow",
      "15",
    );
  });

  it("vertical Tabs navigate with the up and down arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="exams" orientation="vertical">
        <TabsList>
          <TabsTrigger value="exams">Prüfungen</TabsTrigger>
          <TabsTrigger value="deadlines">Fristen</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    await user.click(screen.getByRole("tab", { name: "Prüfungen" }));
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Fristen" })).toHaveFocus();
  });

  it("vertical ToggleGroup navigates only with the up and down arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single" orientation="vertical" aria-label="Zeitraum">
        <ToggleGroupItem value="week">Woche</ToggleGroupItem>
        <ToggleGroupItem value="month">Monat</ToggleGroupItem>
      </ToggleGroup>,
    );
    const week = screen.getByRole("radio", { name: "Woche" });

    await user.click(week);
    await user.keyboard("{ArrowRight}");
    expect(week).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Monat" })).toHaveFocus();
  });
});
