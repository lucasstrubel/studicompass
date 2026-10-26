import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/app/App";
import { APP_NAME } from "@/config/demo";

describe("App", () => {
  it("opens on the Übersicht inside the app shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Übersicht" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Navigation öffnen" }),
    ).toBeInTheDocument();
    expect(document.title).toBe(`Übersicht · ${APP_NAME}`);
  });
});
