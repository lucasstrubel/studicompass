# P6 – Umsetzungsplan und Prüfkriterien

Stand: 31.10.2026. Direkter Auftrag von Lucas: Demo-Skript, Anleitung und Folien vorbereiten, Backup-Aufnahme und lokalen Präsentationsbuild erstellen, PR-30-Status korrigieren, alte Checkboxen mit Genehmigungen abgleichen und M5 formal abnehmen.

## Reihenfolge

1. **Abschluss Phase 5:** Lucas' ausdrücklichen Abnahmeauftrag auf den geprüften Produktionsstand `862fbb6` beziehen. Abweichungen der tatsächlich durchgeführten Teamrunde von der ursprünglichen Testplanung sichtbar lassen. Dokumentation zu PR #30 aktualisieren und alte Entscheidungen anhand vorhandener Nachweise abgleichen.
2. **P6-02 – Demo-Skript:** Hero-Flow in 3–4 Minuten mit konkreten Bedienelementen, Sprechtext, erwarteten Werten, Rückgängig und Ersatzpfaden ausarbeiten. Den Ablauf gegen den lokalen Produktionsbuild tatsächlich durchspielen.
3. **P6-03 – Folien:** Persona und kritisches Szenario, Live-Demo, VPC-Bezug, Teamfeedback und Änderungen sowie Ausblick und Stakeholder abdecken. Quellen in den Notizen, keine erfundenen Testergebnisse. HTML-Folien und PDF mit lokalen Screenshots, ohne externe Abhängigkeiten.
4. **P6-04 – Backup:** Den tatsächlichen Browserablauf in 1440 × 900 aufzeichnen, Kapitel und Dauer dokumentieren. Einen separat startbaren Build samt lokalem SPA-Server und Anleitung paketieren. Netzwerklose Nutzung und direkte Unterseiten prüfen.
5. **Prüfung und PR:** `npm run check`, gezielte Prüfung des Demo-Flows, Sichtkontrolle aller Folien, PDF-Seiten und Aufnahme-Kapitel, Paketintegrität und Starttest. Unabhängiger Review, dokumentierte Befunde, Commit, Push und PR. Merge erst nach ausdrücklichem OK.

## Abnahmekriterien

- M5 ist als Entscheidung von Lucas am 31.10. dokumentiert, ohne einen Thinking-Aloud-Test oder Aufgabenkennzahlen zu behaupten. Kein Tag und kein Release allein durch diese Dokumentation.
- Bereits erteilte Freigaben werden übernommen. Nicht verfügbare externe Belege werden nicht durch Checkboxen vorgetäuscht.
- Skript enthält alle Stationen aus P6-02: Übersicht, Jetzt wichtig, Statistik-Folgen, Marketing-Vergleich, Assistent mit Quelle und Fallback. Statistik: 48 ECTS Ist, 78 vor / 72 nach Abmeldung in der Prognose, Praxissemester SS 2028 und Abschluss SS 2029 nach Abmeldung; Marketing verschiebt das Praxissemester nicht.
- Anleitung enthält Start, Zurücksetzen, feste Demo-Zeit, URLs, Bedienfolge und Vorgehen bei Ausfall.
- Folien bleiben lokal bearbeitbar und zeigen die Grenzen des Prototyps sowie der Evaluation. Jede Folie wird gerendert und gesichtet.
- Aufnahme zeigt echte Interaktionen mit Demodaten und dauert 3–4 Minuten. Kein Mikrofon wird benötigt; Sprechtext liegt im Skript. Kapitel erlauben den gezielten Ersatz einer gescheiterten Live-Station.
- Das Build-Paket startet mit vorhandenem Node.js ohne Installation, Konto oder Internet. Ein Manifest nennt Basis-Commit und Prüfsummen.
- Content-Freeze, finaler Release-Deploy, Tags `m5`/`v1.0`, Veröffentlichung eines Releases und die Generalprobe am Präsentationsgerät bleiben gesondert freizugeben bzw. durchzuführen.

## Formatentscheidung

Es ist keine verbundene Präsentationssitzung und keine Artifact-Tool-Laufzeit verfügbar. Die Folien entstehen als eigenständige HTML-Präsentation mit eingebetteten Bild- und Schriftdateien sowie als PDF für den Beamer. Es werden keine zusätzlichen Projektabhängigkeiten installiert. Das ist keine geprüfte PowerPoint-Datei.
