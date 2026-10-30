# P5 – technische Restprüfung und Dokumentationsabgleich

Urteil: Freigabe (technischer Abschluss; formale M5-Abnahme separat).

Stand: 30.10.2026, Basis `7e035c4` (gemergter PR #29). Direkter Folgeauftrag von Lucas: Dokumentation korrigieren und technische Restprüfungen eigenständig erledigen. Die durchgeführte Vierpersonen-Teamrunde ist in [P5-teamrunde](../evaluation/P5-teamrunde.md) dokumentiert.

## Befunde und Umsetzung

| # | Schwere | Befund | Umsetzung / Nachweis |
|---|---------|--------|----------------------|
| 1 | Major | Bei 320 px erzeugten die Schaltflächen „Moodle: Verbindung trennen (Simulation)“ und „Website: …“ in den Einstellungen Seitenüberlauf bis 338 px. | Schaltflächen dürfen innerhalb ihrer Maximalbreite umbrechen; Mindesthöhe bleibt 36 px. Alle Bereiche, Dialoge und Navigation werden im Browser bei 320 px geprüft. |
| 2 | Minor (P5-F10) | Der Einstieg enthielt den Studienverlauf samt Drag & Drop auch beim Onboarding und auf anderen Seiten; Hauptbundle 858,77 kB. | Studienverlauf wird erst beim Öffnen geladen. Ladezustand und deutscher Fehlerzustand mit Wiederholung bleiben innerhalb der App-Shell. Gemeinsame React-/Router-Abhängigkeiten sind getrennt. Keine neue Abhängigkeit und keine erhöhte Warnschwelle. |
| 3 | Dokumentation | Mehrere Stellen bezeichneten Review, Merge und reale Feedbacksammlung noch als ausstehend. | PR #29 und Produktion als erfolgt dokumentiert. Vierpersonen-Teamrunde mit Methode und Grenzen erfasst; drei belegte Kernbefunde mit Vorher-/Nachher-Material aufbereitet. Leere Einzelprotokolle werden als unbenutzte Vorlagen gekennzeichnet. |

## Bundle-Messung

Produktionsbuild und ein frischer Chrome-Kontext auf `/start`, ungepackte JavaScript-Bytes:

| Messgröße | Vorher | Nachher |
|---|---:|---:|
| Einstieg | 858.774 B | 475.478 B |
| Gemeinsamer React-/Router-Chunk | im Einstieg enthalten | 316.875 B |
| Chunk-Runtime | im Einstieg enthalten | 726 B |
| Summe beim Onboarding-Start | 858.774 B | 793.079 B |
| Studienverlauf | im Einstieg enthalten | ca. 67,46 kB, erst beim Öffnen |

Die tatsächlich für das Onboarding geladenen JavaScript-Bytes sinken um 65.695 B bzw. rund 7,6 %. Der Einstieg allein sinkt stärker, doch der zusätzlich benötigte Bibliotheks-Chunk ist in der Summe ausdrücklich mitgerechnet. Die Gesamtmenge aller Anwendungsfunktionen wird durch Code-Aufteilung nicht wesentlich kleiner. Es wird keine gemessene Ladezeitverbesserung behauptet. Der Diagramm-Chunk bleibt getrennt (ca. 384,42 kB). Kein einzelner Produktions-Chunk überschreitet mehr die unveränderte Vite-Warnschwelle von 500 kB.

Technische Grundlage: [React lazy und Suspense](https://react.dev/reference/react/lazy), [Vite Produktionsbuild](https://vite.dev/guide/build.html), [Rolldown codeSplitting](https://rolldown.rs/reference/OutputOptions.codeSplitting). Keine neuen Abhängigkeiten.

## Prüfungen

- Ausgangsprüfung reproduzierte den 320-px-Überlauf in den Einstellungen auf Desktop und Touch. Die übrigen geprüften Bereiche sowie Menü, Assistent und Termin-Dialog passten.
- Gezielte Unit-Tests für Routing und Einstellungen: 33 bestanden; Studienverlauf: 23 bestanden. Bestehende Tests warten auf den tatsächlich nachgeladenen Plan, statt den Ladezustand mit fertigen Daten zu verwechseln.
- Gezielte Browserprüfungen: sechs bestanden (Desktop und Touch): alle Bereiche bei 320 px, Bedienbarkeit von Menü/Assistent/Termin-Dialog, verzögertes Laden des Studienverlaufs, absichtlich abgebrochener Chunk-Request, deutscher Fehlerzustand und erfolgreiche Wiederholung nach Neuladen.
- Frischer Browserkontext lädt beim Onboarding nur Einstieg, React-/Router-Chunk und Runtime. Der Studienverlauf wird zu diesem Zeitpunkt nicht angefordert.
- `VITEST_MAX_WORKERS=2; npm run check`: **325 Tests in 47 Dateien**, Typecheck, Lint und Produktionsbuild grün; keine Bundle-Warnung, bestehende Zeitlimits unverändert.
- `npm run e2e -- --workers=2`: **59 bestanden, 9 bewusst übersprungen**. Der erste parallele Lauf wurde beim gleichzeitigen Neuaufbau des Vorschauverzeichnisses durch zwei HTTP-404-Antworten gestört; der vollständige Lauf auf dem stabilen Build ist anschließend grün.
- `npm run screens -- --workers=2`: **66 bestanden**, einschließlich neuer Lade-/Fehleransichten und der Einstellungen bei 320 px. Die 320-px-Aufnahme wird auf die zuvor überlaufende Website-Schaltfläche gescrollt; diese sowie die Lade-/Fehleransichten wurden gesichtet.

Domänen-Spezifikationstests, Testorakel, Berechnungen und Inhalte der freigegebenen Feedback-Runde bleiben unverändert. Es werden keine Teilnehmerzahlen, Zitate oder Erfolgswerte für fehlende Einzelprotokolle erfunden.

## Unabhängiger Review

Der genehmigte schreibgeschützte Codex-Review des Abschluss-Diffs gegen main fand einen Major-Befund im neuen Browser-Test: Die Marketing-Prüfung wurde unter `e-mark-ws26` statt der gültigen ID `e-mkt-ws26` aufgerufen. Damit wurde zunächst nur der Leerzustand geprüft. Die übrige statische Prüfung ergab keine weiteren konkreten Fehler; der Reviewer führte keine Tests aus.

Der Befund wurde bestätigt und korrigiert. Vor der Breitenmessung müssen Statistik und Marketing nun jeweils ihre konkrete Überschrift „… – antreten oder abmelden?“ anzeigen. Damit schlägt der Test bei einer falschen ID fehl, statt einen irreführenden Nachweis zu liefern. Der abschließende vollständige Browserlauf verwendet die korrigierte ID und ist grün. Ein gezielter unabhängiger Codex-Nachlauf bestätigt ausdrücklich: „Befund geschlossen. Keine verbleibenden Befunde im geprüften Umfang.“ Dieser Nachlauf prüfte ausschließlich die geschlossene Testlücke schreibgeschützt und führte keine Tests aus. Es wurden keine Befunde verworfen.

## Noch abzugrenzen

M5 ist zur Abnahme anhand der vorhandenen qualitativen Team-Evidenz vorbereitet. Die ursprünglich geplante Thinking-Aloud-Methode, Persona-Zuordnung und Aufgabenkennzahlen sind nicht nachgewiesen. Kein neuer Testtermin wird automatisch angesetzt. Lucas entscheidet über die formale Abnahme; Tags und Releases bleiben freigabepflichtig.

Die Produktfragen P5-F05/F06 sowie Ideen P5-F07/F09 bleiben separat ausgewiesen. Die Kürzung von Folgen-Karten oder Vereinheitlichung der Assistent-Einstiege wird hier nicht ohne priorisierte Produktentscheidung umgesetzt. Tatsächlicher Kalenderimport, Screenreader, reale Geräte, Flow-Chart-Unterlagen und Präsentations-Generalprobe bleiben gesonderte Aufgaben.
