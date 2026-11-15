# Roadmap

Version 1.0.0 ist der Prototyp, wie er im November 2026 als Prüfungsleistung vorgestellt wurde: in der Breite klickbar, im Kern echt gerechnet, alle Hochschulsysteme simuliert, getestet nur vom Projektteam. Die Weiterentwicklung sollte diese beiden Lücken schließen: mit einem Test mit Studierenden, die den Prototyp nicht kennen, und mit einer echten Schnittstelle zu Moodle.

**Abschluss, November 2026.** Die Entwicklung endet mit Version 1.1.0. Die Schnittstelle zu Moodle ist gebaut, dazu das Hochschul-Postfach über eine lokale Brücke. Der Test mit Studierenden hat nicht stattgefunden, und das POS wird nicht mehr ausgelesen. Diese Seite hält fest, was geplant war und was daraus wurde.

Die [Meilensteine auf GitHub](https://github.com/lucasstrubel/studicompass/milestones?state=closed) sind geschlossen. Die Entscheidungen hinter den Phasen stehen unter [`adr/`](adr/).

## Phasen

| Phase | Inhalt                                                                                                                                             | Stand zum Abschluss                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 0     | Aufsetzen: Roadmap, Architekturentscheidungen, Changelog                                                                                           | umgesetzt                                                                                               |
| 1     | Validieren: Usability-Test mit fünf Studierenden, Messung (Aufgabenerfolg, Zeit, SUS), ICS-Import in echten Kalendern, automatischer A11y-Check    | nur der A11y-Check; Test, Messung und ICS-Import nicht mehr                                             |
| 2     | Moodle-Spike: eigene Moodle-Instanz per Docker mit Beispielkursen, Zugriff aus dem Browser, Auswahl der Webservice-Funktionen                      | umgesetzt ([ADR 0004](adr/0004-moodle-spike.md))                                                        |
| 3     | Moodle-Adapter, lesend: Service gegen die echte Schnittstelle, Datenmodi Demo, Aufzeichnung und Live, Verbinden per Zugriffsschlüssel, Fehlerfälle | umgesetzt                                                                                               |
| 4     | Funktionen auf echten Daten: „Neu in Moodle“ je Modul, Fristen aus Moodle, Prüfungsvorleistungen planen und verfolgen                              | umgesetzt                                                                                               |
| 5     | Moodle als Backend: eigene Daten der App in Moodle speichern, gleicher Stand auf mehreren Geräten, über ausdrückliches Sichern und Laden           | umgesetzt                                                                                               |
| 6     | Qualität und Betrieb: Integrationstests gegen einen Moodle-Container in GitHub Actions, Sicherheit und Datenschutz dokumentiert                    | umgesetzt                                                                                               |
| 7     | Schaufenster: README, Architekturbild, Video, Prozessdokumentation                                                                                 | umgesetzt bis auf das Video                                                                             |
| 8     | Brücke für Mail und POS: kleiner zustandsloser Server-Teil, Hochschul-Postfach per IMAP, danach POS (Notenspiegel und angemeldete Prüfungen)       | Mail umgesetzt; POS vorbereitet, das Auslesen fehlt ([ADR 0005](adr/0005-bruecke-fuer-pos-und-mail.md)) |

Alles, was nach Version 1.0.0 entstand, ist zusammen als Version 1.1.0 veröffentlicht. Geplant war eine Version je Abschnitt (nach Phase 1, nach Phase 4 und 2.0.0 nach Phase 7); dazu kam es nicht.

## Was „Neu in Moodle“ und Prüfungsvorleistungen heißen

- **Neu in Moodle.** Lädt eine Lehrperson eine Datei hoch, ändert eine Aufgabe oder schreibt eine Ankündigung, erscheint das beim Modul, im Postfach und an der Glocke. Die App vergleicht dazu den Kursinhalt mit dem zuletzt gesehenen Stand.
- **Prüfungsvorleistungen.** In Version 1.0.0 ließen sie sich je Modul eintragen und abhaken. Dazu kamen Teilschritte, geplanter Aufwand und eine Übersicht über das Semester. Eine Aufgabe aus Moodle lässt sich als Prüfungsvorleistung übernehmen; ihren Abgabe- und Bewertungsstatus schlägt die App vor, bestätigt wird von Hand. Moodle weiß nicht, was laut Modulhandbuch eine Prüfungsvorleistung ist.

## Was offen geblieben ist

- **Test mit Studierenden.** Die Aufgaben T1 bis T5 liegen vor; getestet hat nur das Projektteam. Ob der Folgen-Check Außenstehenden hilft, ist damit nicht belegt.
- **ICS-Import.** Die Dateien entstehen nach dem Standard, der Import in Google Kalender, Apple Kalender und Outlook wurde nicht geprüft.
- **POS.** Das Portal war bei der Umsetzung nicht erreichbar; der Spike zu Anmeldung und Seitenaufbau fand nicht statt. Datenformat, Zuordnung zu den Modulen und Store stehen und sind getestet, in der Oberfläche ist davon nichts zu sehen.
- **Größe des Haupt-Chunks.** Der Build meldet 512 kB (gzip 146 kB) und damit eine Warnung von Vite. Es ist ein Hinweis, kein Fehler.

## Nicht umgesetzte Ideen

1. Notenspiegel-PDF aus dem POS lokal im Browser einlesen: echter Studienstand ohne Zugangsdaten und ohne Schnittstelle; Rückweg, falls sich das Portal nicht auslesen lässt ([ADR 0005](adr/0005-bruecke-fuer-pos-und-mail.md))
2. Assistent mit Volltextsuche über die Paragrafen der Prüfungsordnung statt festem Antwortkatalog, weiter mit Quelle und ohne Sprachmodell
3. Website-Kanal echt: öffentliche Termine der Hochschule regelmäßig per GitHub Action als statische Datei ablegen (Nutzungsbedingungen vorher prüfen)
4. Zweiter Studiengang nur über neue Regel- und Moduldaten
5. Zweite Persona im 4. Semester, vor dem Praxissemester
6. Installierbar und offline nutzbar im schmalen Handy-Browser
7. Notenziel-Rechner: Welche Noten brauche ich für einen bestimmten Schnitt?
8. Studienstand als PDF für das Gespräch mit der Studienberatung
9. Englische Oberfläche
10. Brücke öffentlich betreiben (Vercel-Funktion): erst nach einer eigenen Entscheidung zu Passwörtern auf einem fremden Server
11. Eigene Einstiegsseite vor der App (Problem, Video, Demo); Effekt-Bibliotheken wie Aceternity UI höchstens dort und auf die eigenen Design-Tokens umgestellt, nicht in der Arbeitsoberfläche
