import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_STORAGE_KEY, LATENCY_MS } from "@/config/demo";
import { createMockServices } from "@/services/mock";
import { createDemoStore, demoStore } from "@/store/demo-store";
import { CourseworkCard } from "./CourseworkCard";
import { CourseworkOverview } from "./CourseworkOverview";

beforeEach(async () => {
  vi.useFakeTimers();
  const ready = demoStore.getState().resetDemo();
  await vi.advanceTimersByTimeAsync(LATENCY_MS);
  await ready;
  vi.useRealTimers();
});
const coursework = () => demoStore.getState().coursework;
const card = (moduleId = "m-wi3", title = "Wirtschaftsinformatik 3") =>
  render(<CourseworkCard moduleId={moduleId} title={title} />);

describe("planning a Prüfungsvorleistung by hand", () => {
  it("stores planned effort and steps and shows them", async () => {
    const user = userEvent.setup();
    card();
    await user.click(
      screen.getByRole("button", { name: "Prüfungsvorleistung eintragen" }),
    );
    await user.type(
      screen.getByLabelText("Was ist zu erbringen?"),
      "Pflichtübung 5",
    );
    await user.type(
      screen.getByLabelText("Geplanter Aufwand in Stunden (optional)"),
      "2,5",
    );
    await user.click(screen.getByRole("button", { name: "Eintragen" }));
    expect(coursework()[0]).toMatchObject({
      title: "Pflichtübung 5",
      effortHours: 2.5,
      status: "open",
    });
    expect(screen.getByText("2,5 Std. geplant")).toBeInTheDocument();

    await user.click(screen.getByText("Teilschritte planen"));
    const step = screen.getByLabelText("Neuer Teilschritt für Pflichtübung 5");
    await user.type(step, "Aufgabe 1 lösen{Enter}");
    await user.type(step, "Aufgabe 2 lösen{Enter}");
    await user.click(screen.getByRole("checkbox", { name: "Aufgabe 1 lösen" }));
    expect(screen.getByText("Teilschritte 1/2")).toBeInTheDocument();
    expect(coursework()[0].steps).toMatchObject([
      { title: "Aufgabe 1 lösen", done: true },
      { title: "Aufgabe 2 lösen", done: false },
    ]);

    await user.click(
      screen.getByRole("button", {
        name: "Teilschritt Aufgabe 2 lösen entfernen",
      }),
    );
    expect(coursework()[0].steps).toHaveLength(1);
  });

  it("refuses an effort that is not a sensible number of hours", async () => {
    const user = userEvent.setup();
    card();
    await user.click(
      screen.getByRole("button", { name: "Prüfungsvorleistung eintragen" }),
    );
    await user.type(screen.getByLabelText("Was ist zu erbringen?"), "Referat");
    const effort = screen.getByLabelText(
      "Geplanter Aufwand in Stunden (optional)",
    );
    await user.type(effort, "viel");
    await user.click(screen.getByRole("button", { name: "Eintragen" }));
    expect(effort).toHaveAccessibleDescription(/Stunden zwischen 0,5 und 500/);
    expect(effort).toHaveFocus();
    expect(coursework()).toEqual([]);
  });

  it("keeps the plan across a reload and drops stored steps of another shape", () => {
    demoStore.getState().saveCoursework({
      moduleId: "m-wi3",
      title: "Pflichtübung 5",
      status: "open",
      effortHours: 3,
      moodleRef: "6/cm40",
      steps: [{ id: "s1", title: "Lesen", done: true }],
    });
    const stored = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? "") as {
      state: { coursework: Record<string, unknown>[] };
    };
    expect(stored.state.coursework[0]).toMatchObject({
      effortHours: 3,
      moodleRef: "6/cm40",
      steps: [{ id: "s1", title: "Lesen", done: true }],
    });

    stored.state.coursework[0].steps = [{ id: "s1", title: "" }, "x", null];
    stored.state.coursework[0].effortHours = -4;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(stored));
    const reloaded = createDemoStore(createMockServices({ latencyMs: 0 }));
    expect(reloaded.getState().coursework[0]).toEqual({
      id: expect.any(String) as string,
      moduleId: "m-wi3",
      title: "Pflichtübung 5",
      status: "open",
      moodleRef: "6/cm40",
    });
  });
});

