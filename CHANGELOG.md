# Changelog

Alle nennenswerten Änderungen an StudiCompass. Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## [Unveröffentlicht]

### Hinzugefügt

- Roadmap für die Weiterentwicklung als Portfolio-Projekt (`docs/ROADMAP.md`)
- Architekturentscheidungen unter `docs/adr/`
- Moodle-Sandbox unter `infra/moodle/` (Docker) mit Beispielkursen zu den Modulen des 3. Semesters
- Befunde aus dem Moodle-Spike (`docs/adr/0004-moodle-spike.md`)
- Moodle-Adapter gegen die echten Web Services: Fortschritt, Fristen und Ankündigungen je Modul
- Einstellungen → Moodle-Daten: Beispieldaten, Aufzeichnung oder ein eigenes Moodle per Zugriffsschlüssel
- Integrationstests gegen die Sandbox (`npm run test:moodle`) und Workflow `moodle.yml`
- „Neu in Moodle“: Änderungen in den Kursen seit dem letzten Abgleich am Modul, im Postfach und an der Glocke
- Kursinhalt je Modul mit Dateien, Abgaben, Abgabestatus und Bewertung
- Prüfungsvorleistungen planen: Teilschritte und geplanter Aufwand je Eintrag, Übersicht über das Semester
- Eigene Einträge in Moodle sichern und auf einem anderen Gerät laden (Datei in den privaten Dateien des verbundenen Moodle)
- Abgaben aus Moodle als Prüfungsvorleistung übernehmen; den Stand aus Moodle schlägt die App vor, bestätigt wird von Hand
- Brücke (`server/`): kleiner zustandsloser Server-Teil im lokalen Dev- und Preview-Server für Kanäle, die der Browser nicht erreicht (`docs/adr/0005-bruecke-fuer-pos-und-mail.md`)
- Einstellungen → Hochschul-Mail: Beispieldaten oder das eigene Hochschul-Postfach (IMAP, nur lesend); in der öffentlichen Demo ohne Brücke ein Hinweis statt des Formulars
- Mail-Sandbox unter `infra/mail/` (GreenMail), Integrationstests (`npm run test:mail`) und Workflow `mail.yml`
- Gerüst für das POS über die Brücke: neutrales Format der Leistungsübersicht, Zuordnung zu den Modulen, Quelle im Store; das Auslesen des Portals folgt

### Sicherheit und Qualität

- Content-Security-Policy im Produktions-Build und Sicherheits-Header für die Auslieferung
- Automatischer Barrierefreiheits-Check (axe, WCAG 2.1 A und AA) aller Kernseiten in den End-to-End-Tests
- Dependabot für npm, GitHub Actions und das Docker-Image der Sandbox; CodeQL bei jedem Pull Request
- `docs/SICHERHEIT.md`: Datenflüsse, Umgang mit dem Zugriffsschlüssel, Bedrohungen und Grenzen

## [1.0.0] – 2026-11-13

Der Stand, in dem der Prototyp im Modul Software Engineering 2 vorgestellt wurde.

### Hinzugefügt

- Übersicht mit Studienstand, ECTS-Verlauf als Kurslinie und „Jetzt wichtig“
- Folgen-Check mit simulierter Abmeldung und Rückgängig
- Studienverlauf mit Was-wäre-wenn, auch per Drag & Drop
- Assistent mit vorbereitetem Antwortkatalog, Quellen und zuständigen Stellen
- Postfach über vier Kanäle, Fristen als Liste und Kalender mit ICS-Export, Module & Noten
- Prüfungsvorleistungen und eigene Termine, Anlaufstellen, Onboarding mit Tour
- Regeln aus der StuPO Bachelor der TH Mannheim, Module aus dem Modulhandbuch UIB
- Prüf-Gate und End-to-End-Tests in GitHub Actions

[Unveröffentlicht]: https://github.com/lucasstrubel/studicompass/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lucasstrubel/studicompass/releases/tag/v1.0.0
