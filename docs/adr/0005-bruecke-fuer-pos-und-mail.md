# ADR 0005: Eine Brücke für POS und Mail

Status: angenommen (14.11.2026); fasst [ADR 0003](0003-kein-eigenes-backend.md) für die Kanäle POS und Mail neu

## Kontext

Nach Moodle sollen auch Hochschul-Mail und POS echte Daten liefern. Für beide gilt, was für Moodle nicht galt: Der Browser kommt nicht hin.

- **Mail.** Das Postfach der Hochschule spricht IMAP. Das ist kein HTTP; eine Website kann keine IMAP-Verbindung öffnen.
- **POS.** Das Portal bietet Studierenden keine Schnittstelle, nur Seiten nach einer Anmeldung. Der Browser blockiert Zugriffe darauf von einer fremden Adresse (Same-Origin-Policy).

Installierte Apps wie UniNow oder Studo haben diese Grenze nicht: Sie melden sich vom Gerät aus mit den Zugangsdaten der Studierenden an und lesen Portal und Postfach aus. Eine Website braucht dafür einen Server-Teil.

Erwogen und verworfen: der Import eines Notenspiegel-PDF und einzelner Mail-Dateien (kein laufender Abgleich), ein privates Postfach über die Schnittstelle des Anbieters (nicht das Hochschul-Postfach) und eine POS-Sandbox mit erfundener Schnittstelle (sagt nichts über das echte Portal).

## Entscheidung

StudiCompass bekommt einen kleinen Server-Teil, die **Brücke** (`server/`). Sie nimmt die Zugangsdaten entgegen, meldet sich damit am Mailserver oder am POS an und gibt die gelesenen Daten als JSON zurück. Moodle bleibt beim direkten Aufruf aus dem Browser.

Die Brücke folgt fünf Regeln:

1. **Zustandslos.** Jede Anfrage trägt die Zugangsdaten im Rumpf. Die Brücke speichert und protokolliert nichts: keine Sitzung, keine Datenbank, keine Rümpfe in Logs. Fehler tragen nur eine Art (`auth`, `timeout` …), nie einen Text des Zielsystems.
2. **Feste Ziele.** Der Mailserver ist `stud.th-mannheim.de`, das POS `noten.th-mannheim.de`. Die App kann kein Ziel nennen. Für Tests lässt sich das Ziel per Umgebungsvariable auf eine Sandbox auf demselben Rechner umstellen, auf nichts anderes.
3. **Nur lesen.** Das Postfach wird schreibgeschützt geöffnet: Keine Mail wird als gelesen markiert, verschoben oder gelöscht, es wird nichts gesendet. Im POS wird nur abgerufen, nie an- oder abgemeldet.
4. **Zunächst nur lokal.** Die Brücke läuft als Middleware im Dev- und Preview-Server von Vite. Auf Vercel wird sie nicht ausgeliefert; die öffentliche Demo bleibt statisch und fragt kein Passwort ab. Ein öffentlicher Betrieb ist eine eigene Entscheidung.
5. **Das Passwort bleibt flüchtig.** Im Browser liegt es wie der Moodle-Schlüssel nur in einer Variablen des Stores: nicht im State, nicht im `localStorage`, nicht in Fehlermeldungen. Ein Neuladen verwirft es.

## Gründe

- Es ist der einzige Weg zu einem laufenden Abgleich mit dem echten Postfach und dem echten Portal.
- Zustandslos heißt: Auf der Brücke liegt nichts, was sich stehlen ließe, und es gibt nichts zu betreiben außer dem Prozess selbst.
- Lokal zuerst hält die Frage klein, wem man sein Hochschul-Passwort anvertraut: dem eigenen Rechner.
- Die Architektur der App bleibt: Oberfläche → Store → Services. Die Brücke ist für den Store ein weiterer Service mit Schemas, Zuordnung und Fehlertexten wie der Moodle-Adapter.

## Folgen

- Die Regel „keine Passwortfelder“ bekommt eine Ausnahme: der Hochschul-Zugang in den Einstellungen, und nur dort, wo eine Brücke läuft.
- Das Hochschul-Passwort ist mehr wert als ein Moodle-Schlüssel: Es öffnet alle Dienste der Hochschule und lässt sich nicht auf Lesen beschränken. Die Oberfläche sagt, wohin es geht.
- Mail kennt zwei Datenmodi, Beispieldaten und eigenes Postfach. Eine Aufzeichnung wie bei Moodle gibt es nicht; den Abruf belegen Integrationstests gegen einen IMAP-Server in GitHub Actions ([`infra/mail/`](../../infra/mail/README.md)).
- „Jetzt“ bleibt `DEMO_NOW`. Echte Mails tragen ihr echtes Datum.
- Aus Mailtexten werden keine Fristen abgeleitet; der Kanal liefert nur Nachrichten.
- **POS ist offen.** Das Portal war bei der Entscheidung nicht erreichbar; Anmeldeverfahren und Aufbau der Seiten sind ungeprüft. Ein Spike klärt, ob die Anmeldung automatisierbar ist (zweiter Faktor, Captcha) und was sich lesen lässt. Scheitert er, bleibt der Notenspiegel-PDF-Import.
- Das Auslesen eines Portals bricht, sobald die Hochschule die Seiten ändert, und lässt sich in der CI nicht gegen das Original prüfen. Ob die Nutzungsbedingungen des Benutzerkontos einen automatischen Abruf decken, ist vor einem Einsatz über den eigenen Zugang hinaus zu klären.
