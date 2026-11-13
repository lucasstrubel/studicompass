import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedButton, SegmentedGroup } from "@/components/common/Segmented";
import { useDemoStore } from "@/store/use-demo-store";
import type { MoodleSource } from "@/store/demo-store";

const FIELD =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-body placeholder:text-muted-foreground aria-invalid:border-status-critical";

const SOURCES: { value: MoodleSource; label: string; text: string }[] = [
  {
    value: "demo",
    label: "Beispieldaten",
    text: "Erfundene Kursdaten, die zur Demo gehören. Es wird nichts abgerufen.",
  },
  {
    value: "recording",
    label: "Aufzeichnung",
    text: "Echte Antworten eines Moodle mit Beispielkursen, einmal aufgezeichnet. Sie laufen durch dieselbe Anbindung wie ein verbundenes Moodle; es wird nichts abgerufen.",
  },
  {
    value: "live",
    label: "Eigenes Moodle",
    text: "Liest Kurse, Abgaben und Ankündigungen direkt aus einem Moodle. Der Zugriffsschlüssel bleibt nur bis zum Neuladen im Speicher und geht ausschließlich an dieses Moodle.",
  },
];

/** Where the Moodle channel reads from (ADR 0002). The access key is asked for, never a password. */
export function MoodleSourceSection() {
  const id = useId();
  const source = useDemoStore((state) => state.moodleSource);
  const site = useDemoStore((state) => state.moodleSite);
  const loading = useDemoStore(
    (state) => state.resources.moodle.status === "loading",
  );
  const setMoodleSource = useDemoStore((state) => state.setMoodleSource);
  const connectMoodle = useDemoStore((state) => state.connectMoodle);
  const [choice, setChoice] = useState<MoodleSource>(source);
  const [baseUrl, setBaseUrl] = useState("http://localhost:8080");
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = (value: MoodleSource) => {
    setChoice(value);
    setError(null);
    if (value !== "live" && value !== source) void setMoodleSource(value);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setConnecting(true);
    void connectMoodle(baseUrl, token).then((result) => {
      setConnecting(false);
      if (result.ok) setToken("");
      else setError(result.error);
    });
  };

  return (
    <section className="space-y-3 p-5" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-section-title">
        Moodle-Daten
      </h2>
      <SegmentedGroup label="Quelle der Moodle-Daten">
        {SOURCES.map((item) => (
          <SegmentedButton
            key={item.value}
            pressed={choice === item.value}
            disabled={loading || connecting}
            onClick={() => choose(item.value)}
          >
            {item.label}
          </SegmentedButton>
        ))}
      </SegmentedGroup>
      <p className="text-body">
        {SOURCES.find((item) => item.value === choice)?.text}
      </p>
      {choice === "live" &&
        (source === "live" && site ? (
          <div className="space-y-3">
            <p className="text-body" role="status">
              Verbunden mit <strong>{site.siteName}</strong> als {site.userName}{" "}
              <span className="text-muted-foreground">({site.baseUrl})</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChoice("demo");
                void setMoodleSource("demo");
              }}
            >
              Moodle trennen
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor={`${id}-url`}
                  className="text-meta font-semibold"
                >
                  Adresse des Moodle
                </label>
                <input
                  id={`${id}-url`}
                  type="url"
                  inputMode="url"
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  className={FIELD}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`${id}-token`}
                  className="text-meta font-semibold"
                >
                  Zugriffsschlüssel
                </label>
                <input
                  id={`${id}-token`}
                  value={token}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby={`${id}-token-help`}
                  onChange={(event) => setToken(event.target.value)}
                  className={FIELD}
                />
              </div>
            </div>
            <p
              id={`${id}-token-help`}
              className="text-meta text-muted-foreground"
            >
              Den Schlüssel zeigt Moodle im Profil unter „Sicherheitsschlüssel“.
              Dein Passwort wird nicht gebraucht.
            </p>
            {error && (
              <p
                role="alert"
                className="text-body text-status-critical-foreground"
              >
                {error}
              </p>
            )}
            <Button type="submit" disabled={connecting}>
              {connecting
                ? "Verbindung wird geprüft …"
                : "Mit Moodle verbinden"}
            </Button>
          </form>
        ))}
    </section>
  );
}
