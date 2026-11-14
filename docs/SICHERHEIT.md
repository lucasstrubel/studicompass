# Sicherheit und Datenschutz

StudiCompass ist ein Prototyp. Die öffentliche Demo hat keinen eigenen Server; lokal kommt die Brücke dazu, ein kleiner Server-Teil für das Hochschul-Postfach ([ADR 0005](adr/0005-bruecke-fuer-pos-und-mail.md)). Diese Seite beschreibt, welche Daten wo liegen, was die App nach außen sendet und wogegen sie sich schützt. Sie beschreibt den Stand des Codes, keine Zusicherung für einen Produktivbetrieb.

## Welche Daten wo liegen

| Daten                                                            | Ort                                                           | Verlässt den Browser?                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Beispieldaten (Niklas, Noten, Mails, Termine)                    | im ausgelieferten Code                                        | nein                                                        |
| Einstellungen, Gelesenstatus, simulierte Entscheidungen          | `localStorage` dieses Browsers                                | nein                                                        |
| Eigene Einträge (Prüfungsvorleistungen, Notizen, Links, Termine) | `localStorage`; auf Wunsch zusätzlich in Moodle               | nur beim ausdrücklichen Sichern                             |
| Zugriffsschlüssel für Moodle                                     | Arbeitsspeicher der geöffneten Seite                          | nur an das eingegebene Moodle                               |
| Kursdaten aus einem verbundenen Moodle                           | Arbeitsspeicher; daraus erkannte Änderungen im `localStorage` | nein                                                        |
| Passwort des Hochschul-Zugangs                                   | Arbeitsspeicher der geöffneten Seite                          | nur über die lokale Brücke an den Mailserver der Hochschule |
| Mails aus dem verbundenen Postfach                               | Arbeitsspeicher; Gelesen-Marken der App im `localStorage`     | nein                                                        |

Alle personenbezogenen Daten der Demo sind erfunden. Echte Daten entstehen nur, wenn jemand ein eigenes Moodle oder das eigene Postfach verbindet; sie bleiben dann in dessen Browser. Mails enthalten Daten Dritter: Screenshots und Aufzeichnungen entstehen deshalb nur aus der Sandbox.

## Was die App sendet

- **Ohne verbundenes Moodle: nichts.** Die Modi „Beispieldaten“ und „Aufzeichnung“ arbeiten vollständig ohne Netzwerk; Schriften und Skripte kommen vom selben Server wie die Seite.
- **Mit verbundenem Moodle:** Aufrufe der Web Services dieses Moodle, jeweils mit dem Zugriffsschlüssel. Beim Sichern zusätzlich eine Datei mit den eigenen Einträgen. Kein anderer Server wird angesprochen.
- **Mit verbundenem Postfach (nur lokal):** Anfragen an die Brücke derselben Herkunft (`/api/bridge/mail`), jeweils mit Benutzerkennung und Passwort im Rumpf. Die Brücke öffnet damit eine verschlüsselte IMAP-Verbindung zu `stud.th-mannheim.de` und zu keinem anderen Ziel.

## Brücke und Hochschul-Passwort

- Die Brücke läuft nur im lokalen Dev- und Preview-Server. Die öffentliche Demo liefert sie nicht aus und zeigt deshalb kein Passwortfeld.
- Sie ist zustandslos: keine Sitzung, keine Datenbank, keine Protokolle. Fehlerantworten enthalten nur eine Art (`auth`, `timeout` …), nie einen Text des Mailservers oder Teile der Anfrage. Tests prüfen das.
- Das Ziel steht im Code (`server/config.ts`). Die Anfrage kann keines nennen; per Umgebungsvariable lässt es sich nur auf `localhost` umstellen (Sandbox).
- Das Postfach wird schreibgeschützt geöffnet. Lesen in der App ändert auf dem Mailserver nichts.
- Anfragen müssen JSON sein, höchstens 4 kB groß und von derselben Herkunft kommen; je Minute sind zwölf Abrufe möglich, damit eine Schleife das Konto nicht sperrt.
- Im Browser liegt das Passwort wie der Moodle-Schlüssel nur in einer Variablen des Stores. Ein Neuladen verwirft es.
- Das Hochschul-Passwort öffnet mehr als das Postfach und lässt sich nicht auf Lesen beschränken. Es gehört nur in eine Brücke, die auf dem eigenen Rechner läuft.

