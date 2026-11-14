import { z } from "zod";

// zod would probe for `new Function` to compile its checks; the Content Security Policy forbids that.
z.config({ jitless: true });

/** What the bridge returns for a mailbox (server/mail.ts); unknown fields are dropped. */
export const mailbox = z.object({
  messages: z.array(
    z.object({
      uid: z.number().int().nonnegative(),
      from: z.object({
        name: z.string().default(""),
        address: z.string().default(""),
      }),
      subject: z.string().default(""),
      date: z.iso.datetime(),
      text: z.string().default(""),
      seen: z.boolean().default(false),
    }),
  ),
});

export type BridgeMailbox = z.infer<typeof mailbox>;
export type BridgeMessage = BridgeMailbox["messages"][number];
