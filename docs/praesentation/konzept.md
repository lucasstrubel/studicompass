# Präsentationskonzept – StudiCompass (SE2, Gruppe A)

Stand: 08.11.2026 (App-Stand `3819e9d`, echte StuPO integriert) · Termin: Fr, 13.11.2026 · **15 Minuten, ein Sprecher, vor Ort, keine Abgabe**

**Grundlagen:** Vorlesungen 01–05 · Miro-Board „PVL1" · `claude/StudiCompass-Konzept.md` · „Erkenntnisse aus der Nutzerforschung" · Repo `lucasstrubel/studicompass` (Daten, Regeln, Testszenarien) · Teamrunde und Befundliste vom 28.10. (Git-History, Commit `7e23f87`, `docs/evaluation/`)

---

## 1 Leitidee

**Kernbotschaft (ein Satz, Anfang und Ende):**
_„Dein Studium auf einen Blick – und die Folgen deiner Entscheidungen, bevor du sie triffst."_

**Roter Faden: zwei Stränge durch alle Phasen**

1. **Niklas' Abend als Geschichte.** Der Einstieg ist sein As-Is-Szenario: Er meldet sich spontan von Programmierung 2 ab, und Wochen später geht der Plan nicht mehr auf. Diese Frage bleibt offen, bis die Demo sie mit dem To-Be beantwortet.
2. **Jede Phase endet mit einer Entscheidung.** Jede Phasenfolie folgt demselben Muster:
   **Frage → Methode (Begriff aus der VL) → Ergebnis → Entscheidung, die daraus folgte.**

**Phasen:** Entdecken · Definieren · Lösen · **Prototyping**. Die vierte Phase umfasst Prototyp, teaminternen Test und Iteration.

**Sichtbarer Faden auf den Folien:** Die Signatur der App, die **Kurslinie** mit der Nadel, dient als Fortschrittsleiste der Präsentation. Die vier Phasen sind Stationen auf der Linie, die Nadel steht auf der aktuellen. So nimmt die Präsentation die Bildsprache der App auf, statt ein Diagramm daneben zu stellen.

---

## 2 Ablauf und Zeitbudget

Richtwert: ca. 130 Wörter pro Minute.

| #     | Phase       | Folie (Titel als Aussage)                                           | Zeit | kumuliert |
| ----- | ----------- | ------------------------------------------------------------------- | ---- | --------- |
| 0     | –           | Titel                                                               | 0:20 | 0:20      |
| 1     | Einstieg    | Ein Abend vor der Abmeldefrist                                      | 1:00 | 1:20      |
| 2     | Einstieg    | Unser Weg: vier Phasen, ein Problem                                 | 0:40 | 2:00      |
| 3     | Entdecken   | Wir wussten, was nervt – aber nicht, was wirklich fehlt             | 0:40 | 2:40      |
| 4     | Entdecken   | Nicht die Fristen fehlen, sondern der Überblick                     | 1:30 | 4:10      |
| 5     | Definieren  | Niklas: plant kurzfristig, entscheidet unter Druck                  | 0:50 | 5:00      |
| 6     | Definieren  | Das Problem: Folgen werden erst sichtbar, wenn es zu spät ist       | 1:00 | 6:00      |
| 7     | Lösen       | Ein Flow im Zentrum: prüfen, bevor man entscheidet                  | 0:50 | 6:50      |
| 8     | Lösen       | Vom Moodboard über Skizzen zum Hi-Fi-Prototyp                       | 0:40 | 7:30      |
| 9     | Lösen       | Breit klickbar, im Kern echt gerechnet – auf Basis der echten StuPO | 0:50 | 8:20      |
| 10    | Prototyping | Ein Faden vom Interview bis zum Screen                              | 0:20 | 8:40      |
| 11    | Prototyping | **Live-Demo**                                                       | 3:40 | 12:20     |
| 12    | Prototyping | 23 Befunde aus dem Teamtest – und eine bewusste Abwägung            | 1:10 | 13:30     |
| 13    | Abschluss   | Was der Prototyp bewusst (noch) nicht kann                          | 0:50 | 14:20     |
| 14    | Abschluss   | Kernbotschaft + Danke                                               | 0:20 | 14:40     |
| –     | –           | Puffer                                                              | 0:20 | 15:00     |
| B1–B6 | Backup      | nur bei Rückfragen, siehe §5                                        | –    | –         |

Gewichtung: Problemraum 4:00 · Lösen 2:20 · Prototyping 5:10 · Rahmen 3:10.

