import type { BridgeFailureKind } from "@/services/bridge/client";

export type PosErrorKind = BridgeFailureKind;

const MESSAGES: Record<PosErrorKind, string> = {
  unavailable:
    "Das POS lässt sich in dieser Version nicht verbinden. Es bleiben die Beispieldaten.",
  network:
    "Die Brücke zum POS ist nicht erreichbar. Prüf, ob die App lokal läuft, dann versuch es erneut.",
  timeout: "Das POS antwortet nicht rechtzeitig. Versuch es später erneut.",
  auth: "Die Anmeldung am POS wurde abgelehnt. Prüf Benutzerkennung und Passwort.",
  unreachable:
    "Das POS der Hochschule ist nicht erreichbar. Versuch es später erneut.",
  tooMany:
    "Zu viele Abrufe in kurzer Zeit. Warte eine Minute, dann versuch es erneut.",
  unexpected:
    "Das POS hat unerwartet geantwortet. Die Daten wurden nicht übernommen.",
};

/** A failed request for the POS data; `message` is the German text shown to the user. */
export class PosError extends Error {
  readonly kind: PosErrorKind;
  constructor(kind: PosErrorKind, options?: ErrorOptions) {
    super(MESSAGES[kind], options);
    this.name = "PosError";
    this.kind = kind;
  }
}
