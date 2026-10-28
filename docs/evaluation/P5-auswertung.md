# Phase 5 – Auswertung und Präsentation

**Stand 28.10.2026:** Keine Teilnehmendendaten erhoben.
- Zwei Agentenbefunde aus der Inspektion in [P5.md](../reviews/P5.md), beide technisch behoben.
- Acht Agentenbefunde aus dem Abgleich mit Apples Designprinzipien in [P5-07-designprinzipien.md](../reviews/P5-07-designprinzipien.md), drei davon behoben.

Die endgültigen Top 5 werden nach den Nutzertests bestimmt.

## Gemeinsame Befundliste

Protokollbezug = Person und Aufgabe, z. B. P2/T3. Dubletten zusammenführen und alle Belege behalten. Schwere 0–4 laut Testplan. Häufigkeit als „betroffene / tatsächlich beobachtete Personen“; Inspektionsbefunde erhalten keinen Nutzer-Score. Bei technischen Blockaden oder falschen Ergebnissen zuerst den Kernflow wiederherstellen.

| ID | Evidenzart / Protokollbezug | Screen / Aufgabe | Beobachtung / Erwartung | Prinzip | Schwere | Häufigkeit | Score (Schwere × betroffene Personen) | Entscheidung / Änderung | Nachprüfung / offen |
|---|---|---|---|---|---|---|---|---|---|
| P5-F01 | Agenteninspektion | Fristen | Beim Laden erscheinen voreilige Leerzustände; erwartet wird ein Ladezustand. | Sichtbarkeit des Systemstatus | 2 | nicht erhoben | — | Ladezustand ergänzt | Regression und Sichtprüfung: siehe P5.md; Nutzertest offen |
| P5-F02 | Agenteninspektion | Assistent / T3 | Anschlussfragen wirken während laufender Antwort verfügbar; Klicks werden verworfen. | Erwartungskonformität / Konsistenz | 2 | nicht erhoben | — | Anschlussfragen während Antwort gesperrt | Regression und Browserprüfung: siehe P5.md; Nutzertest offen |
| P5-F03 | Agenteninspektion (Designprinzipien, DP-1) | Übersicht, alle App-Seiten / T4 | Die Sprechblase am Assistent-Button verdeckte beim ersten Laden Inhalte (390 px: „Jetzt wichtig“; 1440 px: Postfach-Eintrag „Tutorium … Statistik“) und kam nach jedem Neuladen wieder. Erwartet: ein Hinweis, der beim Arbeiten aus dem Weg geht. | Ästhetik und minimalistisches Design / Steuerbarkeit | 2 | nicht erhoben | — | Sprechblase einmal je Demo-Stand; verschwindet beim Scrollen, Schließen, Öffnen oder Seitenwechsel (P5-07). Der runde Button bleibt schwebend (P5-06) und liegt bei 1440×900 anfangs über der Note 2,3 | Unit- und Browsertests: siehe P5-07; im Nutzertest beobachten, ob der Assistent auffindbar bleibt und der Button stört |
| P5-F04 | Agenteninspektion (Designprinzipien, DP-2) | Folgen-Check / T2 | „Warum?“-Schalter waren nur ca. 18 px hoch; knapp daneben tippen öffnete nichts. Erwartet: gut treffbar, auch per Touch. | Barrierefreiheit (Zielgröße) / Fehlertoleranz | 2 | nicht erhoben | — | Trefferfläche ca. 30 px ohne Layoutänderung (P5-07); übrige Buttons (36 px) unverändert | E2E „knapp daneben“ auf Desktop und mobil; im Nutzertest beobachten |
| P5-F05 | Agenteninspektion (Designprinzipien, DP-4) | Folgen-Check / T2 | 10 Folgen-Karten, 6 davon wiederholen Tabellenzeilen; mobil etwa vier Bildschirmhöhen bis „Deine Entscheidung“. Erwartet: Entscheidungsrelevantes ohne Wiederholung. | Ästhetik und minimalistisches Design / Aufgabenangemessenheit | 2 | nicht erhoben | — | offen für P5-03 | In T2 Zeit und Scrollverhalten beobachten |
| P5-F06 | Agenteninspektion (Designprinzipien, DP-5) | Übersicht | Drei Einstiege in den Assistenten verhalten sich verschieden: Die Eingabe in der rechten Spalte wechselt die Seite, der Button öffnet ein Fenster. | Konsistenz / Erwartungskonformität | 1 | nicht erhoben | — | offen für P5-03 | – |
| P5-F07 | Agenteninspektion (Designprinzipien, DP-6) | Postfach, Benachrichtigungen | Der Gelesen-Status lässt sich nicht zurücknehmen; „Alle als gelesen markieren“ hat kein Rückgängig. | Nutzerkontrolle und Freiheit / Steuerbarkeit | 1 | nicht erhoben | — | offen; Idee im Ideenparkplatz (KONZEPT §5.2) | – |
| P5-F08 | Agenteninspektion (Designprinzipien, DP-7) | Onboarding | „Überspringen“ ab Schritt 2 setzt bereits gewählte Kanäle, Ziel, Nebenjob und Hinweis-Stil auf die Standardwerte zurück (so in KONZEPT §10.6). | Steuerbarkeit / Erwartungskonformität | 2 | nicht erhoben | — | offen für P5-03; braucht eine Konzeptänderung | Nicht Teil der Testaufgaben (die Testleitung startet ohne Einrichtung) |
| P5-F09 | Agenteninspektion (Designprinzipien, DP-8) | Topbar | Der Avatar zeigte ein Icon statt der Initialen (KONZEPT A-6); der Browser-Tab hat kein Favicon. | Konsistenz | 1 | nicht erhoben | — | Initialen umgesetzt (P5-07); Favicon im Ideenparkplatz | Unit-Test: siehe P5-07 |
| P5-F10 | Agenteninspektion (Designprinzipien, DP-9) | alle | Umbruch nur von 360 bis 1920 px geprüft (WCAG 1.4.10: 320 px); Hauptbundle ca. 758 kB. | Barrierefreiheit (Reflow) / Effizienz | 1 | nicht erhoben | — | offen für P5-03 | – |
| | | | | | | | | | |

