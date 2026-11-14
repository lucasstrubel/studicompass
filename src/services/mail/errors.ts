export type MailErrorKind =
  | "unavailable"
  | "network"
  | "timeout"
  | "auth"
  | "unreachable"
  | "tooMany"
  | "unexpected";

const MESSAGES: Record<MailErrorKind, string> = {
  unavailable:
    "Das eigene Postfach lässt sich nur in der lokalen Version verbinden. Diese Demo läuft ohne die Brücke zum Mailserver.",
  network:
    "Die Brücke zum Mailserver ist nicht erreichbar. Prüf, ob die App lokal läuft, dann versuch es erneut.",
  timeout:
    "Der Mailserver antwortet nicht rechtzeitig. Versuch es später erneut.",
  auth: "Die Anmeldung am Mailserver wurde abgelehnt. Prüf Benutzerkennung und Passwort.",
  unreachable:
    "Der Mailserver der Hochschule ist nicht erreichbar. Versuch es später erneut.",
  tooMany:
    "Zu viele Abrufe in kurzer Zeit. Warte eine Minute, dann versuch es erneut.",
  unexpected:
    "Das Postfach hat unerwartet geantwortet. Die Mails wurden nicht übernommen.",
};

/** A failed request for the mailbox; `message` is the German text shown to the user. */
export class MailError extends Error {
  readonly kind: MailErrorKind;
  constructor(kind: MailErrorKind, options?: ErrorOptions) {
    super(MESSAGES[kind], options);
    this.name = "MailError";
    this.kind = kind;
  }
}
