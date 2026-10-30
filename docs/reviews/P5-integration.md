# P5-09 bis P5-15 – Integration der Feedback-Runde

Stand: 30.10.2026. Codex setzt den direkten Auftrag von Lucas selbst um, einschließlich Git- und PR-Arbeit. Eine Übergabe an Claude ist nicht erforderlich.

## Ergebnis und Git-Basis

[PR #29](https://github.com/lucasstrubel/studicompass/pull/29) bündelt die gesamte freigegebene Feedback-Runde gegen `main`.

- Basis `main`: `fc12aadc736367e4143ccde56e198c2f1ed56252` (P5-08).
- Konfliktauflösung `0c0a4c2`: `main` in den bisherigen PR-Kopf übernommen; Konzept und Roadmap behalten die bereits umgesetzten P5-09-bis-P5-12-Inhalte. Der Dateibaum entspricht dem vorher geprüften P5-12-Stand, zusätzlich ist `main` jetzt ein Vorfahr.
- P5-13: vorhandene Fach- und Korrektur-Commits im isolierten Task-Zweig übernommen; Nachprüfung und robuster Browsertest ergänzt. Siehe [P5-13](P5-13.md).
- P5-14: eigener Task-Zweig und Commit für den Kalender; `npm run check` mit 295 Tests und gezielte Browserprüfungen (5 bestanden, 1 absichtlich übersprungen) im Integrations-Worktree grün. Beide Kalenderaufnahmen erneut erstellt. Siehe [P5-14](P5-14.md).
- P5-15: Profil, Onboarding und Anlaufstellen im anschließenden Task-Zweig übernommen. Siehe [P5-15](P5-15.md).
- Die genehmigte Roadmap hat nach Lucas' Entscheidung vom 30.10. Vorrang vor KONZEPT und INHALTE; in `CLAUDE.md` und `AGENTS.md` dokumentiert.

Die bisherigen Änderungen wurden in einem isolierten Git-Worktree übernommen. Die abschließende Prüfung bezieht sich auf diesen tatsächlichen Integrationsstand. Es werden keine alten Feature-PRs erneut ineinander gemergt.

## Abdeckung der Roadmap

| Task | Ergebnis | Stories | VPC |
|---|---|---|---|
| P5-09 | Desktop-Navigation und Quellen-Fußzeilen | US-09, US-17 | P1, G1 |
| P5-10 | Modul-Links, Meilenstein-Markierung, robuste Zeitleiste | US-09, US-26 | P3, G2 |
| P5-11 | Ergebnis-Dialog und Drag & Drop mit Rücknahme | US-10 | P3, G2 |
| P5-12 | ECTS-Verlauf ab 0, kompakte Module, Notizen und Links | US-03, US-23, US-24 | P1, G1 |
| P5-13 | Prüfungsvorleistungen, Zulassung und eigene Termine | US-21, US-25 | P1, G1 |
| P5-14 | Kalender mit Fristen, eigenen Einträgen und Prüfungen | US-22 | G1 |
| P5-15 | Profil, Onboarding, Anlaufstellen und A-09 | US-01, US-02, US-27, US-28 | P4, G3 |

Akademische Testorakel und `src/domain/*.spec.ts` bleiben unverändert. Keine neuen Abhängigkeiten gegenüber dem bisherigen P5-12-Stand.

## Abschließende Prüfung

- Quellstand vor der Übernahme: `npm run check` mit zwei Vitest-Workern grün (318 Tests in 47 Dateien); Browserprüfungen 49 bestanden, 9 bewusst übersprungen; 59 Screenshots.
- Integrationsstand vor dem unabhängigen Review (`f979967`): `VITEST_MAX_WORKERS=2; npm run check` grün, **318 Tests in 47 Dateien**, Typecheck, Lint und Build bestanden. `npm run e2e -- --workers=2`: **49 bestanden, 9 bewusst übersprungen**. Keine Zeitlimits angehoben. 215 Code-, Test- und Konfigurationsdateien stimmen bytegenau mit dem bereits geprüften lokalen Quellstand überein.
- `npm run screens -- --workers=2`: **59 bestanden**, alle Aufnahmen bei 1440×900 und 390×844 im vollständigen Integrationsstand erneut erstellt; Kalender, Profil und Anlaufstellen anschließend gesichtet.
- Nach ausdrücklicher Zustimmung von Lucas zur Diff-Übermittlung: unabhängiger schreibgeschützter Codex-Gesamtreview mit drei bestätigten Major-Befunden (POS-Ladesperre, ausstehende Notizen bei Dokumentwechsel, nicht existierende Sommerzeit-Uhrzeit). Alle drei korrigiert; der unabhängige Nachlauf meldet keine weiteren Befunde. [Vollständiger Review und Nachprüfung](P5-PR29.md).
- Nach den Korrekturen: `VITEST_MAX_WORKERS=2; npm run check` grün mit **325 Tests in 47 Dateien**, Typecheck, Lint und Build. Vollständiges E2E: **53 bestanden, 9 bewusst übersprungen**, einschließlich der neuen Review-Regressionen auf Desktop und mobil. `npm run screens -- --workers=2`: **61 bestanden**, einschließlich der neuen Fehleransicht bei 1440×900 und 390×844; anschließend gesichtet.
- Bekannte Build-Warnung: Hauptbundle ca. 859 kB minifiziert / 252 kB gzip; Diagramm getrennt ca. 384 kB / 110 kB gzip (P5-F10, nicht Teil der freigegebenen Feedback-Tasks P5-09 bis P5-15).

## Offen bis zur Abnahme

- Freigabe und Merge von PR #29 nach `main`; kein Merge, Tag oder Release ohne Lucas' ausdrückliches OK.
- Echter ICS-Import, Screenreader und reale Geräte.
- Teamprüfung, belegte Sitzungsprotokolle und Häufigkeiten, nutzerbasierte Endpriorisierung und Präsentationsergebnisse (P5-01 bis P5-05). Die Sammelliste vom 28.10. ist übernommen; fehlende Nutzerdaten wurden nicht erfunden.
- Gate M5 bleibt offen. Phase 6 mit Freeze, finalem Deploy/Tag, Demo/Folien, Aufnahme und Generalprobe ist nicht als erledigt markiert.
