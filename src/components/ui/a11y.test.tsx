import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it } from "vitest";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Accessibility fixes on top of the generated shadcn wrappers (Codex review P1-02).
describe("shadcn wrapper accessibility", () => {
  it("Popover names its dialog with PopoverTitle", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Quelle öffnen</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Modulhandbuch Wirtschaftsinformatik</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Quelle öffnen" }));

    expect(
      screen.getByRole("dialog", {
        name: "Modulhandbuch Wirtschaftsinformatik",
      }),
    ).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("Modulhandbuch Wirtschaftsinformatik").id,
    );
  });

  it("Popover without a title has no aria-labelledby", () => {
    render(
      <Popover defaultOpen>
        <PopoverContent>Quellenangaben</PopoverContent>
      </Popover>,
    );

    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-labelledby");
  });

  it("Popover removes aria-labelledby when its title is removed", () => {
    const { rerender } = render(
      <Popover defaultOpen>
        <PopoverContent>
          <PopoverTitle>Quellenangaben</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );

    expect(
      screen.getByRole("dialog", { name: "Quellenangaben" }),
    ).toBeInTheDocument();
    rerender(
      <Popover defaultOpen>
        <PopoverContent>Quellenangaben</PopoverContent>
      </Popover>,
    );

    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-labelledby");
  });

  it("Popover gives an explicit aria-label priority over its title", () => {
    render(
      <Popover defaultOpen>
        <PopoverContent aria-label="Quelle">
          <PopoverTitle>Modulhandbuch Wirtschaftsinformatik</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );

    expect(screen.getByRole("dialog", { name: "Quelle" })).not.toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("Popover gives an explicit aria-labelledby priority over its title and aria-label", () => {
    render(
      <>
        <span id="source-label">Quelle</span>
        <Popover defaultOpen>
          <PopoverContent aria-labelledby="source-label" aria-label="Beleg">
            <PopoverTitle>Modulhandbuch Wirtschaftsinformatik</PopoverTitle>
          </PopoverContent>
        </Popover>
      </>,
    );

    expect(screen.getByRole("dialog", { name: "Quelle" })).toHaveAttribute(
      "aria-labelledby",
      "source-label",
    );
  });

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

// The registry versions label these in English (decision of 26.10.2026, ROADMAP P1-04).
describe("German labels", () => {
  it("Sheet names its close button Schließen", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent aria-describedby={undefined}>
          <SheetTitle>Mehr</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(
      screen.getByRole("button", { name: "Schließen" }),
    ).toBeInTheDocument();
  });

  it("Dialog names both close buttons Schließen", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Anfrage vorbereiten</DialogTitle>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getAllByRole("button", { name: "Schließen" })).toHaveLength(
      2,
    );
  });

  it("Toaster names its region Meldungen and the close button of a toast", async () => {
    render(<Toaster closeButton />);

    expect(
      screen.getByRole("region", { name: "Meldungen alt+T" }),
    ).toBeInTheDocument();
    act(() => {
      toast("Statistik: Abmeldung simuliert");
    });
    expect(
      await screen.findByRole("button", { name: "Meldung schließen" }),
    ).toBeInTheDocument();
  });
});
