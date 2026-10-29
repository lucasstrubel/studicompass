import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { CitationList } from "@/components/common/CitationList";
import { ConsequenceItem } from "@/components/common/ConsequenceItem";
import { Countdown } from "@/components/common/Countdown";
import { DemoBadge } from "@/components/common/DemoBadge";
import { EctsProgress } from "@/components/common/EctsProgress";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { DEMO_NOW } from "@/config/demo";
import type { Citation, Consequence } from "@/domain/types";
import { COMMON_COMPONENTS } from "./common-components";

type CommonComponent = (typeof COMMON_COMPONENTS)[number];

// Showcase values from INHALTE §4, §7 and KONZEPT §10.4 (presentation only, no store access).
const CITATIONS: Citation[] = [
  {
    document: "Modulhandbuch Wirtschaftsinformatik, Modul Statistik",
    summary: "Statistik wird nur im Wintersemester angeboten.",
    verified: false,
  },
  {
    document: "SPO Wirtschaftsinformatik",
    section: "§ 9 Abs. 2",
    summary:
      "Von einer angemeldeten Prüfung kannst du dich bis zum Vortag, 23:59 Uhr, abmelden.",
    asOf: "2026-10-01",
    verified: true,
  },
];

const CONSEQUENCES: Consequence[] = [
  {
    id: "internship-shift",
    severity: "critical",
    title: "Praxissemester verschiebt sich auf SS 2028",
    detail:
      "Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind. Statistik gibt es erst wieder im WS 2027/28.",
    ruleId: "DR-6",
  },
  {
    id: "foundation-limit",
    severity: "tight",
    title: "Grenze offener Grundstudiums-Prüfungen erreicht",
    detail:
      "Nach diesem Semester wären 3 Prüfungen des Grundstudiums offen – mehr dürfen es für Prüfungen des Hauptstudiums nicht sein.",
    ruleId: "DR-7",
  },
  {
    id: "ects-difference",
    severity: "info",
    title: "6 ECTS weniger am Ende des Semesters",
    detail: "Zu deinen ECTS zählen nur bestandene Prüfungen.",
    ruleId: "DR-1",
  },
];

const IN_ONE_DAY = "2027-01-26T23:59:00+01:00";
const EXPIRED = new Date(DEMO_NOW.getTime() - 60_000).toISOString();

function Section({
  name,
  children,
}: {
  name: CommonComponent;
  children: ReactNode;
}) {
  const headingId = `ui-common-${name}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-5"
    >
      <h2 id={headingId} className="font-mono text-sm text-muted-foreground">
        {name}
      </h2>
      {children}
    </section>
  );
}

/** Every state of the shared components for the developer route /_ui. */
export function CommonComponentsShowcase() {
  return (
    <div
      data-testid="ui-common"
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      <Section name="StatusBadge">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="onTrack" />
          <StatusBadge status="tight" />
          <StatusBadge status="critical" />
        </div>
      </Section>

      <Section name="ChannelBadge">
        <div className="flex flex-wrap gap-2">
          <ChannelBadge channel="pos" />
          <ChannelBadge channel="moodle" />
          <ChannelBadge channel="mail" />
          <ChannelBadge channel="website" />
        </div>
      </Section>

      <Section name="Countdown">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
          <dt className="text-muted-foreground">Abmeldung Statistik</dt>
          <dd>
            <Countdown until={IN_ONE_DAY} />
          </dd>
          <dt className="text-muted-foreground">Abgelaufene Frist</dt>
          <dd>
            <Countdown until={EXPIRED} />
          </dd>
        </dl>
      </Section>

      <Section name="EctsProgress">
        <EctsProgress earned={48} total={210} target={60} />
        <EctsProgress
          earned={78}
          total={210}
          target={90}
          label="Prognose Ende WS 2026/27"
        />
      </Section>

      <Section name="ConsequenceItem">
        <div className="space-y-2">
          {CONSEQUENCES.map((consequence) => (
            <ConsequenceItem
              key={consequence.id}
              consequence={consequence}
              citations={CITATIONS.slice(0, 1)}
            />
          ))}
        </div>
      </Section>

      <Section name="CitationList">
        <CitationList citations={CITATIONS} />
        <div className="rounded-xl border bg-card p-4">
          <p className="text-body">Karte mit Quellen-Fußzeile (P5-09)</p>
          <CitationList variant="footer" citations={CITATIONS} />
        </div>
      </Section>

      <Section name="DemoBadge">
        <div className="flex flex-wrap gap-2">
          <DemoBadge />
          <DemoBadge variant="simulation" />
        </div>
      </Section>

      <Section name="EmptyState">
        <EmptyState
          title="Keine ungelesenen Einträge"
          description="Alles gelesen – neue Nachrichten aus POS, Moodle, Mail und Website erscheinen hier."
          action={
            <Button variant="outline" size="sm">
              Alle Einträge zeigen
            </Button>
          }
        />
      </Section>

      <Section name="ErrorState">
        <ErrorState
          title="Moodle konnte nicht geladen werden"
          message="Die Beispieldaten konnten nicht geladen werden. Versuch es erneut."
          updatedAt={DEMO_NOW.toISOString()}
          onRetry={() => undefined}
          retryLabel="Moodle erneut laden"
        />
      </Section>

      <Section name="PageHeader">
        <PageHeader
          headingLevel={2}
          title="Statistik – antreten oder abmelden?"
          meta={<DemoBadge />}
          description="Vergleiche beide Wege, bevor du dich entscheidest."
          actions={
            <Button variant="outline">
              Zur Übersicht
              <ArrowRight aria-hidden="true" />
            </Button>
          }
          className="mb-0"
        />
      </Section>
    </div>
  );
}
