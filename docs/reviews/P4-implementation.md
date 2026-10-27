# Phase 4 – Umsetzungsnachweis

Auftrag: vollständige Phase 4 einschließlich ICS und Tour, direkt von Lucas. Keine Commits, Merges, Veröffentlichung oder Tags durch diese Umsetzung.

## P4-01 Assistent (US-12–US-14; P4/P5, G3)

- Chat, Vorschläge, Anschlussfragen, Quellen und zuständige Stellen, Modulkontext und Anfrageentwurf umgesetzt.
- Freitext-Zuordnung wie mit Lucas abgestimmt präzisiert; Resolver verwenden den aktuellen Studienstand, keine isolierten Was-wäre-wenn-Daten.
- `npm run check`: grün, 241 Tests. Sichtprüfung folgt im gemeinsamen P4-07-Durchgang.

## P4-02 Postfach (US-15/US-16; P1)

- Kanal- und Ungelesenfilter, Wichtigkeitsbegründung, Detail-Sheet mit URL-Zustand und Sync-Status je Kanal umgesetzt.
- Bestehende Persistenz für gelesene Nachrichten weiterverwendet; Originalsysteme bleiben simuliert.
- `npm run check`: grün, 242 Tests. Sichtprüfung folgt in P4-07.

## P4-03 Module & Noten (US-03; P2, G1)

- Semesterliste, Kennzahlen (48 ECTS, 2,4, acht bestandene Module), Detail mit Prüfungsdaten, Moodle und Kontextlinks umgesetzt.
- `npm run check`: grün, 245 Tests. Sichtprüfung folgt in P4-07.

## P4-04 Fristen und ICS (US-05/US-17; G1)

- Kalenderwochen relativ zu DEMO_NOW, Kanalstatus, Einzel- und Gesamtexport umgesetzt.
- ICS nach [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html): CRLF, UTF-8-Zeilenfaltung, Escaping, stabile UID, UTC und exklusive Enddaten für Ganztagsbereiche getestet.
- `npm run check`: grün, 248 Tests. Tatsächlicher Kalenderimport offen: In der Windows-App-Liste wurde kein Kalenderprogramm gefunden. Sichtprüfung und Downloadtest folgen in P4-07.

## P4-05 Benachrichtigungen und Einstellungen (US-18/US-19; G4)

- Glocken-Sheet mit Zähler, Typen, Zeitpunkten, Quellen, Links und Gelesenaktionen; Darstellung, Hinweis-Stil, Kanalstatus und Reset umgesetzt.
- Kanaltrennung behält geladene Daten im Speicher und verwirft laufende Antworten; nach Neuladen zeigt ein getrennter Kanal ohne Daten einen Verbindungszustand.
- Datenversion 3: additive Migration von Version 2 erhält bisherige Einstellungen, Simulationen und Gelesenstatus; neue Felder werden validiert und vorbelegt. Ältere Versionen werden weiter zurückgesetzt.
- `npm run check`: grün, 252 Tests. Sichtprüfung folgt in P4-07.

## P4-06 Onboarding und Tour (US-01/US-02; P1, G2)

- Vier Schritte, Überspringen, Verbindungszustände, Ziel, Nebenjob, Hinweis-Stil und optionale Tour umgesetzt. Nur der erste Aufruf der Übersicht führt ins Onboarding.
- Zielzeile im Folgen-Check berücksichtigt die Zielwahl; Nebenjob fließt über die bestehenden Selektoren in Belastungshinweise ein.
- Bestehende Tests richten ihre ausdrücklich abgeschlossenen Demo-Sitzungen jetzt entsprechend ein; Erststart und Überspringen werden separat geprüft.
- `npm run check`: grün, 254 Tests. Tastatur- und Sichtprüfung folgen in P4-07/P4-08.

## P4-07 Oberfläche und Gesamtprüfung (US-20; Q-2–Q-6)

- 72 Screenshots unter `docs/screens/`: 18 Ansichten × 1440×900/390×844 × hell/dunkel. Alle Ansichten als Kontaktübersichten geprüft, kritische Mobilansichten zusätzlich im Detail. Die Übersicht wartet jetzt ausdrücklich auf den geladenen Studienstand; Modalansichten werden im sichtbaren Viewport aufgenommen.
- Browserprüfung bei 360, 390, 834, 1280, 1440 und 1920 px in beiden Themes. Lange Assistenten-Chips begrenzt; Postfachdetail mobil bildschirmfüllend und mit Abstand zum Schließen-Button.
- Onboarding-Beispieltexte haben eigene Lade-/Fehlerzustände. Alle Fristen tragen Quellen, ungeprüfte Regeln „Beispiel“; keine Hex-Farben, externen Requests oder direkten Datenimporte in neuen UI-Dateien.
- Abschließendes `npm run check`: 255 Tests in 35 Dateien, Typprüfung, Lint und Build grün. Die bestehende Bündelwarnung bleibt: Hauptchunk ca. 755 kB, Recharts getrennt ca. 386 kB. Keine neue Abhängigkeit.
- Browser-Gate: 17 Tests bestanden, ein bewusst übersprungener mobiler Hero-Tastaturtest; Onboarding und Tour auch im mobilen Projekt per Tastatur geprüft. Ein separat gestarteter Preview-Server vermeidet den unter Windows beobachteten Hänger beim automatischen Server-Shutdown nach Testende.

## Geänderte Bereiche

- Neu: Features für Assistent, Postfach, Module, Fristen, Einstellungen und Benachrichtigungen; Onboarding einschließlich Erststart und Tour vervollständigt.
- Store: Selektoren für persönliche Antworten, Postfachbegründungen, Modulstatus und aktive Fristen; persistierte Verbindungen und Benachrichtigungspräferenzen samt defensiver Migration.
- Domain: reine Fragenzuordnung plus Tests; bestehende Domänenregeln und Spezifikationstests unverändert.
- Infrastruktur der Oberfläche: Router, Glocke in der Topbar, Verbindungsbanner, ChannelStatus und getrennte Ressourcen. ICS-Helfer, Unit-/Komponententests und Browser-/Screenshot-Skripte ergänzt.
- Dokumentation: README, KONZEPT, INHALTE, ROADMAP und Phasenberichte; 72 Screenshots erneuert bzw. ergänzt.

## Offen

- Tatsächlicher Kalenderimport: kein entsprechendes Programm in der verfügbaren Windows-App-Liste gefunden. Syntax und Download sind geprüft; ein Import wird nicht als bestanden ausgegeben.
- Unabhängiger Gegencheck durch zweiten Reviewer; die Eigenprüfung in P4.md ersetzt ihn nicht.
- Optionaler Screenreader-Durchgang und reale Mobilgeräte wie schon nach Phase 3; keine Behauptung, dass diese Prüfungen durchgeführt wurden.
- Formale M4-Abnahme, Merge, Veröffentlichung und Tag bleiben Lucas vorbehalten.