## Zugriffsschlüssel

- Die App fragt nie ein Passwort ab, nur den Zugriffsschlüssel, den Moodle im Nutzerprofil anzeigt. Er lässt sich dort jederzeit zurücksetzen.
- Der Schlüssel liegt in einer Variablen des Stores: nicht im State, nicht im `localStorage`, nicht in Fehlermeldungen. Ein Neuladen der Seite verwirft ihn. Tests prüfen das.
- Aufrufe senden ihn im Rumpf der Anfrage. Ausnahme: Beim Laden der eigenen Sicherung verlangt Moodle ihn als Parameter in der Adresse; er kann dann in Protokollen dieses Moodle-Servers stehen.
- Wer den Schlüssel hat, kann im Rahmen des Moodle-Dienstes als diese Person lesen und in deren private Dateien schreiben. Er gehört deshalb nicht in geteilte Rechner oder Screenshots.

## Bedrohungen und Gegenmaßnahmen

| Bedrohung                                                       | Gegenmaßnahme                                                                                                                                                                |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Moodle liefert HTML oder Skript in Kursnamen und Ankündigungen  | Texte werden nie als HTML gerendert; Ankündigungen werden auf reinen Text reduziert. React maskiert alle Ausgaben.                                                           |
| Moodle liefert unerwartete oder manipulierte Antworten          | Jede Antwort wird gegen ein Schema geprüft; unbekannte Felder fallen weg, abweichende Formen führen zu einem Fehlerzustand statt zu falschen Daten.                          |
| Eine manipulierte Sicherung oder ein veränderter `localStorage` | Beim Lesen wird jeder Eintrag einzeln geprüft. Links sind nur mit `http` oder `https` zulässig, alles andere wird verworfen.                                                 |
| Eingeschleuste Skripte (XSS) lesen den Schlüssel                | Content-Security-Policy im Produktions-Build: Skripte nur von der eigenen Herkunft, keine Inline-Skripte, keine Plugins. Der Schlüssel liegt nicht im Speicher des Browsers. |
| Abfluss von Daten an fremde Server                              | Es gibt keine Analyse-, Schrift- oder Werbedienste. Die Policy erlaubt Verbindungen nur zu `http`/`https`-Zielen; angesprochen wird allein das verbundene Moodle.            |
| Verwundbare Abhängigkeiten                                      | Dependabot meldet Aktualisierungen, CodeQL prüft den Code bei jedem Pull Request.                                                                                            |
| Fremde Website ruft die lokale Brücke auf                       | Die Brücke hält keine Zugangsdaten und keine Sitzung; ohne das Passwort gibt es nichts abzurufen. Anfragen fremder Herkunft lehnt sie ab.                                    |
| Brücke wird als Sprungbrett zu anderen Servern benutzt          | Feste Ziele im Code; die Anfrage kann keinen Host und keinen Port nennen.                                                                                                    |
| HTML oder Skript in einer Mail                                  | Die Brücke reduziert Mails auf reinen Text und überträgt keine Anhänge; die App rendert nie Markup aus Mails.                                                                |
| Unverschlüsselte Verbindung zum Moodle                          | Die Sandbox läuft nur auf `localhost`. Für ein Moodle im Netz gilt: nur über `https` verbinden.                                                                              |

## Grenzen

- Die Policy lässt Inline-Styles zu, weil die Oberflächenbibliotheken Style-Attribute setzen.
- `connect-src` ist weit gefasst, weil die Adresse des Moodle erst zur Laufzeit feststeht. In einem Betrieb für eine Hochschule gehört dort genau deren Moodle hinein.
- Eine Anmeldung über das Single Sign-on einer Hochschule ist nicht umgesetzt. Sie bräuchte einen Server, der den Schlüssel verwahrt.
- Die Brücke ist nicht für einen öffentlichen Betrieb gehärtet: Es gibt keine Begrenzung je Nutzer und keine Überwachung. Fremde Passwörter gehören nicht auf einen Server dieses Prototyps.
- Für einen echten Betrieb fehlen unter anderem eine Datenschutzerklärung, ein Verzeichnis der Verarbeitungstätigkeiten und die Abstimmung mit der Hochschule. Der Prototyp ist kein Angebot der TH Mannheim.

## Eine Schwachstelle melden

Über [einen privaten Sicherheitshinweis](https://github.com/lucasstrubel/studicompass/security/advisories/new) auf GitHub.
