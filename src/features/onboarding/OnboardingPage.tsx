import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { CitationList } from "@/components/common/CitationList";
import { APP_NAME, DEMO_CURRENT_TERM } from "@/config/demo";
import { semesterNumber } from "@/domain/terms";
import { useDemoStore } from "@/store/use-demo-store";
import { CHANNELS } from "@/services/types";

const STEPS = [
  "Willkommen",
  "Kanäle verbinden",
  "Dein Studium",
  "Hinweis-Stil",
];

export function OnboardingPage() {
  const state = useDemoStore((state) => state);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(state.goalRegularTime);
  const [hours, setHours] = useState(state.jobHoursPerWeek);
  const [tour, setTour] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    title.current?.focus();
  }, [step]);
  function finish(skip = false) {
    if (skip) {
      state.setHintTone("direct");
      for (const channel of CHANNELS)
        if (!state.connectedChannels[channel])
          void state.setChannelConnected(channel, true);
    }
    state.completeOnboarding({
      goalRegularTime: skip ? true : goal,
      jobHoursPerWeek: skip ? 15 : hours,
    });
    void navigate(!skip && tour ? "/?tour=1" : "/", { replace: true });
  }
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-5 px-4 py-8">
      <p className="text-card-title">{APP_NAME}</p>
      <h1 className="text-page-title">Onboarding</h1>
      <p role="status" className="text-meta text-muted-foreground tabular-nums">
        Schritt {step + 1} von 4
      </p>
      <h2 ref={title} tabIndex={-1} className="text-section-title">
        {STEPS[step]}
      </h2>
      {step === 0 && (
        <>
          <p className="text-body">
            Dein Studium auf einen Blick – und die Folgen deiner Entscheidungen,
            bevor du sie triffst.
          </p>
          <p className="text-body text-muted-foreground">
            Du erkundest einen Prototyp mit fiktiven Daten. Es werden keine
            Zugangsdaten benötigt.
          </p>
          <Button onClick={() => setStep(1)}>
            Mit Hochschul-Login anmelden (Demo)
          </Button>
          <Button variant="link" onClick={() => finish(true)}>
            Demo ohne Einrichtung starten
          </Button>
        </>
      )}
      {step === 1 && (
        <>
          <p className="text-body">
            StudiCompass liest nur. Änderungen machst du weiterhin in den
            Originalsystemen.
          </p>
          <p className="text-meta text-muted-foreground">
            Alle Verbindungen sind simuliert. Einstellungen werden nur lokal in
            deinem Browser gespeichert. Es werden keine Hochschuldaten
            übertragen.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((channel) => (
              <label
                key={channel}
                className="space-y-2 rounded-xl border bg-card p-4"
              >
                <span className="flex items-center gap-2 text-card-title">
                  <input
                    className="accent-primary"
                    type="checkbox"
                    aria-label={CHANNEL_LABELS[channel]}
                    checked={state.connectedChannels[channel]}
                    onChange={(event) =>
                      void state.setChannelConnected(
                        channel,
                        event.target.checked,
                      )
                    }
                  />
                  {CHANNEL_LABELS[channel]}
                </span>
                <span role="status" className="block text-meta">
                  {!state.connectedChannels[channel]
                    ? "Nicht verbunden"
                    : state.resources[channel].status === "loading"
                      ? "Wird verbunden …"
                      : state.resources[channel].status === "error"
                        ? "Verbindung fehlgeschlagen – bitte erneut verbinden"
                        : "Verbunden (Demo)"}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <ResourceBoundary
            services={["pos"]}
            skeleton={
              <Skeleton
                role="status"
                aria-label="Studiendaten werden geladen"
                className="h-24"
              />
            }
          >
            {() => (
              <div className="space-y-2 rounded-xl border bg-card p-4 text-body">
                <p>Studiengang: {state.resources.pos.data?.program.title}</p>
                <p>
                  Fachsemester:{" "}
                  {state.resources.pos.data &&
                    semesterNumber(
                      DEMO_CURRENT_TERM,
                      state.resources.pos.data.student.startTerm,
                    )}
                </p>
                <p>
                  SPO Wirtschaftsinformatik · Beispiel, Version noch nicht
                  verifiziert
                </p>
              </div>
            )}
          </ResourceBoundary>
          <label className="flex items-center gap-2 text-body">
            <input
              className="accent-primary"
              type="checkbox"
              checked={goal}
              onChange={(event) => setGoal(event.target.checked)}
            />
            Mein Ziel: Abschluss in Regelstudienzeit
          </label>
          <label htmlFor="job-hours" className="text-body">
            Nebenjob: <output className="tabular-nums">{hours}</output>{" "}
            Std./Woche
          </label>
          <input
            className="accent-primary"
            id="job-hours"
            type="range"
            min={0}
            max={40}
            step={1}
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
          />
        </>
      )}
      {step === 3 && (
        <>
          <fieldset className="space-y-3">
            <legend className="sr-only">Hinweis-Stil wählen</legend>
            {(
              [
                { value: "neutral", label: "Sachlich" },
                { value: "direct", label: "Direkt" },
              ] as const
            ).map((tone) => (
              <label
                key={tone.value}
                className="block space-y-2 rounded-xl border bg-card p-4"
              >
                <span className="flex items-center gap-2 text-card-title">
                  <input
                    className="accent-primary"
                    type="radio"
                    name="onboarding-tone"
                    aria-label={tone.label}
                    checked={state.hintTone === tone.value}
                    onChange={() => state.setHintTone(tone.value)}
                  />
                  {tone.label}
                </span>
                <ResourceBoundary
                  services={["website"]}
                  skeleton={
                    <Skeleton
                      role="status"
                      aria-label="Beispieltext wird geladen"
                      className="h-16"
                    />
                  }
                >
                  {() => (
                    <span className="block text-body">
                      {state.resources.website.data?.notifications.find(
                        (item) => item.type === "decision",
                      )?.text[tone.value] ??
                        "Für diesen Kanal ist kein Beispieltext hinterlegt."}
                    </span>
                  )}
                </ResourceBoundary>
              </label>
            ))}
          </fieldset>
          <ResourceBoundary
            services={["rules"]}
            skeleton={
              <Skeleton
                role="status"
                aria-label="Quellen werden geladen"
                className="h-8"
              />
            }
          >
            {() => (
              <CitationList
                variant="footer"
                className="mt-0"
                citations={
                  state.resources.rules.data?.rules
                    .filter((rule) =>
                      ["DR-4", "DR-5", "DR-6"].includes(rule.id),
                    )
                    .map((rule) => rule.citation) ?? []
                }
              />
            )}
          </ResourceBoundary>
          <label className="flex items-center gap-2 text-body">
            <input
              className="accent-primary"
              type="checkbox"
              checked={tour}
              onChange={(event) => setTour(event.target.checked)}
            />
            Danach die Produkt-Tour starten (3 Schritte)
          </label>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Zurück
          </Button>
        )}
        {step > 0 && step < 3 && (
          <Button onClick={() => setStep(step + 1)}>Weiter</Button>
        )}
        {step === 3 && (
          <Button onClick={() => finish()}>Einrichtung abschließen</Button>
        )}
        {step > 0 && (
          <Button variant="ghost" onClick={() => finish(true)}>
            Überspringen
          </Button>
        )}
      </div>
    </main>
  );
}
