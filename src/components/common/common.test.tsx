import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Consequence } from "@/domain/types";
import { ChannelBadge } from "./ChannelBadge";
import { CitationList } from "./CitationList";
import { ConsequenceItem } from "./ConsequenceItem";
import { Countdown } from "./Countdown";
import { EctsProgress } from "./EctsProgress";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["onTrack", "Im Plan"],
    ["tight", "Knapp"],
    ["critical", "Kritisch"],
  ] as const)("shows %s as icon and text, not colour alone", (status, text) => {
    const { container } = render(<StatusBadge status={status} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

describe("ChannelBadge", () => {
  it.each([
    ["pos", "POS"],
    ["moodle", "Moodle"],
    ["mail", "Mail"],
    ["website", "Website"],
  ] as const)("names the channel %s", (channel, text) => {
    render(<ChannelBadge channel={channel} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe("Countdown", () => {
  it("counts from DEMO_NOW (KONZEPT §10.2)", () => {
    render(<Countdown until="2027-01-26T23:59:00+01:00" />);
    const time = screen.getByText("noch 1 Tag, 4 Std.");
    expect(time).toHaveAttribute("datetime", "2027-01-26T23:59:00+01:00");
    expect(time).toHaveAttribute("title", "Di, 26.01.2027, 23:59");
  });
});

describe("EctsProgress", () => {
  it("exposes earned, total and target to assistive technology", () => {
    render(<EctsProgress earned={48} total={210} target={60} />);
    const bar = screen.getByRole("progressbar", { name: "Erreichte ECTS" });
    expect(bar).toHaveAttribute("aria-valuenow", "48");
    expect(bar).toHaveAttribute("aria-valuemax", "210");
    expect(bar).toHaveAttribute("aria-valuetext", "48 von 210 ECTS, Soll 60");
  });
});

describe("CitationList", () => {
  it("shows one compact footer line with every source and its Beispiel label (P5-09)", () => {
    render(
      <CitationList
        variant="footer"
        citations={[
          {
            document: "SPO Wirtschaftsinformatik",
            summary: "",
            verified: false,
          },
          {
            document: "Modulhandbuch",
            section: "Modul Statistik",
            summary: "",
            verified: true,
          },
          {
            document: "SPO Wirtschaftsinformatik",
            summary: "",
            verified: false,
          },
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Quellen" });
    expect(list.parentElement).toHaveTextContent(
      "Quellen: SPO WirtschaftsinformatikBeispiel · Modulhandbuch, Modul Statistik",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("labels unverified sources as Beispiel and shows checked sections", () => {
    render(
      <CitationList
        citations={[
          {
            document: "SPO Wirtschaftsinformatik",
            summary: "",
            verified: false,
          },
          {
            document: "Modulhandbuch",
            section: "Modul Statistik",
            summary: "",
            verified: true,
          },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(
      "Quelle: SPO WirtschaftsinformatikBeispiel",
    );
    expect(items[1]).toHaveTextContent(
      "Quelle: Modulhandbuch, Modul Statistik",
    );
    expect(items[1]).not.toHaveTextContent("Beispiel");
  });
});

describe("ConsequenceItem", () => {
  const consequence: Consequence = {
    id: "internship-shift",
    severity: "critical",
    title: "Praxissemester verschiebt sich",
    detail: "Alle Module des Grundstudiums müssen bestanden sein.",
    ruleId: "DR-6",
  };

  it("names the severity in text and opens Warum? with its source", async () => {
    const user = userEvent.setup();
    render(
      <ConsequenceItem
        consequence={consequence}
        citations={[
          {
            document: "SPO Wirtschaftsinformatik",
            summary: "",
            verified: false,
          },
        ]}
      />,
    );
    expect(screen.getByText("Kritisch:")).toBeInTheDocument();
    const why = screen.getByRole("button", {
      name: /^Warum\?.*Praxissemester verschiebt sich$/,
    });
    expect(why).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(consequence.detail)).not.toBeVisible();

    await user.click(why);
    expect(why).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(consequence.detail)).toBeVisible();
    expect(screen.getByRole("list", { name: "Quellen" })).toBeVisible();
  });
});

describe("ErrorState", () => {
  it("announces the error and offers a labelled retry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorState
        message="Die Beispieldaten konnten nicht geladen werden."
        updatedAt="2027-01-25T19:30:00+01:00"
        onRetry={onRetry}
        retryLabel="Moodle erneut laden"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Zuletzt aktualisiert: Mo, 25.01.2027, 19:30",
    );
    await user.click(
      screen.getByRole("button", { name: "Moodle erneut laden" }),
    );
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("PageHeader", () => {
  it("renders the page's h1 by default", () => {
    render(<PageHeader title="Studienverlauf" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Studienverlauf" }),
    ).toBeInTheDocument();
  });
});

describe("CitationList (duplicates)", () => {
  it("lists a document cited by several rules only once", () => {
    const spo = {
      document: "SPO Wirtschaftsinformatik",
      summary: "",
      verified: false,
    };
    render(
      <CitationList citations={[spo, { ...spo, summary: "andere Regel" }]} />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
