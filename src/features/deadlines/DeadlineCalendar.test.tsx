import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import type { AgendaItem } from "@/domain/types";
import { DeadlineCalendar } from "./DeadlineCalendar";

const items: AgendaItem[] = [
  {
    id: "stat",
    title: "Abmeldung Statistik",
    dueAt: "2027-01-26T23:59:00+01:00",
    type: "Abmeldung",
    origin: "channel",
    channel: "pos",
  },
];

it("P5-14: selects days with keyboard, crosses months, and returns to the demo day", async () => {
  const user = userEvent.setup();
  render(
    <DeadlineCalendar
      items={items}
      loading={false}
      incomplete={false}
      renderItem={(item) => <li key={item.id}>{item.title}</li>}
    />,
  );
  const today = screen.getByRole("button", { name: /Mo, 25.01.2027, heute/ });
  today.focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("button", { name: /Di, 26.01.2027/ })).toHaveFocus();
  expect(
    within(
      screen.getByRole("region", { name: "Einträge am ausgewählten Tag" }),
    ).getByText("Abmeldung Statistik"),
  ).toBeVisible();
  await user.keyboard("{PageDown}");
  expect(screen.getByRole("heading", { name: "Februar 2027" })).toBeVisible();
  expect(screen.getByRole("button", { name: /Fr, 26.02.2027/ })).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "Heute" }));
  expect(screen.getByRole("heading", { name: "Januar 2027" })).toBeVisible();
  expect(
    screen.getByRole("button", { name: /Mo, 25.01.2027, heute/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("P5-14: does not claim a selected day is empty while loading or missing channel data", () => {
  const { rerender } = render(
    <DeadlineCalendar
      items={[]}
      loading
      incomplete={false}
      renderItem={() => null}
    />,
  );
  expect(
    screen.queryByText("Keine Einträge an diesem Tag."),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Einträge am ausgewählten Tag" }),
  ).toHaveTextContent("Einträge werden geladen");
  rerender(
    <DeadlineCalendar
      items={[]}
      loading={false}
      incomplete
      renderItem={() => null}
    />,
  );
  expect(
    screen.queryByText("Keine Einträge an diesem Tag."),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Einträge am ausgewählten Tag" }),
  ).toHaveTextContent("Angaben unvollständig");
  rerender(
    <DeadlineCalendar
      items={[]}
      loading={false}
      incomplete={false}
      renderItem={() => null}
    />,
  );
  expect(screen.getByText("Keine Einträge an diesem Tag.")).toBeVisible();
});
