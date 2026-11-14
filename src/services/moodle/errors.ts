export type MoodleErrorKind =
  | "network"
  | "timeout"
  | "invalidToken"
  | "serviceUnavailable"
  | "accessDenied"
  | "unexpected";

const MESSAGES: Record<MoodleErrorKind, string> = {
  network:
    "Moodle ist nicht erreichbar. Prüf die Adresse und ob Moodle läuft, dann versuch es erneut.",
  timeout: "Moodle antwortet nicht rechtzeitig. Versuch es später erneut.",
  invalidToken:
    "Der Zugriffsschlüssel ist ungültig oder abgelaufen. Erzeuge in Moodle einen neuen und verbinde erneut.",
  serviceUnavailable:
    "Dieses Moodle bietet die Schnittstelle nicht an. Die Web Services sind dort abgeschaltet.",
  accessDenied:
    "Der Zugriffsschlüssel darf diese Daten nicht lesen. Wende dich an die Betreuung deines Moodle.",
  unexpected:
    "Moodle hat unerwartet geantwortet. Die Daten wurden nicht übernommen.",
};

/** A failed Moodle request; `message` is the German text shown to the user. */
export class MoodleError extends Error {
  readonly kind: MoodleErrorKind;
  constructor(kind: MoodleErrorKind, options?: ErrorOptions) {
    super(MESSAGES[kind], options);
    this.name = "MoodleError";
    this.kind = kind;
  }
}
