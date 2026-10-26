import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "@/app/App";
import { APP_NAME } from "@/config/demo";

describe("App", () => {
  it("shows the app name as the main heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: APP_NAME }),
    ).toBeInTheDocument();
  });
});
