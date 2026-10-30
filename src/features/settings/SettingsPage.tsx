import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { ChannelStatus } from "@/components/common/ChannelStatus";
import { useDemoStore } from "@/store/use-demo-store";
import { APP_NAME } from "@/config/demo";
import { CitationList } from "@/components/common/CitationList";
import type { Notification } from "@/domain/types";
import { CHANNELS } from "@/services/types";
import { ProfileSection } from "@/features/profile/ProfileSection";

const TYPES: { type: Notification["type"]; label: string }[] = [
  { type: "decision", label: "Entscheidungen" },
  { type: "inbox", label: "Postfach" },
  { type: "milestone", label: "Meilensteine" },
  { type: "deadline", label: "Fristen" },
];

export function SettingsPage() {
  const state = useDemoStore((state) => state);
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const preview = state.resources.website.data?.notifications.find(
    (item) => item.type === "decision",
  );
  return (
    <div className="max-w-4xl space-y-6">
      <ProfileSection />
      <fieldset className="space-y-3 rounded-xl border bg-card p-4">
        <legend className="px-1 text-section-title">Hinweis-Stil</legend>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { value: "neutral", label: "Sachlich" },
              { value: "direct", label: "Direkt" },
            ] as const
          ).map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 text-body"
            >
              <input
                className="accent-primary"
                type="radio"
                name="tone"
                checked={state.hintTone === item.value}
                onChange={() => state.setHintTone(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
        <p className="text-meta text-muted-foreground">
          Wirkt auf Übersicht, Folgen-Check und Benachrichtigungen.
        </p>
        {preview && (
          <p className="text-body">Vorschau: {preview.text[state.hintTone]}</p>
        )}
        {preview && (
          <CitationList
            variant="footer"
            className="mt-0"
            citations={
              state.resources.rules.data?.rules
                .filter((rule) => preview.ruleIds.includes(rule.id))
                .map((rule) => rule.citation) ?? []
            }
          />
        )}
      </fieldset>
      <fieldset className="space-y-3 rounded-xl border bg-card p-4">
        <legend className="px-1 text-section-title">Benachrichtigungen</legend>
        <p className="text-meta text-muted-foreground">
          Wähle die Typen für die Glocke. Die Hinweise auf der Übersicht bleiben
          verfügbar.
        </p>
        {TYPES.map((item) => (
          <label key={item.type} className="flex items-center gap-2 text-body">
            <input
              className="accent-primary"
              type="checkbox"
              checked={state.notificationTypes[item.type]}
              onChange={(event) =>
                state.setNotificationType(item.type, event.target.checked)
              }
            />
            {item.label}
          </label>
        ))}
      </fieldset>
      <section className="space-y-3" aria-labelledby="channels-settings">
        <h2 id="channels-settings" className="text-section-title">
          Verbundene Kanäle
        </h2>
        <p className="text-body">
          Nur Lesezugriff. Alle Verbindungen sind simuliert. Beim Trennen
          bleiben bereits geladene Daten sichtbar; nach Neuladen kann ein
          getrennter Kanal erst nach erneutem Verbinden wieder geladen werden.
        </p>
        <ChannelStatus />
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((channel) => (
            <Button
              key={channel}
              variant="outline"
              className="h-auto min-h-9 max-w-full whitespace-normal py-1.5"
              disabled={state.resources[channel].status === "loading"}
              onClick={() =>
                void state.setChannelConnected(
                  channel,
                  !state.connectedChannels[channel],
                )
              }
            >
              {CHANNEL_LABELS[channel]}:{" "}
              {state.connectedChannels[channel]
                ? "Verbindung trennen"
                : "Verbinden"}{" "}
              (Simulation)
            </Button>
          ))}
        </div>
      </section>
      <section
        className="space-y-3 rounded-xl border bg-card p-4"
        aria-labelledby="demo-settings"
      >
        <h2 id="demo-settings" className="text-section-title">
          Demo
        </h2>
        <p className="text-body">
          {APP_NAME} ist ein Prototyp mit fiktiven Studiendaten. Es werden keine
          Hochschulsysteme verbunden oder Daten an sie gesendet.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void navigate("/start")}>
            Onboarding erneut starten
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={resetting}>
                Demo zurücksetzen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Demo zurücksetzen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Simulierte Entscheidungen, Gelesenstatus und persönliche
                  Einstellungen werden zurückgesetzt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setResetting(true);
                    void state.resetDemo().then(() => {
                      setResetting(false);
                      void navigate("/start");
                    });
                  }}
                >
                  Zurücksetzen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