---

## 3 Folien im Detail

Pro Folie: **Aussage** (Titel) · **Visual** · **Sprechpunkte** · **Material**.

### Folie 0 – Titel

- **Visual:** Nadel-Logo, „StudiCompass", Kernbotschaft als Untertitel, „SE2 · Gruppe A · WS 26/27", Teamnamen. Die Kurslinie läuft leer über die Folie.
- **Sprechpunkte:** Begrüßung, ein Satz zum Thema.

### Folie 1 – Ein Abend vor der Abmeldefrist

- **Visual:** Fast leer: „Montag, 19:30", darunter drei kurze Zeilen. Kein Bulletpoint-Block.
- **Sprechpunkte:** Niklas fühlt sich in Programmierung 2 schlecht vorbereitet und meldet sich ab. Er denkt: „Das Modul kommt ja nächstes Semester wieder." Dass ihm damit die Bachelorvorprüfung fehlt, die das Unternehmensinformatikprojekt voraussetzt, zeigt ihm kein System. Das Projekt gibt es nur im Sommer. Wochen später merkt er, dass sein Plan nicht mehr aufgeht.
  Schluss mit der Leitfrage: _„Wie könnte Niklas die Folgen sehen, bevor er entscheidet?"_
- **Material:** Persona-Frame, Szenario-Textfeld. **Achtung:** Auf dem Miro-Board steht noch das alte Beispiel (Modul mit jährlichem Angebot). Siehe O-1.

### Folie 2 – Unser Weg: vier Phasen, ein Problem

- **Visual:** Double Diamond groß, Problemraum und Lösungsraum beschriftet. Unter jeder Phase 2–3 Thumbnails eurer Artefakte. Darunter die Kurslinie mit den vier Stationen, die ab jetzt oben mitläuft.
- **Sprechpunkte:** Die Vorlesung folgt dem Double Diamond, unser Projekt auch. Divergieren und Konvergieren in einem Satz.

### Folie 3 – Entdecken: Wir wussten, was nervt – aber nicht, was wirklich fehlt

- **Muster:** _Frage:_ Was wissen wir, wer ist betroffen? · _Methode:_ Stakeholder-Analyse, Forschungsfragen · _Ergebnis:_ Studierende als Hauptnutzer; Professoren, Fakultäten, Verwaltung im Umfeld · _Entscheidung:_ Fokus auf Studierende, Forschungsfragen zu Kanälen, Studienstand und Folgen von Entscheidungen.
- **Visual:** Links Stakeholder-Einordnung (Ausschnitt), rechts 3 Forschungsfragen.
- **Material:** Frames „Stakeholder", „Stakeholder-Einordnung", „Fragen".

### Folie 4 – Entdecken: Nicht die Fristen fehlen, sondern der Überblick

- **Muster:** _Methode:_ 5 Interviews (3 mit TH-Studierenden) + Umfrage (n = 8) · _Entscheidung:_ Der Studienstand wird das zentrale Element, kein Kalender.
- **Visual:** Drei große Kennzahlen, darunter eine durchgestrichene Annahme:
  - **4 / 8** wissen kaum, wie viele ECTS ihnen fehlen
  - **Ø 3,7 / 5** – Infos auf vielen Kanälen „stören" (WI)
  - **Ø 2,1 / 5** – Planung über mehrere Semester
  - ~~„Studierende verpassen Fristen"~~ → **8 / 8 ohne verpasste Frist**
- **Sprechpunkte:** Die Überraschung ist der Höhepunkt der Folie. Zweiter Befund: Folgen sind **nur bei Sonderregeln** unklar, etwa bei Zulassungen zum Projekt- oder Praxissemester. Kleine Stichprobe, also Tendenzen.
- **Material:** Frames „Interviews", „Umfrage", Dokument „Erkenntnisse aus der Nutzerforschung".

### Folie 5 – Definieren: Niklas plant kurzfristig und entscheidet unter Druck

- **Muster:** _Methode:_ Persona, Nutzungskontext (Nutzer / Aufgaben / Umgebung) · _Entscheidung:_ Desktop-first (8/8 organisieren zu Hause, 6/8 am Laptop), Kernflow trotzdem mobil.
- **Visual:** Persona-Karte. Niklas Brandt, 20, Unternehmens- und Wirtschaftsinformatik, 3. Semester, Nebenjob, pendelt. Daneben N / A / U mit je 2 Stichworten.
- **Sprechpunkte:** Nur was später im Prototyp sichtbar wird: kurzfristige Planung, Druck, klare Ansagen, Quelle bei KI-Antworten.
- **Material:** Persona-Frame.

