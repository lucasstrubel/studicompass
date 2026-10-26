# P2-01 – Umsetzung und Prüfung

Direkt von Lucas beauftragt; Branch: `feat/P2-01-domain-types`. Kein Commit oder Push.

## Änderungen

- `src/domain/types.ts`: exportiert die Domänenobjekte aus KONZEPT §10.1.
- `src/domain/terms.ts`: reine Funktionen `next`, `compare`, `semesterNumber`, `format` und `nextOffering` nach §10.2 und DR-4.
- `src/domain/terms.test.ts`: 14 Tests für Semesterwechsel, chronologischen Vergleich, Fachsemesterzählung, Darstellung und alle sechs Kombinationen aus Ausgangssemester und Angebotsturnus.
- `docs/ROADMAP.md`: Umsetzung von P2-01 abgehakt.

`semesterNumber(term, startTerm)` zählt ab 1; frühere Terms ergeben 0 oder negative Werte. `compare(left, right)` liefert −1, 0 oder 1. `nextOffering(term, offering)` sucht ausschließlich nach dem angegebenen Semester, auch wenn dieses bereits zum Angebot passt. Die Funktionen verändern ihre Eingaben nicht und verwenden keine Systemzeit.

## Prüfergebnis

- `npm run check`: bestanden (Typecheck, ESLint, 10 Testdateien mit 110 bestandenen Tests, Produktions-Build).
- Prettier für die drei neuen TypeScript-Dateien: bestanden.
- `git diff --check`: bestanden.
- Build-Hinweis: JavaScript-Chunk über 500 kB; keine Änderung an der UI oder am Bundling für diesen Task.

## Offen für die Übergabe

- Review durch Claude wie von Lucas vorgesehen.
- Keine GUI-Sichtprüfung ausgeführt; der Task verändert ausschließlich die Domäne und Dokumentation.
- Beim Branch-Anlegen waren uncommittete Änderungen aus P1-07 vorhanden. Sie bleiben im Arbeitsverzeichnis erhalten und wurden für P2-01 nicht bearbeitet. Das Prüf-Gate prüft diesen gesamten Arbeitsstand. Für die Übernahme von P2-01 die oben genannten Dateien und diese Dokumentation verwenden; in ROADMAP nur die Checkbox dieses Tasks übernehmen.
