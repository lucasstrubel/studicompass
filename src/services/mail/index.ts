import type { MailService } from "@/services/types";
import { createMailClient, type MailCredentials } from "./client";
import { loadMail, type MailServiceOptions } from "./service";

export { mailBridgeAvailable } from "./client";

/**
 * Data mode "Eigenes Postfach": logs in once to check the credentials and returns the service for
 * that mailbox. The mails of this first login answer the first load, so connecting costs one login.
 */
export async function connectMail(
  credentials: MailCredentials,
  options: MailServiceOptions,
): Promise<{ service: MailService }> {
  const client = createMailClient(credentials);
  let first: ReturnType<typeof loadMail> | null = Promise.resolve(
    await loadMail(client, options),
  );
  return {
    service: {
      load() {
        const ready = first;
        first = null;
        return ready ?? loadMail(client, options);
      },
    },
  };
}
