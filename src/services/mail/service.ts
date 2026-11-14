import { ZodError } from "zod";
import type { Module } from "@/domain/types";
import type { MailData, MailService } from "@/services/types";
import type { MailClient } from "./client";
import { MailError } from "./errors";
import { mapMail } from "./mapping";
import { mailbox } from "./schemas";

export interface MailServiceOptions {
  /** Modules known at the time of loading, for assigning mails to them. */
  modules: () => Module[];
  timeZone: string;
}

/** Reads the mailbox and checks the response; a response of another shape is an "unexpected" error. */
export async function loadMail(
  client: MailClient,
  options: MailServiceOptions,
): Promise<MailData> {
  const payload = await client.fetchInbox();
  try {
    return mapMail(
      mailbox.parse(payload).messages,
      options.modules(),
      options.timeZone,
    );
  } catch (error) {
    if (error instanceof ZodError)
      throw new MailError("unexpected", { cause: error });
    throw error;
  }
}

/** The mail channel against a real mailbox, read through the bridge (read only). */
export function createMailService(
  client: MailClient,
  options: MailServiceOptions,
): MailService {
  return { load: () => loadMail(client, options) };
}
