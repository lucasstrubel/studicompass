import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/app/providers";
import { COMMON_COMPONENTS } from "@/features/dev-ui/common-components";
import { UiShowcasePage } from "@/features/dev-ui/UiShowcasePage";

// Component list from ROADMAP P1-02 (kept separate from the page on purpose).
const REQUIRED_COMPONENTS = [
  "button",
  "card",
  "badge",
  "dialog",
  "alert-dialog",
  "sheet",
  "tabs",
  "tooltip",
  "popover",
  "progress",
  "separator",
  "select",
  "switch",
  "slider",
  "skeleton",
  "sonner",
  "dropdown-menu",
  "avatar",
  "scroll-area",
  "accordion",
  "toggle-group",
  "chart",
];

function renderPage() {
  return render(
    <AppProviders>
      <UiShowcasePage />
    </AppProviders>,
  );
}

describe("UiShowcasePage", () => {
  it("has a section for every component from the roadmap", () => {
    renderPage();
    const components = screen.getByTestId("ui-components");

    for (const name of REQUIRED_COMPONENTS) {
      expect(
        within(components).getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
    expect(
      within(components).getAllByRole("heading", { level: 2 }),
    ).toHaveLength(REQUIRED_COMPONENTS.length);
  });

  it("shows every shared component from KONZEPT §12.4 with all its states", () => {
    renderPage();
    const common = screen.getByTestId("ui-common");

    for (const name of COMMON_COMPONENTS) {
      expect(
        within(common).getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
    for (const status of ["Im Plan", "Knapp", "Kritisch"]) {
      expect(within(common).getByText(status)).toBeInTheDocument();
    }
    for (const channel of ["POS", "Moodle", "Mail", "Website"]) {
      expect(within(common).getByText(channel)).toBeInTheDocument();
    }
    expect(within(common).getByText("noch 1 Tag, 4 Std.")).toBeInTheDocument();
    expect(within(common).getByText("abgelaufen")).toBeInTheDocument();
    for (const severity of ["Kritisch:", "Knapp:", "Info:"]) {
      expect(within(common).getByText(severity)).toBeInTheDocument();
    }
    expect(within(common).getAllByText("Beispiel").length).toBeGreaterThan(0);
    expect(within(common).getByText("Simulation")).toBeInTheDocument();
    expect(within(common).getByRole("alert")).toBeInTheDocument();
    expect(
      within(common).getByRole("button", { name: "Moodle erneut laden" }),
    ).toBeInTheDocument();
    // The page keeps a single h1; the PageHeader preview uses an h2.
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the colour tokens with every status and the type scale", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 2, name: "farben" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "typografie" }),
    ).toBeInTheDocument();
    const colours = screen.getByRole("region", { name: "farben" });
    for (const status of ["Im Plan", "Knapp", "Kritisch", "Info"]) {
      expect(within(colours).getByText(status)).toBeInTheDocument();
    }
  });
});