### Folie 6 – Definieren: Folgen werden erst sichtbar, wenn es zu spät ist

- **Muster:** _Methode:_ Value Proposition Canvas · _Ergebnis:_ 5 Pains, 4 Gains · _Entscheidung:_ Problemdefinition + Gestaltungsregel „Warnen nur, wenn eine Sonderregel greift".
- **Visual:** VPC vereinfacht: P1 verteilte Infos, P2 ECTS selbst rechnen, P3 Folgen von Sonderregeln, jeweils mit Pain Reliever. Unten die Problemdefinition als ein Satz.
- **Sprechpunkte:** Hier schließt sich der erste Diamant. Pauschale Warnungen erzeugen Hinweis-Müdigkeit und sind durch die Daten nicht gedeckt.
- **Material:** Frame „Value Proposition Map".

### Folie 7 – Lösen: Ein Flow im Zentrum – prüfen, bevor man entscheidet

- **Muster:** _Frage:_ Wie lösen wir das Problem? · _Methode:_ Exposé, User Story Map, UX Flow Chart · _Entscheidung:_ ein Hero-Flow (Folgen-Check vor der Abmeldung). Der Rest wird priorisiert oder kommt auf den Ideenparkplatz.
- **Visual:** UX Flow Chart, Hero-Flow hervorgehoben, der Rest abgedunkelt. Klein daneben der Backbone der Story Map.
- **Sprechpunkte:** MVP als Querschnitt: lieber ein Flow vollständig als viele halbfertige Screens.
- **Material:** Frames „Exposé", „UX Flow Chart".

### Folie 8 – Lösen: Vom Moodboard über Skizzen zum Hi-Fi-Prototyp

- **Visual:** **Ein Screen über drei Fidelity-Stufen:** Moodboard → handgezeichnetes Wireframe der Übersicht → heutige Übersicht mit Kurslinie.
- **Sprechpunkte:** Begriffe aus VL05: Lo-Fi für schnelle Iteration, Hi-Fi für Test und Kommunikation. Eine konkrete Änderung zwischen Skizze und Prototyp benennen, z. B. den Kalender der Referenz, ersetzt durch Studienstand und „Jetzt wichtig" (Folie 4). Optional ein Satz zur Identität: Die visuelle Sprache wurde während der Iteration weiterentwickelt, von „Warm Ink" zu Graphit/Mandarine mit der Kurslinie als Signatur. Den Grund dafür formuliert ihr selbst.
- **Material:** Frame „Moodboard A", Wireframe-Skizzen (Board-Bereich unter den Frames), aktueller Screenshot der Übersicht.

### Folie 9 – Lösen: Breit klickbar, im Kern echt gerechnet – auf Basis der echten StuPO

- **Visual:** Schichtendiagramm aus VL05 (GUI / Application Logic / Network / OS / Data / Other Systems), horizontaler Balken über die GUI, schmaler vertikaler Balken durch GUI + Logik + Daten. Daneben zwei Spalten:
  - **echt:** Module laut Modulhandbuch UIB, Regeln aus der **StuPO Bachelor (ab 01.09.2026)** mit Paragraf, ECTS, Ampel, Prognose. Unit-getestet.
  - **simuliert:** POS, Moodle, Mail, Website, Assistent (vorbereiteter Antwortkatalog), Abmeldung, Niklas' Noten und Termine.
- **Sprechpunkte:** Das ist ein starker Punkt: Die Regeln sind keine Erfindung mehr, sondern stehen mit Paragraf in der StuPO. Eigene Rechenregeln der App (Ampel-Schwellen, Belastungshinweis) tragen in der App das Label „Beispiel". Der Assistent ist bewusst keine echte KI: deterministisch, keine Halluzination, jede Antwort mit Quelle.
- **Material:** `src/data/rules.ts` (DR-1 bis DR-16), Folie „Horizontal vs. Vertikal" aus VL05 als Vorlage.

### Folie 10 – Prototyping: Ein Faden vom Interview bis zum Screen

- **Visual:** Kette mit fünf Gliedern auf der Kurslinie:
  Interview I1 (Aussage zu Folgen einer Entscheidung, siehe O-2) → **P3** Folgen von Sonderregeln → **US-06** Folgen vor der Abmeldung sehen → **S4** Folgen-Check → ▶ Demo
