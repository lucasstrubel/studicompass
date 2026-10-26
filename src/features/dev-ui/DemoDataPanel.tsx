import { useState } from "react";
import { DEMO_TIME_ZONE, FLAGS } from "@/config/demo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/store/use-demo-store";

const labels = {
  pos: "POS",
  moodle: "Moodle",
  mail: "Mail",
  website: "Website",
  rules: "Regelwerk",
  assistant: "Assistent",
} as const;
const keys = [
  "pos",
  "moodle",
  "mail",
  "website",
  "rules",
  "assistant",
] as const;
const statusLabels = {
  idle: "Noch nicht geladen",
  loading: "Wird geladen …",
  ready: "Geladen",
  error: "Fehler beim Laden",
} as const;

/** Developer-only observation of P2 service states; the dashboard stays a design preview until P3-02. */
export function DemoDataPanel() {
  const resources = useDemoStore((state) => state.resources);
  const hydrate = useDemoStore((state) => state.hydrate);
  const retry = useDemoStore((state) => state.retry);
  const [simulateErrors, setSimulateErrors] = useState(FLAGS.simulateErrors);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Beispieldaten und Kanäle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-body text-muted-foreground">
          Entwicklerprüfung: Die Kanäle laden unabhängig voneinander. Alle
          Inhalte sind Beispiele.
        </p>
        <label className="flex items-center gap-2 text-body">
          <input
            type="checkbox"
            checked={simulateErrors}
            onChange={(event) => {
              FLAGS.simulateErrors = event.target.checked;
              setSimulateErrors(event.target.checked);
            }}
          />
          Ladefehler simulieren
        </label>
        <Button
          variant="outline"
          onClick={() => {
            void hydrate();
          }}
        >
          Alle Daten neu laden
        </Button>
        <ul className="space-y-3" aria-live="polite">
          {keys.map((key) => {
            const resource = resources[key];
            const empty =
              resource.status === "ready" &&
              resource.data !== null &&
              "inbox" in resource.data &&
              resource.data.inbox.length === 0;
            return (
              <li
                key={key}
                className="flex flex-wrap items-center gap-3 text-body"
              >
                <strong>{labels[key]}</strong>
                <span>{statusLabels[resource.status]}</span>
                {empty && <span>Keine Nachrichten vorhanden.</span>}
                {resource.updatedAt && (
                  <span className="text-meta text-muted-foreground">
                    Stand:{" "}
                    {new Intl.DateTimeFormat("de-DE", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: DEMO_TIME_ZONE,
                    }).format(new Date(resource.updatedAt))}
                  </span>
                )}
                {resource.error && <span>{resource.error}</span>}
                {resource.status === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void retry(key);
                    }}
                  >
                    Erneut laden: {labels[key]}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
