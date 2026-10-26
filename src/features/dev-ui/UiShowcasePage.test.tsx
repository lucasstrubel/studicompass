import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/app/providers";
import { THEME_STORAGE_KEY } from "@/config/demo";
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

  it("shows the colour tokens with every status and the type scale", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 2, name: "farben" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "typografie" }),
    ).toBeInTheDocument();
    for (const status of ["Im Plan", "Knapp", "Kritisch", "Info"]) {
      expect(screen.getByText(status)).toBeInTheDocument();
    }
  });

  it("switches the app theme on <html> and stores the choice", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(screen.getByRole("radio", { name: "Dunkel" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(screen.getByRole("radio", { name: "Hell" }));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    await user.click(screen.getByRole("radio", { name: "System" }));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });
});
