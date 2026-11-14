import type { InboxItem, Module } from "@/domain/types";
import { toInstant } from "@/lib/instant";
import type { MailData } from "@/services/types";
import type { BridgeMessage } from "./schemas";

/** Ids of real mails; the store uses the prefix to forget their read state on disconnect. */
export const MAIL_ID_PREFIX = "mail-";
const PREVIEW_LENGTH = 140;

function preview(text: string): string {
  const line = text.replace(/\s+/g, " ").trim();
  if (line.length <= PREVIEW_LENGTH) return line;
  const cut = line.slice(0, PREVIEW_LENGTH);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1))} …`;
}

/**
 * The module a mail is about: the one whose title stands in the subject. With several hits the
 * longest title wins ("Programmierung 2" before "Programmierung"); without a hit there is none.
 */
export function moduleOfMail(
  subject: string,
  modules: Module[],
): string | undefined {
  const text = subject.toLocaleLowerCase("de");
  return modules
    .filter((module) => text.includes(module.title.toLocaleLowerCase("de")))
    .sort((left, right) => right.title.length - left.title.length)[0]?.id;
}

/**
 * Mails of the university mailbox as inbox items. A mail states no deadline in a form the app could
 * rely on, so the channel contributes none: nothing is guessed from the text.
 */
export function mapMail(
  messages: BridgeMessage[],
  modules: Module[],
  timeZone: string,
): MailData {
  const inbox = messages.map((message): InboxItem => {
    const moduleId = moduleOfMail(message.subject, modules);
    return {
      id: `${MAIL_ID_PREFIX}${message.uid}`,
      channel: "mail",
      sender:
        message.from.name.trim() ||
        message.from.address.trim() ||
        "Unbekannter Absender",
      subject: message.subject.trim() || "(Kein Betreff)",
      preview: preview(message.text),
      body: message.text.trim() || "Diese Mail enthält keinen Text.",
      receivedAt: toInstant(new Date(message.date), timeZone),
      read: message.seen,
      relevance: "normal",
      ...(moduleId ? { moduleId } : {}),
    };
  });
  return { inbox, deadlines: [] };
}