- **Sprechpunkte:** „So hängt alles zusammen. Jetzt sehen wir, wie das für Niklas aussieht." Ohne Pause in die Demo.

### Folie 11 – Live-Demo (3:40) → Drehbuch in §4

### Folie 12 – Prototyping: 23 Befunde aus dem Teamtest – und eine bewusste Abwägung

- **Muster:** _Frage:_ Wo hakt der Prototyp? · _Methode:_ Jedes der vier Teammitglieder hat alle Funktionen einzeln getestet. Danach gemeinsame Sammelliste (28.10.). · _Ergebnis:_ 23 Befunde, 22 umgesetzt, 1 bewusst auf den Ideenparkplatz · _Entscheidung:_ Iteration vor der Präsentation.
- **Visual:** Links ein Vorher/Nachher-Paar, empfohlen Studienverlauf: Vorher stand das Ergebnis einer Verschiebung weit weg von der Aktion, nachher erscheint ein Ergebnis-Dialog direkt an der Aktion. Rechts als Kasten **„Feedback gegen Forschung abwägen"**: Das Team wünschte sich einen Kalender. Die Forschung sagt, Fristen sind der schwächste Pain. Lösung: Kalender als zusätzliche Ansicht unter „Fristen", **nicht** auf der Übersicht.
- **Sprechpunkte:** Diese Abwägung ist die interessanteste Aussage der Folie. Sie zeigt, dass ihr Feedback nicht blind umgesetzt, sondern mit der eigenen Forschung abgeglichen habt. Die Grenze ehrlich nennen, ohne sich zu entschuldigen: Getestet hat das Team selbst. Wer das System gebaut hat, kennt es und stolpert anders als jemand aus der Zielgruppe. Ein Test mit unabhängigen Studierenden im Sinne der VL (z. B. Thinking Aloud) ist der nächste Schritt.
- **Material:** Befundliste P5-F11 bis P5-F33 und Teamrunde (Git-History `7e23f87`, `docs/evaluation/`). Vorher-Screenshots unter `docs/screens/` im Commit `fc12aad`. **Nachher-Screenshots neu aufnehmen**, weil sich das Design seitdem geändert hat (siehe O-4).

### Folie 13 – Was der Prototyp bewusst (noch) nicht kann

- **Visual:** Zwei Spalten. **Grenzen:** Daten von Niklas erfunden (Module und Regeln echt) · keine echten Schnittstellen · Assistent ohne echte KI · nur teaminterner Test. **Nächste Schritte:** Usability-Test mit Studierenden aus dem Persona-Segment (Testaufgaben T1–T5 liegen vor) · Anbindung klären mit IT/Rechenzentrum, Datenschutz, Praktikantenamt, Studienberatung. Klein darunter: Ideenparkplatz (2–3 Beispiele, z. B. zweite Persona im 4. Semester).
- **Sprechpunkte:** Kurz und sachlich bleiben. Die Folie nimmt kritische Rückfragen vorweg.

### Folie 14 – Schluss

- **Visual:** Die Kernbotschaft groß, die Kurslinie komplett mit der Nadel am Ziel, QR-Code zur Vercel-URL, Danke.
- **Sprechpunkte:** Ein Satz zurück zu Niklas: Er entscheidet jetzt informiert statt aus dem Bauch. Danach Fragen.

---

## 4 Demo-Drehbuch (Folie 11, 3:40)

Werte aus den Testszenarien im Repo (`src/domain/projection.spec.ts`, Basis und Szenarien A und D). Vor dem Probedurchlauf live gegenprüfen.

**Vorbedingungen:** Einstellungen → „Demo zurücksetzen" → „Demo ohne Einrichtung starten" · Demo-Zeit Mo, 25.01.2027, 19:30 · Hinweis-Stil festlegen (O-3) · Browser-Zoom 100 % · Start auf der Übersicht · keine eigenen Termine, Notizen oder Vorleistungen eintragen.