describe("taking assignments over from Moodle", () => {
  it("offers nothing with the example data, which has no course contents", () => {
    card();
    expect(
      screen.queryByRole("button", { name: "Aus Moodle übernehmen" }),
    ).not.toBeInTheDocument();
  });

  it("imports the chosen assignments with their Moodle state and due date", async () => {
    const user = userEvent.setup();
    await demoStore.getState().setMoodleSource("recording");
    card();
    await user.click(
      screen.getByRole("button", { name: "Aus Moodle übernehmen" }),
    );
    const group = screen.getByRole("group", {
      name: "Welche Abgaben aus Moodle zählen als Prüfungsvorleistung?",
    });
    expect(within(group).getAllByRole("checkbox")).toHaveLength(6);
    await user.click(
      within(group).getByRole("checkbox", { name: /^Pflichtübung 6/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "5 Abgaben übernehmen" }),
    );

    expect(
      coursework().map((item) => [item.title, item.status, item.dueAt]),
    ).toEqual([
      ["Pflichtübung 1", "done", "2026-11-15"],
      ["Pflichtübung 2", "done", "2026-12-04"],
      ["Pflichtübung 3", "done", "2026-12-23"],
      ["Pflichtübung 4", "done", "2027-01-11"],
      ["Pflichtübung 5", "open", "2027-01-31"],
    ]);
    expect(screen.getByText(/4 von 5 erbracht/)).toHaveTextContent(
      "nächste Frist So, 31.01.2027",
    );
    expect(screen.getByText(/Zulassung offen/)).toBeInTheDocument();
    expect(screen.getAllByText(/Moodle: eingereicht/).length).toBeGreaterThan(
      0,
    );

    // Only the one left out is offered again.
    await user.click(
      screen.getByRole("button", { name: "Aus Moodle übernehmen" }),
    );
    expect(
      screen.getAllByRole("checkbox", { name: /^Pflichtübung/ }),
    ).toHaveLength(1);
  });

  it("suggests the state from Moodle and leaves the decision to the student", async () => {
    const user = userEvent.setup();
    await demoStore.getState().setMoodleSource("recording");
    demoStore.getState().importMoodleCoursework(
      "m-wi3",
      demoStore
        .getState()
        .resources.moodle.data?.courses.find((c) => c.moduleId === "m-wi3")
        ?.items.map((item) => item.id) ?? [],
    );
    const first = coursework()[0];
    demoStore.getState().saveCoursework({ ...first, status: "open" });
    card();

    expect(
      screen.getByText("In Moodle ist die Abgabe eingereicht."),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Pflichtübung 1 als erbracht übernehmen",
      }),
    );
    expect(coursework()[0].status).toBe("done");
    expect(
      screen.queryByText("In Moodle ist die Abgabe eingereicht."),
    ).not.toBeInTheDocument();
  });

  it("ignores unknown ids and never imports an assignment twice", async () => {
    await demoStore.getState().setMoodleSource("recording");
    const ids =
      demoStore
        .getState()
        .resources.moodle.data?.courses.find((c) => c.moduleId === "m-web")
        ?.items.map((item) => item.id) ?? [];
    const { importMoodleCoursework } = demoStore.getState();
    expect(importMoodleCoursework("m-web", [...ids, "cm99999"])).toBe(1);
    expect(importMoodleCoursework("m-web", ids)).toBe(0);
    expect(importMoodleCoursework("m-unknown", ids)).toBe(0);
    expect(coursework()).toHaveLength(1);
  });
});

describe("overview of the semester", () => {
  const overview = () =>
    render(
      <MemoryRouter>
        <CourseworkOverview />
      </MemoryRouter>,
    );

  it("stays hidden while nothing is entered", () => {
    const { container } = overview();
    expect(container).toBeEmptyDOMElement();
  });

  it("lists every module with entries, its admission and the planned hours", () => {
    const { saveCoursework } = demoStore.getState();
    saveCoursework({
      moduleId: "m-wi3",
      title: "Pflichtübung 5",
      status: "open",
      effortHours: 4,
      dueAt: "2027-01-31",
    });
    saveCoursework({
      moduleId: "m-wi3",
      title: "Pflichtübung 4",
      status: "done",
    });
    saveCoursework({
      moduleId: "m-pr2",
      title: "8 von 12 Übungsblättern",
      status: "failed",
      effortHours: 20,
    });
    overview();

    expect(screen.getAllByRole("link")).toHaveLength(2);
    const wi3 = within(
      screen
        .getByRole("link", { name: "Wirtschaftsinformatik 3" })
        .closest("li") as HTMLElement,
    );
    expect(wi3.getByText(/1 von 2 erbracht/)).toHaveTextContent(
      "1 von 2 erbracht · 4 Std. für offene geplant · nächste Frist So, 31.01.2027",
    );
    expect(wi3.getByText("Zulassung offen")).toBeInTheDocument();
    expect(screen.getByText("Nicht zugelassen")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Programmierung 2" }),
    ).toHaveAttribute("href", "/module/m-pr2");
    // Hours of an entry that is no longer open do not count.
    expect(
      screen.getByText(/insgesamt 4 Std\. eingeplant, neben 15 Std\. Nebenjob/),
    ).toBeInTheDocument();
  });
});
