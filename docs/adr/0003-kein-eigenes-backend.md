# ADR 0003: Kein eigenes Backend

Status: angenommen (13.11.2026), ein Punkt offen

## Kontext

Für die Anbindung an Moodle gäbe es zwei Wege: ein eigener Server zwischen Browser und Moodle oder der direkte Aufruf aus dem Browser. Die App wird statisch ausgeliefert und soll ohne laufende Kosten bleiben.

## Entscheidung

Der Browser ruft die Web Services von Moodle direkt auf. Es gibt keinen eigenen Server und keine eigene Datenbank. Eigene Daten der App (zum Beispiel Pläne für Prüfungsvorleistungen) werden später in Moodle selbst gespeichert, in den Einstellungen des Nutzers.

Verbunden wird über die Adresse des Moodle und einen Zugriffsschlüssel, den Moodle dem Nutzer anzeigt. Die App fragt kein Passwort ab. Der Schlüssel bleibt nur für die Sitzung im Speicher und wird nicht dauerhaft abgelegt.

## Gründe

- keine Kosten, kein Betrieb, keine zweite Stelle, an der Daten liegen
- Der Zugriffsschlüssel verlässt den Browser nur in Richtung des Moodle, zu dem er gehört.
- Die Architektur der App bleibt: Oberfläche → Store → Services.

## Offen

Ob Moodle Aufrufe von einer anderen Herkunft im Browser zulässt (CORS) und welche Funktionen ein Zugriffsschlüssel für Studierende erreicht, klärt der Spike in Phase 2. Reicht das nicht, wird diese Entscheidung neu gefasst.

## Folgen

- Es gibt keine Benachrichtigungen, solange die App geschlossen ist; abgeglichen wird beim Öffnen und auf Wunsch.
- Die Regel „keine Requests an fremde Server“ wird enger gefasst: Requests gehen nur an das Moodle, das der Nutzer selbst verbunden hat.
- Ein Sprachmodell für den Assistenten ist ohne Server nicht sicher anbindbar und bleibt außerhalb dieser Roadmap.
