import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { LATENCY_MS } from "@/config/demo";
import { MoodleSourceSection } from "./MoodleSourceSection";

beforeEach(async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  vi.useRealTimers();
});
afterEach(() => vi.unstubAllGlobals());

it("switches the Moodle channel to the recording and back", async () => {
  const user = userEvent.setup();
  render(<MoodleSourceSection />);
  expect(screen.getByRole("button", { name: "Beispieldaten" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await user.click(screen.getByRole("button", { name: "Aufzeichnung" }));
  await waitFor(() =>
    expect(
      demoStore
        .getState()
        .resources.moodle.data?.progress.find(
          (item) => item.moduleId === "m-pr2",
        )?.label,
    ).toBe("Abgaben 5/12"),
  );
  expect(screen.getByText(/einmal aufgezeichnet/)).toBeInTheDocument();
});

it("asks for address and access key, never for a password", async () => {
  const user = userEvent.setup();
  const { container } = render(<MoodleSourceSection />);
  await user.click(screen.getByRole("button", { name: "Eigenes Moodle" }));

  expect(screen.getByLabelText("Adresse des Moodle")).toHaveValue(
    "http://localhost:8080",
  );
  expect(
    screen.getByLabelText("Zugriffsschlüssel"),
  ).toHaveAccessibleDescription(/Dein Passwort wird nicht gebraucht/);
  expect(container.querySelector('input[type="password"]')).toBeNull();
  // Choosing the option alone changes nothing.
  expect(demoStore.getState().moodleSource).toBe("demo");
});

it("shows why a connection failed and keeps the example data", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ exception: "x", errorcode: "invalidtoken" }),
        ),
      ),
    ),
  );
  const user = userEvent.setup();
  render(<MoodleSourceSection />);
  await user.click(screen.getByRole("button", { name: "Eigenes Moodle" }));
  await user.type(screen.getByLabelText("Zugriffsschlüssel"), "wrong");
  await user.click(
    screen.getByRole("button", { name: "Mit Moodle verbinden" }),
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Der Zugriffsschlüssel ist ungültig oder abgelaufen.",
  );
  expect(demoStore.getState().moodleSource).toBe("demo");
});

it("names the connected site and disconnects again", async () => {
  const { default: recording } = await import("@/data/recordings/moodle.json");
  const calls = recording.calls as Record<string, unknown>;
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init: { body: URLSearchParams }) => {
      const body = new URLSearchParams(init.body);
      const name = body.get("wsfunction") ?? "";
      for (const key of ["wstoken", "moodlewsrestformat", "wsfunction"])
        body.delete(key);
      body.sort();
      return Promise.resolve(
        new Response(JSON.stringify(calls[`${name}?${body.toString()}`])),
      );
    }),
  );
  const user = userEvent.setup();
  render(<MoodleSourceSection />);
  await user.click(screen.getByRole("button", { name: "Eigenes Moodle" }));
  await user.type(screen.getByLabelText("Zugriffsschlüssel"), "key");
  await user.click(
    screen.getByRole("button", { name: "Mit Moodle verbinden" }),
  );

  expect(await screen.findByRole("status")).toHaveTextContent(
    "Verbunden mit Hochschul-Sandbox (StudiCompass) als Niklas Brandt",
  );
  expect(demoStore.getState().moodleSource).toBe("live");

  await user.click(screen.getByRole("button", { name: "Moodle trennen" }));
  await waitFor(() => expect(demoStore.getState().moodleSource).toBe("demo"));
  expect(screen.getByRole("button", { name: "Beispieldaten" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
