# Testplan – Evaluation des Prototyps (Phase 5)

Grundlage: VL01 (Test-Methoden: Usability-Test, Usability-Inspektion, Befragung) und VL05 (ISO 9241-110, Nielsen, Seven Stages of Action).
Ziel: prüfen, ob der Prototyp die Idee **selbsterklärend** vermittelt und ob Niklas' Kernaufgaben effektiv, effizient und zufriedenstellend lösbar sind (Gebrauchstauglichkeit nach ISO 9241-11).

Reihenfolge: erst Inspektion durch das Team (billig, findet offensichtliche Probleme), dann Test mit Nutzer:innen (findet, was das Team nicht sieht – „Du bist nicht der Nutzer“, VL03).

---

## 1 Heuristische Evaluation (Team, Di 03.11., ca. 45 Min.)

- Jede Person prüft **allein** alle Screens gegen die 7 Dialogprinzipien (ISO 9241-110) und Nielsens 10 Heuristiken; danach Befunde zusammenführen und Dubletten streichen.
- Schweregrad (verbreitete Skala nach Nielsen; nicht aus den Folien): 0 kein Problem · 1 kosmetisch · 2 gering · 3 schwer · 4 kritisch.

| # | Screen | Befund | Prinzip / Heuristik | Schwere | Vorschlag |
|---|---|---|---|---|---|
| 1 | | | | | |

---

## 2 Cognitive Walkthrough des Hero-Flows (Team, ca. 20 Min.)

Für jeden Schritt aus KONZEPT §9 diese Fragen beantworten (gängige Walkthrough-Fragen, nicht aus den Folien):
1. Will Niklas an dieser Stelle das Richtige erreichen?
2. Erkennt er, dass die richtige Aktion verfügbar ist?
3. Verbindet er die Aktion mit seinem Ziel?
4. Sieht er nach der Aktion, dass er vorankommt?

Jedes „Nein“ ist ein Befund mit Bezug zur Stufe nach Norman (Ausführung oder Auswertung).

---

## 3 Usability-Test mit Thinking Aloud (Di 03.11. – Mi 04.11.)

**Teilnehmende:** 3–5 WI-Studierende im Grundstudium, möglichst mit Nebenjob (Persona-Segment). Niemand aus dem eigenen Team.
**Rollen:** Moderation und Protokoll (wie bei den Interviews, VL02).
**Gerät:** Laptop (Hauptnutzungssituation); eine Person optional am Smartphone.
**Dauer:** ca. 20 Min. je Person.

### 3.1 Ablauf
| Min. | Schritt |
|---|---|
| 2 | Begrüßung, Einverständnis (Notizen, keine Aufnahme ohne Zustimmung) |
| 1 | Szenario vorlesen |
| 12 | Aufgaben T1–T4 (T5 optional) mit lautem Denken |
| 5 | Abschlussfragen |

**Einleitung (vorlesen):** „Wir testen den Prototyp, nicht dich – du kannst nichts falsch machen. Bitte sag laut, was du denkst, was du suchst und was du erwartest. Ich helfe nur, wenn du gar nicht weiterkommst.“

**Szenario (vorlesen):** „Stell dir vor, du bist Niklas: 3. Semester Wirtschaftsinformatik, Nebenjob mit 15 Stunden pro Woche. Es ist Montagabend, der 25. Januar. In dieser Woche beginnt deine Klausurphase.“

### 3.2 Aufgaben

| ID | Aufgabe (vorlesen) | Erfolgskriterium | Bezug |
|---|---|---|---|
| T1 | „Finde heraus, wie viele ECTS dir gerade zum Regelverlauf fehlen und was dir noch bis zum Praxissemester fehlt.“ | nennt 12 ECTS Rückstand und die offenen Grundstudiums-Module | US-03, US-04 · P2, G1 |
| T2 | „Du fühlst dich in Statistik schlecht vorbereitet. Finde heraus, was eine Abmeldung für dein Studium bedeuten würde, und triff eine Entscheidung.“ | öffnet den Folgen-Check, nennt mindestens eine Folge (Praxissemester oder Abschluss) und begründet die Entscheidung | US-06–US-08 · P3, G2, G4 |
| T3 | „Finde heraus, wie oft du eine Prüfung höchstens ablegen darfst und wo das geregelt ist.“ | nennt 3 Versuche und zeigt die Quelle | US-12 · P5, G3 |
| T4 | „Was ist seit Freitag Neues, das dich betrifft?“ | findet die Raumänderung Statistik oder das Tutorium | US-15, US-16 · P1 |
| T5 | *(optional)* „Was würde passieren, wenn du statt Statistik Marketing schiebst?“ | erkennt: keine Verschiebung des Praxissemesters, aber höhere Belastung im SS 2027 | US-10 · P3 |

Erfasst wird je Aufgabe: Erfolg (ja / mit Hilfe / nein), Zeit, Umwege oder Fehler, wörtliche Zitate.

### 3.3 Abschlussfragen
1. „Wie sehr würdest du den angezeigten Folgen und Antworten vertrauen – von 1 bis 5? Warum?“ *(Vertrauen in KI war in der Forschung gespalten.)*
2. „Was war unklar oder hat dich überrascht?“
3. „Was hat dir am meisten geholfen?“
4. „Würdest du so etwas nutzen? Statt was machst du das heute?“
5. „Was bedeuten für dich ‚Knapp' und ‚Kritisch'?“ *(prüft Annahme A-3 / DR-3)*

### 3.4 Protokollvorlage

| Person | Aufgabe | Erfolg | Zeit | Beobachtung / Umweg | Zitat |
|---|---|---|---|---|---|
| P1 | T1 | | | | |

---

## 4 Auswertung und Iteration (Mi 04.11.)

1. Alle Befunde (Inspektion und Test) in eine Liste: Befund · betroffener Screen · verletztes Prinzip · Schwere · Häufigkeit.
2. Top 5 nach Schwere × Häufigkeit auswählen → Claude Code setzt um (P5-04).
3. Was nicht mehr umgesetzt wird → Ideenparkplatz (KONZEPT §5.2) oder Ausblick-Folie.
4. Für die Präsentation: drei Kernbefunde, was daraufhin geändert wurde, und was offen bleibt – das zeigt die Iteration im UCD-Prozess (VL01).
