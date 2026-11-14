import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { demoStore } from "@/store/demo-store";
import { selectInbox } from "@/store/selectors";
import { DEMO_STORAGE_KEY, LATENCY_MS } from "@/config/demo";
import { MailSourceSection } from "./MailSourceSection";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const health = () => json({ ok: true, channels: { mail: true, pos: false } });
const mailbox = {
  messages: [
    {
      uid: 3,
      from: { name: "Studierendensekretariat", address: "s@example.org" },
      subject: "Rückmeldung zum Sommersemester",
      date: "2027-01-24T07:00:00.000Z",
      text: "Die Rückmeldefrist beginnt.",
      seen: false,
    },
  ],
};
/** A bridge on this server: answers the health check and the mailbox request. */
function stubBridge(mail: () => Response) {
  const fetch = vi.fn((url: string) =>
    Promise.resolve(url.endsWith("/health") ? health() : mail()),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

beforeEach(async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  vi.useRealTimers();
  demoStore.setState({ mailBridge: "unknown" });
});
afterEach(() => vi.unstubAllGlobals());

it("starts on the example mails and asks for nothing", () => {
  const { container } = render(<MailSourceSection />);
  expect(screen.getByRole("button", { name: "Beispieldaten" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(container.querySelector("input")).toBeNull();
});

it("explains that the public demo cannot connect a mailbox and shows no password field", async () => {
  // A static deployment answers every path with the page itself.
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response("<!doctype html>", {
          headers: { "Content-Type": "text/html" },
        }),
      ),
    ),
  );
  const user = userEvent.setup();
  const { container } = render(<MailSourceSection />);
  await user.click(screen.getByRole("button", { name: "Eigenes Postfach" }));

  expect(
    await screen.findByText(/Das geht nur in der lokalen Version/),
  ).toBeInTheDocument();
  expect(container.querySelector("input")).toBeNull();
});

it("connects the mailbox, names the account and forgets the password", async () => {
  const fetch = stubBridge(() => json(mailbox));
  const user = userEvent.setup();
  render(<MailSourceSection />);
  await user.click(screen.getByRole("button", { name: "Eigenes Postfach" }));
  await user.type(await screen.findByLabelText("Benutzerkennung"), "2212345");
  const password = screen.getByLabelText("Passwort");
  expect(password).toHaveAttribute("type", "password");
  expect(password).toHaveAccessibleDescription(/wird nirgends gespeichert/);
  await user.type(password, "geheim-4711");
  await user.click(screen.getByRole("button", { name: "Postfach verbinden" }));

  expect(await screen.findByText("Verbunden als")).toHaveTextContent(
    "Verbunden als 2212345",
  );
  expect(screen.queryByLabelText("Passwort")).toBeNull();
  // One login only: the mails of the check answer the first load.
  expect(
    fetch.mock.calls.filter(([url]) => url.endsWith("/mail")),
  ).toHaveLength(1);
  await waitFor(() =>
    expect(
      selectInbox(demoStore.getState())
        .filter((item) => item.channel === "mail")
        .map((item) => item.subject),
    ).toEqual(["Rückmeldung zum Sommersemester"]),
  );
  expect(localStorage.getItem(DEMO_STORAGE_KEY) ?? "").not.toContain(
    "geheim-4711",
  );

  await user.click(screen.getByRole("button", { name: "Postfach trennen" }));
  await waitFor(() => expect(demoStore.getState().mailAccount).toBeNull());
  expect(screen.getByRole("button", { name: "Beispieldaten" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("shows why the login failed, clears the password and keeps the example mails", async () => {
  stubBridge(() => json({ error: "auth" }, 401));
  const user = userEvent.setup();
  render(<MailSourceSection />);
  await user.click(screen.getByRole("button", { name: "Eigenes Postfach" }));
  await user.type(await screen.findByLabelText("Benutzerkennung"), "2212345");
  await user.type(screen.getByLabelText("Passwort"), "falsch");
  await user.click(screen.getByRole("button", { name: "Postfach verbinden" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Die Anmeldung am Mailserver wurde abgelehnt.",
  );
  expect(screen.getByLabelText("Passwort")).toHaveValue("");
  expect(screen.getByLabelText("Benutzerkennung")).toHaveValue("2212345");
  expect(demoStore.getState().mailAccount).toBeNull();
});
