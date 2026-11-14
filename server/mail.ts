import { ImapFlow, type ImapFlowError } from "imapflow";
import PostalMime from "postal-mime";
import type { MailTarget } from "./config.ts";
import { BridgeError } from "./errors.ts";

export interface MailCredentials {
  user: string;
  password: string;
}

/** One message as the bridge hands it to the browser: plain text only, no attachments. */
export interface BridgeMail {
  uid: number;
  from: { name: string; address: string };
  subject: string;
  /** ISO instant (UTC). */
  date: string;
  text: string;
  seen: boolean;
}

export const MAIL_LIMIT = 50;
/** Enough for the text of a message; attachments beyond it are never transferred. */
const SOURCE_MAX_BYTES = 256 * 1024;
const TEXT_MAX_LENGTH = 20_000;
const TIMEOUT_MS = 10_000;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  euro: "€",
  ndash: "–",
  mdash: "—",
  hellip: "…",
};

function codePoint(value: number, fallback: string): string {
  return Number.isInteger(value) && value > 0 && value <= 0x10ffff
    ? String.fromCodePoint(value)
    : fallback;
}

/** Mails without a text part: reduce the HTML to its text, the app never renders markup. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script|head)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (entity, code: string) =>
      codePoint(Number.parseInt(code, 16), entity),
    )
    .replace(/&#(\d+);/g, (entity, code: string) =>
      codePoint(Number(code), entity),
    )
    .replace(/&([a-z]+);/gi, (entity, name: string) =>
      Object.hasOwn(ENTITIES, name) ? ENTITIES[name] : entity,
    );
}

function tidy(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, TEXT_MAX_LENGTH);
}

function failure(error: unknown): BridgeError {
  if (error instanceof BridgeError) return error;
  const cause = error as ImapFlowError;
  if (cause.authenticationFailed) return new BridgeError("auth");
  if (cause.code === "ETIMEDOUT" || /timeout/i.test(cause.code ?? ""))
    return new BridgeError("timeout");
  return new BridgeError("unreachable");
}

/**
 * Reads the newest messages of the inbox. The mailbox is opened read-only, so nothing is marked as
 * read, moved or deleted. Credentials live only in this call.
 */
export async function fetchInbox(
  target: MailTarget,
  credentials: MailCredentials,
  limit = MAIL_LIMIT,
): Promise<BridgeMail[]> {
  const client = new ImapFlow({
    host: target.host,
    port: target.port,
    secure: target.secure,
    auth: { user: credentials.user, pass: credentials.password },
    logger: false,
    disableAutoIdle: true,
    connectionTimeout: TIMEOUT_MS,
    greetingTimeout: TIMEOUT_MS,
    socketTimeout: 2 * TIMEOUT_MS,
  });
  // Without a listener a dropped connection would end the whole server process.
  client.on("error", () => undefined);
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX", { readOnly: true });
    try {
      const total =
        typeof client.mailbox === "object" ? client.mailbox.exists : 0;
      if (total === 0) return [];
      const raw: {
        uid: number;
        seen: boolean;
        date: Date;
        source: Buffer | undefined;
        subject: string;
        from: { name: string; address: string };
      }[] = [];
      for await (const message of client.fetch(
        `${Math.max(1, total - limit + 1)}:*`,
        {
          uid: true,
          flags: true,
          envelope: true,
          internalDate: true,
          source: { start: 0, maxLength: SOURCE_MAX_BYTES },
        },
      )) {
        const sender = message.envelope?.from?.[0];
        const date = message.envelope?.date ?? message.internalDate;
        raw.push({
          uid: message.uid,
          seen: message.flags?.has("\\Seen") ?? false,
          date: date ? new Date(date) : new Date(0),
          source: message.source,
          subject: message.envelope?.subject ?? "",
          from: { name: sender?.name ?? "", address: sender?.address ?? "" },
        });
      }
      const mails: BridgeMail[] = [];
      for (const item of raw) {
        const parsed = item.source
          ? await PostalMime.parse(item.source).catch(() => null)
          : null;
        mails.push({
          uid: item.uid,
          from: item.from,
          subject: item.subject.trim(),
          date: (Number.isNaN(item.date.getTime())
            ? new Date(0)
            : item.date
          ).toISOString(),
          text: tidy(parsed?.text ?? htmlToText(parsed?.html ?? "")),
          seen: item.seen,
        });
      }
      return mails;
    } finally {
      lock.release();
    }
  } catch (error) {
    throw failure(error);
  } finally {
    await client.logout().catch(() => undefined);
  }
}