## Aufgabenübersicht nach den Sitzungen

Erfolg mit Hilfe separat von selbstständigem Erfolg zählen. Zeiten nur für tatsächlich durchgeführte Aufgaben zusammenfassen; bei kleinen Stichproben Rohwerte zeigen. Fehlende Angaben nicht als null werten.

| Aufgabe | Durchgeführt (n) | Ja | Mit Hilfe | Nein | Nicht durchgeführt | Zeiten (s) / besondere Hilfe |
|---|---|---|---|---|---|---|
| T1 | | | | | | |
| T2 | | | | | | |
| T3 | | | | | | |
| T4 | | | | | | |
| T5 (optional) | | | | | | |

## Endgültige Top 5

Auswahl nach den Regeln in TESTPLAN §4. Weniger als fünf belegte Probleme ergeben weniger Änderungen. Nicht priorisierte Befunde mit Begründung und Status hier festhalten; neue Feature-Ideen gehören in den Ideenparkplatz, bestehende Fehler bleiben in der Befundliste.

| Rang | Befund-ID | Auswahlbegründung | Änderung / bewusst zurückgestellt | Prüfnachweis / Status |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

## Präsentationsvorlage: drei Kernbefunde

Bis zur Endauswertung ist dies eine leere Vorlage. Inspektionsbefunde dürfen ausdrücklich als solche vorläufig übernommen werden. Keine Teilnehmerzitate, Häufigkeiten oder Verbesserungsquoten ergänzen, solange diese nicht erhoben sind. Gibt es weniger als drei belegte Kernbefunde, entsprechend weniger präsentieren.

| Kernbefund | Beleg und Herkunft | Beobachtung vorher | Änderung mit Vorher-/Nachher-Screenshot | Technische Nachprüfung | Ergebnis mit Teilnehmenden / noch offen |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

Präsentationsschluss: Zahl und Segment der tatsächlich getesteten Personen, Geräte, getesteter Stand, Grenzen der kleinen Stichprobe und noch offene Befunde nennen. Quellenvertrauen und Verständnis von „Knapp“/„Kritisch“ aus den Abschlussfragen gesondert berichten.

## Gate M5

- [ ] 3–5 echte Sitzungen mit T1–T4 dokumentiert; optionales T5 korrekt ausgewiesen.
- [ ] Inspektions- und Nutzerbefunde zusammengeführt, priorisiert und belegt.
- [ ] Priorisierte Top-Befunde behoben und nachgeprüft; Ausnahmen ausdrücklich dokumentiert.
- [ ] Drei Kernbefunde oder begründet weniger für die Präsentation aufbereitet.
- [ ] Unabhängiges Review der Änderungen durchgeführt; formalen M4-Status separat geprüft.

**M5: offen.** Diese Checkliste ersetzt keine ausstehenden Prüfnachweise.
