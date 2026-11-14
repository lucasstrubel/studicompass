/** Why a request to the bridge failed; the browser turns the kind into a German text. */
export type BridgeErrorKind =
  | "badRequest"
  | "auth"
  | "notFound"
  | "tooMany"
  | "unreachable"
  | "timeout"
  | "notAvailable"
  | "unexpected";

export const BRIDGE_STATUS: Record<BridgeErrorKind, number> = {
  badRequest: 400,
  auth: 401,
  notFound: 404,
  tooMany: 429,
  unreachable: 502,
  timeout: 504,
  notAvailable: 501,
  unexpected: 500,
};

/** Carries only the kind: no message of the upstream system and nothing of the request leaves the bridge. */
export class BridgeError extends Error {
  readonly kind: BridgeErrorKind;
  constructor(kind: BridgeErrorKind) {
    super(kind);
    this.name = "BridgeError";
    this.kind = kind;
  }
}
