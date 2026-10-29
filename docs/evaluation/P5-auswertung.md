# Phase 5 – Auswertung und Präsentation

**Stand 29.10.2026:** Teilnehmendendaten noch nicht eingetragen.
- Zwei Agentenbefunde aus der Inspektion in [P5.md](../reviews/P5.md), beide technisch behoben.
- Acht Agentenbefunde aus dem Abgleich mit Apples Designprinzipien in [P5-07-designprinzipien.md](../reviews/P5-07-designprinzipien.md), drei davon behoben.
- 23 Befunde aus der Sammelliste von Team-Review und Nutzertest vom 28.10. (P5-F11 bis P5-F33, Evidenzart „Sammelliste 28.10.“). Lucas hat entschieden, sie bis zur Präsentation umzusetzen (ROADMAP P5-09 bis P5-15). Das Team trägt nach, welche Punkte aus dem Nutzertest stammen (Protokollbezug), sowie Schwere und Häufigkeit.

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
| P5-F11 | Sammelliste 28.10. | Übersicht, ECTS-Verlauf | Die Kurve beginnt erst bei WS 2025/26 mit 30 ECTS. Erwartet: Start bei 0. | Erwartungskonformität | offen | nicht erhoben | — | Punkt „Studienbeginn“ mit 0 ECTS (P5-12) | offen |
| P5-F12 | Sammelliste 28.10. | Übersicht, ECTS-Verlauf / T1 | Die Differenz zwischen Ist und Soll (fehlende Punkte) steht nur in der Tabelle. Erwartet: beim Überfahren der Grafik. | Selbstbeschreibungsfähigkeit | offen | nicht erhoben | — | Tooltip mit Ist, Soll und Differenz; Tabellenspalte Differenz (P5-12) | offen |
| P5-F13 | Sammelliste 28.10. (2 Nennungen) | Studienverlauf | Ein Klick auf den Modulnamen führt nicht zum Moduleintrag. | Erwartungskonformität | offen | nicht erhoben | — | Modulname verlinkt aufs Moduldetail (P5-10) | offen |
| P5-F14 | Sammelliste 28.10. | Studienverlauf / T1 | Nicht erkennbar, welche Module zu welchem Meilenstein gehören. Erwartet: Markierung, ein- und ausschaltbar. | Selbstbeschreibungsfähigkeit | offen | nicht erhoben | — | Meilenstein-Chip als Umschalter mit DR-6, DR-11, DR-12 (P5-10) | offen |
| P5-F15 | Sammelliste 28.10. | Studienverlauf | Das rötliche Feld der Meilensteine (Flagge + Text) wirkt wie eine Warnung. | Erwartungskonformität | offen | nicht erhoben | — | Chip in Violett, Abnahme am Screenshot (P5-10) | offen |
| P5-F16 | Sammelliste 28.10. | Studienverlauf | Abgeschlossene Semester und Prüfungen lassen sich nicht ausblenden. | Individualisierbarkeit | offen | nicht erhoben | — | Schalter „Abgeschlossenes ausblenden“ (P5-10) | offen |
| P5-F17 | Sammelliste 28.10. | Studienverlauf, Was-wäre-wenn / T5 | Nach Verschiebungen kommen Spalten dazu, die Boxen werden schmal, Wörter brechen mitten im Wort um („bricht alles“). | Ästhetik und minimalistisches Design | offen | nicht erhoben | — | Mindestbreite der Spalten, Scrollen nur innerhalb der Zeitleiste (P5-10) | offen |
| P5-F18 | Sammelliste 28.10. | Studienverlauf, Was-wäre-wenn | Das Praxissemester lässt sich nicht verschieben; warum, ist nicht erkennbar. | Selbstbeschreibungsfähigkeit | offen | nicht erhoben | — | Bleibt fest (Entscheidung von Lucas); Schloss und Erklärung mit DR-6 (P5-10) | offen |
| P5-F19 | Sammelliste 28.10. | Was-wäre-wenn / T5 | Das Ergebnis einer Verschiebung steht oben auf der Seite; man muss hin und her scrollen. Erwartet: Pop-up. | Aufgabenangemessenheit / Sichtbarkeit des Systemstatus | offen | nicht erhoben | — | Ergebnis-Dialog nach jeder Verschiebung, Simulationsstatus bleibt sichtbar (P5-11) | offen |
| P5-F20 | Sammelliste 28.10. | Was-wäre-wenn / T5 | Wunsch: Module per Drag & Drop verschieben, feste Boxen bleiben fest. | Steuerbarkeit | offen | nicht erhoben | — | Drag & Drop zusätzlich zum Menü (P5-11, Kürzungsliste Platz 1) | offen |
| P5-F21 | Sammelliste 28.10. | Module & Noten | Die Liste aller 29 Module ist lang; man muss viel scrollen. | Aufgabenangemessenheit | offen | nicht erhoben | — | Kompakte Zeilen, Semester aufklappbar (P5-12) | offen |
| P5-F22 | Sammelliste 28.10. | Moduldetail | Wunsch: Notizblock je Modul in der freien rechten Spalte. | Individualisierbarkeit | offen | nicht erhoben | — | Notizen je Modul (P5-12) | offen |
| P5-F23 | Sammelliste 28.10. (2 Nennungen) | Moduldetail | Kein Weg zum Kurs. Erwartet: Link zu Moodle und zur Website der Lehrenden, automatisch und manuell einstellbar. | Aufgabenangemessenheit | offen | nicht erhoben | — | Kurs-Links: Moodle automatisch (simuliert), eigene Adresse, eigene Links (P5-12) | offen |
| P5-F24 | Sammelliste 28.10. (2 Nennungen) | Module dieses Semesters | Prüfungsvorleistungen lassen sich nicht eintragen; ob die Zulassung zur Prüfung steht, ist nicht sichtbar. | Aufgabenangemessenheit | offen | nicht erhoben | — | Prüfungsvorleistungen mit Stand und Zulassung, nur Anzeige (P5-13) | offen |
| P5-F25 | Sammelliste 28.10. | Fristen | Eigene Termine, etwa für Studienleistungen und auch kurzfristige, lassen sich nicht anlegen oder bearbeiten. | Individualisierbarkeit / Steuerbarkeit | offen | nicht erhoben | — | Eigene Termine anlegen, bearbeiten, löschen (P5-13) | offen |
| P5-F26 | Sammelliste 28.10. | Navigation, Fristen | Fristen haben keinen eigenen Reiter; ein Kalender fehlt. | Erwartungskonformität | offen | nicht erhoben | — | Reiter „Fristen“ (P5-09) mit Kalenderansicht (P5-14) | offen |
| P5-F27 | Sammelliste 28.10. | Navigation (Desktop) | Das Hamburger-Menü wiederholt auf dem Desktop die Topbar. | Ästhetik und minimalistisches Design | offen | nicht erhoben | — | Ab 1280 px kein Hamburger, alle Bereiche in der Topbar (P5-09) | offen |
| P5-F28 | Sammelliste 28.10. | Onboarding | Man kann kein eigenes Profil anlegen. | Erwartungskonformität | offen | nicht erhoben | — | Schritt „Dein Profil“ mit Vor- und Nachname (P5-15) | offen |
| P5-F29 | Sammelliste 28.10. | Einstellungen | Das Profil lässt sich nicht bearbeiten. | Steuerbarkeit | offen | nicht erhoben | — | Abschnitt „Profil“ und Eintrag im Profilmenü (P5-15) | offen |
| P5-F30 | Sammelliste 28.10. | Onboarding | Die Produkt-Tour ist nicht standardmäßig aktiv. | Lernförderlichkeit | offen | nicht erhoben | — | Tour standardmäßig angehakt (P5-15) | offen |
| P5-F31 | Sammelliste 28.10. | alle | Quellenangaben stehen mitten im Inhalt, etwa vor den Buttons, und unterbrechen den Lesefluss. | Ästhetik und minimalistisches Design | offen | nicht erhoben | — | Quellen als Fußzeile jeder Karte (P5-09) | offen |
| P5-F32 | Sammelliste 28.10. | Assistent | Wunsch: KI oder eigener Bereich, der die richtige Anlaufstelle findet. | Aufgabenangemessenheit | offen | nicht erhoben | — | Seite „Anlaufstellen“ und Katalogfrage A-09, keine echte KI (R-1, R-6) (P5-15) | offen |
| P5-F33 | Sammelliste 28.10. | Demo-Szenario | Vorschlag: Studierender im 4. Semester als besserer Grenzfall (längerer ECTS-Verlauf, Übergang ins Hauptstudium). | – | – | nicht erhoben | — | Niklas bleibt im 3. Semester (Entscheidung von Lucas); Ideenparkplatz und Ausblick (P5-08) | – |
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
