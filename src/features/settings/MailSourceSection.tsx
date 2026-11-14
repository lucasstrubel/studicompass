import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedButton, SegmentedGroup } from "@/components/common/Segmented";
import { useDemoStore } from "@/store/use-demo-store";

const FIELD =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-body placeholder:text-muted-foreground aria-invalid:border-status-critical";

type MailChoice = "demo" | "live";
const SOURCES: { value: MailChoice; label: string; text: string }[] = [
  {
    value: "demo",
    label: "Beispieldaten",
    text: "Erfundene Mails, die zur Demo gehören. Es wird nichts abgerufen.",
  },
  {
    value: "live",
    label: "Eigenes Postfach",
    text: "Zeigt die Mails aus deinem Hochschul-Postfach. Sie werden nur gelesen: Im Postfach bleibt jede Mail so ungelesen oder gelesen, wie sie war.",
  },
];

/** Where the mail channel reads from: the example mails or the university mailbox behind the bridge (ADR 0005). */
export function MailSourceSection() {
  const id = useId();
  const account = useDemoStore((state) => state.mailAccount);
  const bridge = useDemoStore((state) => state.mailBridge);
  const loading = useDemoStore(
    (state) => state.resources.mail.status === "loading",
  );
  const checkMailBridge = useDemoStore((state) => state.checkMailBridge);
  const connectMail = useDemoStore((state) => state.connectMail);
  const disconnectMail = useDemoStore((state) => state.disconnectMail);
  const [choice, setChoice] = useState<MailChoice>(account ? "live" : "demo");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = (value: MailChoice) => {
    setChoice(value);
    setError(null);
    if (value === "live" && bridge === "unknown") void checkMailBridge();
    if (value === "demo" && account) void disconnectMail();
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setConnecting(true);
    void connectMail(user, password).then((result) => {
      setConnecting(false);
      setPassword("");
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <section className="space-y-3 p-5" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-section-title">
        Hochschul-Mail
      </h2>
      <SegmentedGroup label="Quelle der Mails">
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
        (account ? (
          <div className="space-y-3">
            <p className="text-body" role="status">
              Verbunden als <strong>{account.userName}</strong>
            </p>
            <Button variant="outline" size="sm" onClick={() => choose("demo")}>
              Postfach trennen
            </Button>
          </div>
        ) : bridge === "unknown" ? (
          <p className="text-body text-muted-foreground" role="status">
            Es wird geprüft, ob sich ein Postfach verbinden lässt …
          </p>
        ) : bridge === "unavailable" ? (
          <p className="text-body" role="status">
            Das geht nur in der lokalen Version. Diese Demo läuft ohne den
            Server-Teil, der den Mailserver der Hochschule erreicht; hier wird
            kein Passwort abgefragt.
          </p>
        ) : (
          <form noValidate onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor={`${id}-user`}
                  className="text-meta font-semibold"
                >
                  Benutzerkennung
                </label>
                <input
                  id={`${id}-user`}
                  value={user}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby={`${id}-help`}
                  onChange={(event) => setUser(event.target.value)}
                  className={FIELD}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`${id}-password`}
                  className="text-meta font-semibold"
                >
                  Passwort
                </label>
                <input
                  id={`${id}-password`}
                  type="password"
                  value={password}
                  autoComplete="off"
                  aria-describedby={`${id}-help`}
                  onChange={(event) => setPassword(event.target.value)}
                  className={FIELD}
                />
              </div>
            </div>
            <p id={`${id}-help`} className="text-meta text-muted-foreground">
              An der TH Mannheim ist die Benutzerkennung die Matrikelnummer ohne
              führende Nullen. Das Passwort geht über diesen Rechner direkt an
              den Mailserver der Hochschule, wird nirgends gespeichert und ist
              nach dem Neuladen der Seite vergessen.
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
              {connecting ? "Anmeldung wird geprüft …" : "Postfach verbinden"}
            </Button>
          </form>
        ))}
    </section>
  );
}
