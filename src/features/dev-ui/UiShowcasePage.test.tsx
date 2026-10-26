import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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

describe("UiShowcasePage", () => {
  it("has a section for every component from the roadmap", () => {
    render(<UiShowcasePage />);

    for (const name of REQUIRED_COMPONENTS) {
      expect(
        screen.getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      REQUIRED_COMPONENTS.length,
    );
  });

  it("switches the page and the portal root between light and dark", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<UiShowcasePage />);
    const container = screen.getByTestId("ui-showcase");

    expect(container).not.toHaveClass("dark");
    expect(document.body).not.toHaveClass("dark");

    await user.click(screen.getByRole("radio", { name: "Dunkel" }));
    expect(container).toHaveClass("dark");
    expect(document.body).toHaveClass("dark");

    await user.click(screen.getByRole("radio", { name: "Hell" }));
    expect(container).not.toHaveClass("dark");
    expect(document.body).not.toHaveClass("dark");

    await user.click(screen.getByRole("radio", { name: "Dunkel" }));
    unmount();
    expect(document.body).not.toHaveClass("dark");
  });
});
