# Product

Kurzfassung für Gestaltungsarbeit. Verbindlich bleiben `docs/KONZEPT.md` (Was), `docs/INHALTE.md` (Inhalte) und `docs/ROADMAP.md` (Reihenfolge). Bei Widerspruch gilt KONZEPT; diese Datei wird dann angepasst, nicht umgekehrt.

## Platform

web

## Users

**Niklas Brandt** (Persona, fiktiv), 20, Wirtschaftsinformatik B. Sc. an der TH Mannheim, 3. Fachsemester, Nebenjob 10–20 Std./Woche, pendelt. Organisiert sein Studium meist abends zu Hause am Laptop, liest Mail, Moodle und Chats nebenbei mehrmals täglich. Entscheidet unter Zeitdruck eher aus dem Bauch, will klare Ansagen und wissen, wo eine Antwort steht. Details: KONZEPT §2.

Jobs: Studienstand prüfen · Prüfungen an- und abmelden · Fristen und Änderungen verfolgen · Regeln klären · Semester mit dem Job planen.

## Product Purpose

StudiCompass bündelt POS, Moodle, Hochschul-Mail und Website, rechnet den Studienstand aus (ECTS Ist/Soll, Ampel, Meilensteine, Abschlussprognose) und zeigt vor einer folgenreichen Entscheidung, etwa einer Prüfungsabmeldung, die Folgen mit Quelle. Erfolg heißt: Niklas weiß ohne eigenes Rechnen, wo er steht, und entscheidet bewusst statt spontan (Hero-Flow „Abmeldung Statistik“, KONZEPT §9).

Liefergegenstand ist ein selbsterklärender, klickbarer Hi-Fi-Prototyp für die Präsentation am Fr, 06.11.2026, kein Produktivsystem.

## Positioning

Warnt nur, wenn eine Sonderregel greift (jährliches Angebot, Zulassung zu einem Meilenstein, Grenze offener Prüfungen), statt pauschal bei jeder Abmeldung. Jede Aussage zu Regeln und Fristen trägt ihre Quelle; ohne eindeutige Regel sagt der Assistent das offen und bereitet eine Anfrage an die zuständige Stelle vor. Die App informiert und lenkt nicht: „Ich trete an“ und „Abmeldung vornehmen“ sind gleich gewichtet.

## Operating Context

- Desktop-first (Laptop am Abend), Kernflow (Übersicht, Folgen-Check) ab 360 px im schmalen Browserfenster vollständig bedienbar. Website im Browser, keine native App.
- Feste Demo-Zeit Mo, 25.01.2027, 19:30 (`DEMO_NOW`); das Szenario liegt kurz vor dem Ende der Abmeldefrist.
- Kanäle POS, Moodle, Mail und Website sind simuliert (Mock-Services mit Latenz, optional Fehler). Abmeldung und Was-wäre-wenn sind Simulationen im Store, rückgängig machbar und als Simulation erkennbar.
- Screens S0–S9 und Navigation: KONZEPT §7–§8.

## Capabilities and Constraints

- Echt berechnet auf Dummy-Daten: ECTS, Soll/Ist, Ampel, Regelprüfung, Folgen-Check, Prognose (Testorakel KONZEPT §10.4).
- Simuliert: alle Hochschul-Schnittstellen, KI-Assistent (vorbereitete belegte Antworten + Stichwortzuordnung + Fallback), Benachrichtigungen nur in der App.
- Kein Backend, keine Authentifizierung, keine Login- oder Passwortfelder, keine Requests an fremde Server, keine Tracker; Schriften lokal.
- Keine Nachbildung echter POS- oder Moodle-Oberflächen; Übergaben nur als neutraler Hinweis („Im echten Betrieb …“).
- Scope ist abschließend in KONZEPT §5; neue Ideen kommen in den Ideenparkplatz (§5.2), nicht in den Prototyp.
- Begriffe laut Glossar KONZEPT §14, insbesondere **Quelle** (Beleg) ≠ **Kanal** (Herkunftssystem).
- Alle SPO-Regeln sind Beispiele, bis sie geprüft sind; ungeprüfte Regeln tragen das Label „Beispiel“.

## Brand Commitments

- Name „StudiCompass“ ist Arbeitstitel und steht nur in `src/config/demo.ts` (`APP_NAME`).
- UI auf Deutsch, Du-Ansprache, kurze Sätze, Fakten zuerst, konkrete Zahlen und Termine, keine Schuldzuweisung; immer „Was heißt das?“ und „Was kannst du tun?“. Wählbarer Hinweis-Stil sachlich/direkt (KONZEPT §12.5, Texte INHALTE §9).
- Gestaltung ist bereits festgelegt (KONZEPT §12, Designrevision P1-07); Referenzbilder in `docs/referenzen/` sind nur lokal und werden nicht nachgebaut.

## Evidence on Hand

- Nutzerforschung: 5 Interviews (3 mit TH-Studierenden), Umfrage n = 8; Auswertung in KONZEPT §1. Fristen verpasst praktisch niemand (8/8), daher kein Kalender als Hauptelement.
- Alle Inhalte (Module, Prüfungen, Fristen, Postfach, Regeln, Assistent) in `docs/INHALTE.md`; Persona-Avatar mit Initialen statt Foto.
- Screenshots der Kernscreens: `docs/screens/` (1440 und 390 px, hell und dunkel).
- Evaluation (Heuristik, Cognitive Walkthrough, Usability-Test T1–T5): `docs/TESTPLAN.md`, Ergebnisse in `docs/evaluation/`.
- Nicht vorhanden und nicht zu erfinden: echte Nutzerdaten, Zitate oder Testimonials, Kennzahlen zur Wirkung, geprüfte SPO-Texte, Logo.

## Product Principles

1. Studienstand zuerst: „Wo stehe ich, was fehlt?“ beantwortet die Übersicht ohne Klick.
2. Warnen nur bei Sonderregeln, damit Hinweise ernst genommen werden.
3. Keine Aussage ohne Quelle; Unsicherheit offen benennen.
4. Informieren statt lenken: Die Entscheidung bleibt bei Niklas, jede Simulation ist verwerfbar.
5. Niklas' Fragen statt POS-Datenmodell: keine Prüfungsnummern im Vordergrund, Semestersicht wie im Studienverlaufsplan.

## Accessibility & Inclusion

WCAG AA: Text ≥ 4,5:1, Bedienelemente und informationstragende Grafiken ≥ 3:1; Status nie nur über Farbe (Icon + Text + Farbe); Kernflow vollständig per Tastatur; sichtbarer Fokus; semantisches HTML; `prefers-reduced-motion`; 360–1920 px ohne horizontales Scrollen (KONZEPT §6.2 Q-4, Q-5).