| Zeit      | Aktion                                                                                                                                         | Was man sieht                                                                                                                                                                                                                                                    | Satz dazu (sinngemäß)                                                                                                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:30 | Übersicht zeigen, nicht klicken                                                                                                                | **45** ECTS, Soll 60, Ampel **Knapp**; Prognose zum Semesterende **75 von 90**; „Jetzt wichtig": Programmierung 2, Abmeldefrist morgen 23:59                                                                                                                     | „Das ist Niklas' Abend aus Folie 1. Er muss nichts mehr selbst rechnen. Und die App meldet sich nur, weil hier eine Sonderregel greift."                                                                                                               |
| 0:30–1:30 | „Folgen prüfen" → Folgen-Check                                                                                                                 | Abmelden: nächster Termin schon **SS 2027**, aber Prognose **65 von 90**, **Kritisch**; Unternehmensinformatikprojekt **SS 2027 → SS 2028**; Abschluss **WS 2028/29 → SS 2029**                                                                                  | Einmal „Warum?" öffnen: Das Projekt setzt die Bachelorvorprüfung voraus (StuPO § 56 Abs. 2) und läuft nur im Sommer. „Das Modul selbst kommt nächstes Semester wieder – das Projekt wartet trotzdem ein Jahr."                                         |
| 1:30–2:05 | „Abmeldung vornehmen" → bestätigen → Übersicht → **Rückgängig** im Folgen-Check                                                                | Übersicht: Kritisch, 65 von 90, Projekt verschoben                                                                                                                                                                                                               | „Beide Optionen sind gleich gewichtet – die App informiert, sie entscheidet nicht. Und alles lässt sich zurücknehmen." Rückgängig über den dauerhaften Button im Folgen-Check, nicht über den kurzen Toast.                                            |
| 2:05–2:40 | Module & Noten → Wirtschaftsinformatik 3 → Folgen einer Abmeldung prüfen                                                                       | **70 von 90**, bleibt **Knapp**, kein Meilenstein verschoben; nur Belastungshinweis „Hohe Belastung im SS 2027" (**45 ECTS** bei 15 Std. Nebenjob). Der zweite Hinweis (WS 2027/28, 35 ECTS) steht unter „Gilt unabhängig von deiner Entscheidung" und bleibt zu | **Pointe:** „Auch Wirtschaftsinformatik 3 gibt es jedes Semester. Die Abmeldung macht nur das Sommersemester voller. Ob eine Abmeldung harmlos ist, hängt nicht am Modul, sondern an der Regel dahinter – genau das konnte Niklas vorher nicht sehen." |
| 2:40–3:10 | Assistent: Vorschlagsfrage „Was passiert, wenn ich Programmierung 2 schiebe?"                                                                  | Kurzantwort, „Für dich heißt das: …", Quelle, zuständige Stelle                                                                                                                                                                                                  | „Dieselbe Regel in Alltagssprache, mit Quelle. Das Vertrauen in KI war gespalten – deshalb steht jede Antwort auf einer Quelle."                                                                                                                       |
| 3:10–3:40 | Freitext: „Kann ich das Praxissemester im Ausland machen und Betriebswirtschaftslehre 3 im selben Semester schreiben?" → „Anfrage vorbereiten" | Ehrlicher Hinweis „keine eindeutige Regel", Anlaufstelle Praktikantenamt, kopierbarer Entwurf                                                                                                                                                                    | „Bei echten Sonderfällen erfindet der Assistent nichts. Er nennt die Grenze und bereitet die Anfrage an die zuständige Stelle vor. Gesendet wird nichts."                                                                                              |

**Bewusst nicht in der Demo:** Onboarding, Postfach, Fristen und Kalender, Studienverlauf, Anlaufstellen, Einstellungen. Bei Rückfragen live zeigen.
**Wenn die Zeit knapp wird:** zuerst den Fallback streichen, dann den Assistenten. Niemals den Vergleich Programmierung 2 / Wirtschaftsinformatik 3.
**Vorlage:** Das Demo-Skript für den 06.11. (`docs/praesentation/DEMO-SKRIPT.md` im Commit `7e23f87`) hat dieselbe Dramaturgie und eine gute Liste „Falls etwas nicht klappt". Die Werte dort beziehen sich noch auf Statistik/Marketing.

---

## 5 Backup-Folien (nach der Schlussfolie)

| #   | Inhalt                                                                                       | Wofür                          |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| B1  | ISO 9241-110 → Umsetzung (Konzept §13.1)                                                     | „Welche Usability-Prinzipien?" |
| B2  | Regeln DR-1 bis DR-16 mit StuPO-Paragraf, eigene Rechenregeln markiert                       | „Stimmen die Regeln?"          |
| B3  | Priorisierung / User Story Map komplett                                                      | „Was habt ihr weggelassen?"    |
| B4  | Tech-Stack und Arbeitsweise (Claude Code als Programmierer, Codex als Review, Tests, Vercel) | „Wie habt ihr das gebaut?"     |
| B5  | Befundliste der Teamrunde (23 Punkte, gruppiert)                                             | „Was kam im Test heraus?"      |
| B6  | Video oder Screenshots des Hero-Flows                                                        | Fallback bei Demo-Ausfall      |

