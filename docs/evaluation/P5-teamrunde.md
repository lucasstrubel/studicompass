# P5 – dokumentierte Teamrunde und Iteration

Stand: 30.10.2026. Grundlage ist die bereits vorhandene Sammelliste vom 28.10.2026 (P5-F11 bis P5-F33). Lucas hat die Durchführung und Methode im Gespräch bestätigt.

## Durchführung

- Vier Mitglieder des Projektteams haben individuell alle Funktionen getestet.
- Anschließend hat das Team gemeinsam Feedback notiert.
- Diese Runde war die Grundlage der Änderungen und Ergänzungen P5-08 bis P5-15. Sie hat bereits stattgefunden; sie ist kein noch ausstehender Testtermin.
- Im Repository liegt die gemeinsame Befundliste vor. Personenbezogene Einzelprotokolle, Aufgabenzeiten, Erfolgsquoten, wörtliche Zitate und eine Zuordnung einzelner Befunde zu Personen liegen nicht vor. „2 Nennungen“ in der Sammelliste ist keine belegte Anzahl unterschiedlicher Personen.

Die Methode wird als individueller Funktionstest mit gemeinsamer Feedbackrunde dokumentiert. Ein Thinking-Aloud-Test mit unabhängigen Personen aus dem Persona-Segment oder ein gesondertes Nielsen-/Walkthrough-Protokoll ist dadurch nicht nachgewiesen. Die Teamrunde liefert qualitative Hinweise für die Iteration, keine repräsentativen Aussagen über Studierende und keine gemessene Vorher-/Nachher-Verbesserung.

## Auswertung und Umsetzungsentscheidung

Die 23 Einträge der Sammelliste sind in der [Befundliste](P5-auswertung.md) erhalten. Lucas hat den Umsetzungsumfang über die Roadmap P5-09 bis P5-15 freigegeben. Damit ist die Entscheidung nachvollziehbar, auch wenn sich nachträglich keine numerische Top-5-Rangfolge aus Schweregrad und Personenhäufigkeit berechnen lässt.

P5-F11 bis P5-F32 sind umgesetzt, unabhängig geprüft und mit [PR #29](https://github.com/lucasstrubel/studicompass/pull/29) nach `main` integriert (`7e035c4`). P5-F33 bleibt gemäß Lucas' Entscheidung im Ideenparkplatz: Die Demo-Persona bleibt im 3. Semester.

## Drei belegte Kernbefunde für die Präsentation

| Befund | Beobachtung aus der Sammelliste | Änderung | Technischer Nachweis | Empirische Grenze |
|---|---|---|---|---|
| Studienverlauf: Orientierung und Ergebnis (P5-F13, F17, F19) | Modulnamen führten nicht zum Detail; zusätzliche Spalten wurden eng; das Ergebnis einer Verschiebung war weit von der Aktion entfernt. | Modul-Links, Mindestbreiten mit internem Scrollen und Ergebnis-Dialog (P5-10/P5-11). | [Review P5-10](../reviews/P5-10.md), [P5-11](../reviews/P5-11.md), Browserprüfungen und Szenario D. | Keine dokumentierte Messung, ob Aufgaben danach schneller gelöst wurden. |
| Module: lange Liste und fehlende persönliche Ergänzungen (P5-F21 bis F23) | Die Modulliste war lang; Notizen und Kurs-Links fehlten. | Kompakte Semestergruppen, lokale Notizen und validierte Kurs-Links (P5-12). | [Review P5-12](../reviews/P5-12.md); sofortige Speicherung auch vor Neuladen im [Gesamtreview](../reviews/P5-PR29.md) nachgeprüft. | Keine gemessene Zufriedenheit oder Nutzungsquote. |
| Fristen: eigene Einträge und Kalender fehlen (P5-F25/F26) | Eigene Termine konnten nicht angelegt werden; eine Monatsansicht fehlte. | Eigene Termine mit Bearbeiten/Löschen sowie Kalender für Fristen und Prüfungen (P5-13/P5-14). | [Review P5-13](../reviews/P5-13.md), [P5-14](../reviews/P5-14.md), Tastatur-/Touchprüfungen und Speicherung nach Neuladen. | Tatsächlicher Kalenderimport und Nachprüfung mit Teilnehmenden nicht belegt. |

## Vorher-/Nachher-Material

Vorher ist der öffentliche Stand `fc12aad` vor der technischen Feedback-Runde; nachher ist der integrierte Stand `7e035c4`. Die Aufnahmen verwenden ausschließlich Demodaten.

| Bereich | Vorher | Nachher |
|---|---|---|
| Studienverlauf | [Vorher mobil](https://github.com/lucasstrubel/studicompass/blob/fc12aadc736367e4143ccde56e198c2f1ed56252/docs/screens/studienverlauf-390.png) | [Nachher mobil](https://github.com/lucasstrubel/studicompass/blob/7e035c43362b8e006082e7ee3e80d45a3b773d20/docs/screens/studienverlauf-390.png), [Ergebnis-Dialog](https://github.com/lucasstrubel/studicompass/blob/7e035c43362b8e006082e7ee3e80d45a3b773d20/docs/screens/studienverlauf-ergebnis-390.png) |
| Module | [Vorher Desktop](https://github.com/lucasstrubel/studicompass/blob/fc12aadc736367e4143ccde56e198c2f1ed56252/docs/screens/module-1440.png) | [Nachher Desktop](https://github.com/lucasstrubel/studicompass/blob/7e035c43362b8e006082e7ee3e80d45a3b773d20/docs/screens/module-1440.png) |
| Fristen | [Vorher Desktop](https://github.com/lucasstrubel/studicompass/blob/fc12aadc736367e4143ccde56e198c2f1ed56252/docs/screens/fristen-1440.png) | [Kalender Desktop](https://github.com/lucasstrubel/studicompass/blob/7e035c43362b8e006082e7ee3e80d45a3b773d20/docs/screens/fristen-kalender-1440.png) |

## Status der Abnahme

Teamrunde, Feedback-Umsetzung, unabhängiges Review und Produktionsintegration sind nachgewiesen. Die ursprünglichen Vorlagen für einzelne Thinking-Aloud-Sitzungen bleiben unausgefüllt; sie beschreiben nicht die tatsächlich durchgeführte Teamrunde. Eine weitere Runde wird durch diesen Bericht nicht automatisch angefordert.

Lucas hat M5 am 31.10.2026 auf Basis dieser vorhandenen qualitativen Evidenz formal abgenommen; siehe [Abnahmeentscheidung](../abnahmen/M5.md). Persona-Segment, Thinking-Aloud-Methode und Aufgabenkennzahlen der ursprünglichen Planung bleiben als nicht nachgewiesen ausgewiesen. Kein M5-Tag oder Release gesetzt. Reale Geräte, Screenreader, tatsächlicher ICS-Import und Generalprobe bleiben gesonderte Prüfungen.
