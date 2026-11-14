import {
  BridgeFailure,
  readChannel,
  type BridgeCredentials,
  type BridgeOptions,
} from "@/services/bridge/client";
import { MailError } from "./errors";

export type MailCredentials = BridgeCredentials;

/** Reads the mailbox through the bridge; the result is unchecked JSON. */
export interface MailClient {
  fetchInbox: () => Promise<unknown>;
}

export function createMailClient(
  credentials: MailCredentials,
  options: BridgeOptions = {},
): MailClient {
  return {
    async fetchInbox() {
      try {
        return await readChannel("mail", credentials, options);
      } catch (error) {
        if (error instanceof BridgeFailure)
          throw new MailError(error.kind, { cause: error.cause });
        throw error;
      }
    },
  };
}
