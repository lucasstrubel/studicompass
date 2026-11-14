# Roadmap

Version 1.0.0 ist der Prototyp, wie er im November 2026 als Prüfungsleistung vorgestellt wurde: in der Breite klickbar, im Kern echt gerechnet, alle Hochschulsysteme simuliert, getestet nur vom Projektteam. Die Weiterentwicklung schließt diese beiden Lücken: ein Test mit Studierenden, die den Prototyp nicht kennen, und eine echte Schnittstelle zu Moodle.

Stand November 2026: Die Phasen 0 und 2 bis 6 sind umgesetzt. Aus Phase 1 steht der Test mit Studierenden aus; ihr automatisierbarer Teil (Barrierefreiheits-Check) ist erledigt. Phase 7 läuft mit jeder Phase mit.

Der Arbeitsstand steht in den [Meilensteinen auf GitHub](https://github.com/lucasstrubel/studicompass/milestones). Die Entscheidungen dahinter stehen unter [`adr/`](adr/).

## Phasen

| Phase | Inhalt                                                                                                                                             | Ergebnis                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 0     | Aufsetzen: Roadmap, Architekturentscheidungen, Changelog                                                                                           | dieser Stand                              |
| 1     | Validieren: Usability-Test mit fünf Studierenden, Messung (Aufgabenerfolg, Zeit, SUS), ICS-Import in echten Kalendern, automatischer A11y-Check    | Version 1.1.0, Kapitel „Validieren“       |
| 2     | Moodle-Spike: eigene Moodle-Instanz per Docker mit Beispielkursen, Zugriff aus dem Browser, Auswahl der Webservice-Funktionen                      | Befunde und Zuordnung Moodle → Fachmodell |
| 3     | Moodle-Adapter, lesend: Service gegen die echte Schnittstelle, Datenmodi Demo, Aufzeichnung und Live, Verbinden per Zugriffsschlüssel, Fehlerfälle | erster Kanal ohne Mock                    |
| 4     | Funktionen auf echten Daten: „Neu in Moodle“ je Modul, Fristen aus Moodle, Prüfungsvorleistungen planen und verfolgen                              | Version 1.2.0                             |
| 5     | Moodle als Backend: eigene Daten der App in Moodle speichern, gleicher Stand auf mehreren Geräten, über ausdrückliches Sichern und Laden           | Abgleich ohne eigene Datenbank            |
| 6     | Qualität und Betrieb: Integrationstests gegen einen Moodle-Container in GitHub Actions, Sicherheit und Datenschutz dokumentiert                    | begleitend ab Phase 3                     |
| 7     | Schaufenster: README, Architekturbild, Video, Prozessdokumentation                                                                                 | Version 2.0.0                             |

Phase 1 läuft parallel zu Phase 2 und 3, weil die Suche nach Testpersonen Vorlauf braucht.

## Was „Neu in Moodle“ und Prüfungsvorleistungen heißen

- **Neu in Moodle.** Lädt eine Lehrperson eine Datei hoch, ändert eine Aufgabe oder schreibt eine Ankündigung, erscheint das beim Modul, im Postfach und an der Glocke. Die App vergleicht dazu den Kursinhalt mit dem zuletzt gesehenen Stand.
- **Prüfungsvorleistungen.** Heute lassen sie sich je Modul eintragen und abhaken. Dazu kommen Teilschritte, geplanter Aufwand und eine Übersicht über das Semester. Eine Aufgabe aus Moodle lässt sich als Prüfungsvorleistung übernehmen; ihren Abgabe- und Bewertungsstatus schlägt die App vor, bestätigt wird von Hand. Moodle weiß nicht, was laut Modulhandbuch eine Prüfungsvorleistung ist.

## Ideen ohne Termin

1. Notenspiegel-PDF aus dem POS lokal im Browser einlesen: echter Studienstand ohne Zugangsdaten und ohne Schnittstelle
2. Assistent mit Volltextsuche über die Paragrafen der Prüfungsordnung statt festem Antwortkatalog, weiter mit Quelle und ohne Sprachmodell
3. Website-Kanal echt: öffentliche Termine der Hochschule regelmäßig per GitHub Action als statische Datei ablegen (Nutzungsbedingungen vorher prüfen)
4. Zweiter Studiengang nur über neue Regel- und Moduldaten
5. Zweite Persona im 4. Semester, vor dem Praxissemester
6. Installierbar und offline nutzbar im schmalen Handy-Browser
7. Notenziel-Rechner: Welche Noten brauche ich für einen bestimmten Schnitt?
8. Studienstand als PDF für das Gespräch mit der Studienberatung
9. Englische Oberfläche
10. Mail-Kanal: aus dem Browser nicht anbindbar, bleibt bewusst simuliert
11. Eigene Einstiegsseite vor der App (Problem, Video, Demo); Effekt-Bibliotheken wie Aceternity UI höchstens dort und auf die eigenen Design-Tokens umgestellt, nicht in der Arbeitsoberfläche