---

## 6 Technische Umsetzung (festgelegt)

**Entscheidung:** reveal.js-Präsentation **im App-Repo, auf derselben Vercel-Domain**. Die Demo läuft **per iframe direkt auf Folie 11**: kein Fensterwechsel, kein Live Server.

| Baustein           | Umsetzung                                                                                                                                                                                              | Warum                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Framework          | reveal.js, lokal eingebunden (kein CDN)                                                                                                                                                                | Tastatur, Sprecheransicht, Fragmente; offline lauffähig                     |
| Ort                | eigener Ordner in `public/`, z. B. `/praesentation/`                                                                                                                                                   | ein Deployment, gleiche Herkunft für iframe und `postMessage`               |
| Design             | Tokens der App: Graphit `#17171a`, Hintergrund `#f6f6f7`, Mandarine `#ff5c1f` (nur als Fläche/Akzent, nicht als Fließtext auf Hell), Bricolage Grotesque für Titel, Hanken Grotesk für Text            | Folien und App aus einem Guss                                               |
| Roter Faden        | Kurslinie mit Nadel als Fortschrittsleiste, Stationen = vier Phasen, aktive Station per `data-phase` am Abschnitt                                                                                      | greift die Signatur der App auf                                             |
| Format             | Folienfläche 1920×1080, reveal.js skaliert                                                                                                                                                             | App bei 1440×900 entworfen, passt in 16:9                                   |
| Demo-Folie         | iframe ohne Rahmen, App im Präsentationsmodus (z. B. `?praesentation=1`)                                                                                                                               | nahtloser Übergang                                                          |
| Tastatur im iframe | Im Präsentationsmodus fängt die App `PageDown`/`PageUp` ab und schickt sie per `postMessage` an die Präsentation. Ein Presenter-Clicker sendet genau diese Tasten.                                     | Sonst bleibt man nach dem ersten Klick in die App auf der Demo-Folie hängen |
| Sprecheransicht    | Speaker Notes (Taste `S`) auf dem Laptop                                                                                                                                                               | ein Sprecher: Notizen + Timer                                               |
| Miro-Material      | Frames als PNG exportieren                                                                                                                                                                             | kein Live-Wechsel ins Board                                                 |
| Fallback           | (1) lokal per `build` + `preview` · (2) Video des Hero-Flows (B6). Die Aufnahme-Skripte vom 06.11. liegen in der Git-History unter `scripts/presentation/` (`7e23f87`) und lassen sich wiederverwenden | Vercel braucht WLAN                                                         |

**Vor dem Bau prüfen:**

- `vercel.json` schreibt alle Pfade auf `/index.html` um. Vercel liefert vorhandene Dateien eigentlich vor Rewrites aus. Den Pfad `/praesentation/` trotzdem nach dem ersten Deployment testen.
- Gleiche Domain heißt gleicher `localStorage`: vor dem Vortrag „Demo zurücksetzen".
- Beamer-Test, wenn möglich: Lesbarkeit der Vergleichstabelle im Folgen-Check aus der letzten Reihe. Falls nötig, im Präsentationsmodus den Zoom erhöhen.

---

## 7 Offene Punkte

| ID  | Punkt                                                                                                                                                                                                                                             | Wer / bis                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| O-1 | As-Is-Szenario auf dem Miro-Board nennt noch das alte Beispiel. Empfehlung: Auf Folie 1 das neue Beispiel (Programmierung 2) verwenden und auf Folie 9 einen Satz sagen: „Mit der echten StuPO hat sich das Beispiel geändert, das Muster nicht." | Team                     |
| O-2 | Interview-Aussage für Folie 10 aus den Notizen übernehmen (anonymisiert, sinngemäß)                                                                                                                                                               | Team                     |
| O-3 | Hinweis-Stil für die Demo: „Direkt" (wirkt stärker) oder „Sachlich"                                                                                                                                                                               | Team                     |
| O-4 | Vorher/Nachher-Paar für Folie 12 auswählen; Nachher im aktuellen Design neu aufnehmen                                                                                                                                                             | Lucas                    |
| O-5 | Teamnamen und Vercel-URL für Titel- und Schlussfolie                                                                                                                                                                                              | Team                     |
| O-6 | Zwei Probedurchläufe mit Stoppuhr, einer davon mit Beamer                                                                                                                                                                                         | Sprecher, bis Do, 12.11. |
