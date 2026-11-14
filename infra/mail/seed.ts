import { ImapFlow } from "imapflow";

/**
 * Fills the mail sandbox with the mailbox of the example student. GreenMail keeps mails in memory,
 * so this runs after every start (`npm run mail:up`). All people and contents are invented.
 */
export const SANDBOX = {
  host: "localhost",
  port: Number(process.env.MAIL_IMAP_PORT ?? 3143),
  secure: false,
  user: "2212345",
  password: "Sandbox-2026",
};

interface SeedMail {
  from: string;
  subject: string;
  /** Local time in Germany (CET), shortly before the demo date. */
  date: string;
  seen: boolean;
  text?: string;
  html?: string;
}

export const SEED_MAILS: SeedMail[] = [
  {
    from: '"Zentrale Prüfungsverwaltung" <pruefungsverwaltung@hochschule.example>',
    subject: "Raumänderung: Klausur Programmierung 2 am 27.01.",
    date: "2027-01-22T14:05:00+01:00",
    seen: false,
    text: "Liebe Studierende,\r\n\r\ndie Klausur Programmierung 2 am Mittwoch, 27.01.2027, 10:30 Uhr findet in Raum A 210 statt (bisher B 104). Bitte seid 15 Minuten vorher da und bringt euren Studierendenausweis mit.\r\n\r\nViele Grüße\r\nZentrale Prüfungsverwaltung",
  },
  {
    from: '"Fachschaft Informatik" <fachschaft@hochschule.example>',
    subject: "Tutorium zur Klausurvorbereitung",
    date: "2027-01-22T18:40:00+01:00",
    seen: true,
    text: "Hi zusammen,\r\n\r\nam Dienstag, 26.01., um 17 Uhr rechnen wir in Raum A 104 die Klausuren der letzten zwei Jahre durch. Eine Anmeldung ist nicht nötig.\r\n\r\nEure Fachschaft",
  },
  {
    from: '"Praktikantenamt" <praktikantenamt@hochschule.example>',
    subject: "Infoveranstaltung Praxissemester WS 2027/28",
    date: "2027-01-21T09:30:00+01:00",
    seen: false,
    html: "<html><head><style>p { color: #333 }</style></head><body><p>Liebe Studierende,</p><p>am Mittwoch, 10.02., 14 Uhr informieren wir &uuml;ber Zulassung, Stellensuche &amp; Fristen.</p><p>Ihr Praktikantenamt</p></body></html>",
  },
  {
    from: "bibliothek@hochschule.example",
    subject: "",
    date: "2027-01-20T08:00:00+01:00",
    seen: true,
    text: "Ihre Leihfrist endet in drei Tagen.",
  },
];

function encodeHeader(value: string): string {
  // Encoded words keep umlauts in names and subjects intact (RFC 2047).
  return value.replace(/[^\x20-\x7e]+(?: [^\x20-\x7e]+)*/g, (text) => {
    return `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
  });
}

function rawMail(mail: SeedMail, index: number): string {
  const body = mail.text ?? mail.html ?? "";
  return [
    `From: ${encodeHeader(mail.from)}`,
    `To: ${SANDBOX.user}@stud.example`,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${new Date(mail.date).toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <seed-${index}@hochschule.example>`,
    "MIME-Version: 1.0",
    `Content-Type: text/${mail.html ? "html" : "plain"}; charset=utf-8`,
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(body, "utf8").toString("base64").replace(/.{76}/g, "$&\r\n"),
    "",
  ].join("\r\n");
}

/** Replaces the inbox of the example student with the seed mails. */
export async function seedMailbox(): Promise<void> {
  const client = new ImapFlow({
    host: SANDBOX.host,
    port: SANDBOX.port,
    secure: SANDBOX.secure,
    auth: { user: SANDBOX.user, pass: SANDBOX.password },
    logger: false,
  });
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      if (typeof client.mailbox === "object" && client.mailbox.exists > 0)
        await client.messageDelete("1:*");
    } finally {
      lock.release();
    }
    for (const [index, mail] of SEED_MAILS.entries())
      await client.append(
        "INBOX",
        rawMail(mail, index),
        mail.seen ? ["\\Seen"] : [],
        new Date(mail.date),
      );
  } finally {
    await client.logout();
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  await seedMailbox();
  console.log(`Seeded ${SEED_MAILS.length} mails for ${SANDBOX.user}.`);
}
