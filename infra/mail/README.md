# Mail-Sandbox

Ein lokaler Mailserver mit dem Postfach des Beispielstudenten, gegen den StudiCompass den Abruf des Hochschul-Postfachs entwickelt und testet. Warum Mail über einen eigenen Server-Teil läuft: [ADR 0005](../../docs/adr/0005-bruecke-fuer-pos-und-mail.md).

Der Server ist [GreenMail](https://greenmail-mail-test.github.io/greenmail/), ein Mailserver für Tests: Er hält alles im Arbeitsspeicher und stellt nichts zu. Alle Personen, Inhalte und Zugangsdaten hier sind Beispielwerte. Die Sandbox ist nur von diesem Rechner aus erreichbar (`127.0.0.1`).

## Starten

Voraussetzung: Docker Desktop.

```sh
npm run mail:up      # startet den Server und füllt das Postfach
npm run mail:down    # stoppt; die Mails sind danach weg
```

Nach jedem Start ist das Postfach wieder im Ausgangszustand. `node infra/mail/seed.ts` stellt ihn auch im laufenden Betrieb her.

## Beispielstand

| Benutzerkennung | Passwort       | Protokoll                           |
| --------------- | -------------- | ----------------------------------- |
| `2212345`       | `Sandbox-2026` | IMAP auf `localhost:3143`, ohne TLS |

Vier Mails aus [`seed.ts`](seed.ts): eine ungelesene Raumänderung, eine gelesene Mail der Fachschaft, eine reine HTML-Mail und eine Mail ohne Betreff und Absendername.

## Testen und in der App verbinden

```sh
npm run test:mail    # Integrationstests des Abrufs (server/mail.integration.ts)
```

Damit die App die Sandbox statt des Mailservers der Hochschule anspricht, braucht der Dev- oder Preview-Server zwei Umgebungsvariablen:

```sh
BRIDGE_MAIL_HOST=localhost BRIDGE_MAIL_PORT=3143 npm run dev
```

In PowerShell: `$env:BRIDGE_MAIL_HOST = 'localhost'; $env:BRIDGE_MAIL_PORT = '3143'; npm run dev`. Dann unter Einstellungen → Hochschul-Mail → „Eigenes Postfach“ mit den Werten oben verbinden. Dieselben Variablen schalten in `npm run e2e` die Tests in `e2e/mail.e2e.ts` frei, die ein Postfach brauchen.

`BRIDGE_MAIL_HOST` nimmt nur `localhost` an. Jede andere Adresse lehnt die Brücke beim Start ab.
