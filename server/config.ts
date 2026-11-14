/** Where the bridge may connect to. The browser never names a target (docs/adr/0005). */
export interface MailTarget {
  host: string;
  port: number;
  secure: boolean;
}

/** Mail server for students of the TH Mannheim (IMAPS), as published by its Campus IT. */
export const UNIVERSITY_MAIL: MailTarget = {
  host: "stud.th-mannheim.de",
  port: 993,
  secure: true,
};

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * The mail server of the university, unless the environment points to a sandbox on this machine
 * (infra/mail). Any other address is refused, so the bridge cannot be turned into an open proxy.
 */
export function mailTarget(
  env: Record<string, string | undefined> = process.env,
): MailTarget {
  const host = env.BRIDGE_MAIL_HOST?.trim();
  if (!host) return UNIVERSITY_MAIL;
  if (!LOOPBACK.has(host))
    throw new Error(
      "BRIDGE_MAIL_HOST may only name a sandbox on this machine (localhost).",
    );
  const port = Number(env.BRIDGE_MAIL_PORT ?? 3143);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("BRIDGE_MAIL_PORT is not a port number.");
  return { host, port, secure: env.BRIDGE_MAIL_SECURE === "true" };
}
