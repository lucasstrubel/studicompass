# AGENTS.md

Gemeinsame Arbeitsregeln für alle, die in diesem Repository arbeiten — Menschen und
Coding-Agenten (Claude Code, Codex). Claude Code liest sie über `CLAUDE.md`, das diese
Datei einbindet; Codex liest sie direkt. Änderungen an den Regeln gehören hierher, nicht
in `CLAUDE.md`.

## Projekt

**StudiCompass** — Projekt von Lucas Strubel. Zweck, Zielgruppe und Umfang sind noch
festzulegen und werden hier ergänzt, sobald sie feststehen. README, CHANGELOG, Commits und
die gesamte Dokumentation sind auf **Deutsch**.

## Build & Run

Noch festzulegen. Sobald der Stack steht, hier Kompilieren, Tests (gesamt, einzeln) und
Start eintragen — und das **Prüf-Gate**: den einen Befehl, der vor jedem Pull Request grün
sein muss und den auch die CI ausführt. Bis dahin gilt als Prüf-Gate: Änderungen sind
nachvollziehbar beschrieben und manuell geprüft.

## Architektur

Noch festzulegen (Pakete/Module, Verantwortlichkeiten, wichtige Muster, fachliche
Invarianten, Persistenz).

## Codestil

Bestehenden Stil übernehmen; Regeln für Einrückung, Benennung und Formatter werden mit dem
Stack festgelegt. Dateien als UTF-8 mit den Zeilenenden aus `.gitattributes` (LF,
Windows-Skripte CRLF).

## Commits und Pull Requests

Commit-Nachrichten kurz und deutsch, bei Bedarf mit Präfix (`Build:`, `Oberflaeche:`,
`Dokumentation:`); Änderungen thematisch bündeln. Jede Änderung läuft über einen Zweig und
einen Pull Request auf GitHub; gemergt wird erst bei grüner CI. Pull Requests beschreiben
Verhaltensänderungen und Prüfergebnisse; bei Oberflächenänderungen Screenshots aus
Demodaten. Vor dem Pull Request das Prüf-Gate aus *Build & Run* ausführen. Datenbanken,
Logs, Secrets (`.env`) und echte Nutzerdaten nie einchecken.

## Zusammenarbeit von Claude Code und Codex

Zwei Coding-Agenten arbeiten im Auftrag von Lucas Strubel an diesem Repository: Claude Code
und Codex. Beide halten sich an dieses Dokument.

Projektweite, versionierte Einstellungen der Agenten:

| Pfad | Agent | Inhalt |
|------|-------|--------|
| `.claude/settings.json` | Claude Code | geteilte Berechtigungen (persönliche in `.claude/settings.local.json`, nicht versioniert) |
| `.claude/commands/` | Claude Code | `/codex-review` (Codex prüft), `/codex-aufgabe` (Auftrag an Codex) |
| `.codex/config.toml` | Codex | Sandbox und Freigaben; wirkt nur in vertrauten Projekten |
| `.agents/skills/` | Codex | `auftrag-umsetzen` (Gegenstück zu `/codex-aufgabe`), `zweig-pruefen` (Gegenstück zu `/codex-review`) |

Persönliche Vorgaben (Modell, Aufwand, Windows-Sandbox) gehören in die Benutzerkonfiguration,
nicht ins Repository.

- **Eine Arbeitskopie, ein Schreiber.** Claude Code arbeitet im Haupt-Checkout. Codex arbeitet
  in einem eigenen Git-Worktree auf einem Zweig `codex/<thema>`. Kein Agent ändert Dateien in
  der Arbeitskopie des anderen oder setzt dessen Zweig zurück. Die Codex-Sandbox darf nicht in
  das gemeinsame `.git`-Verzeichnis schreiben: Claude Code legt den Zweig im Codex-Worktree an
  und committet dort nach dem Review; Codex ändert nur Dateien und committet nicht.
- **Nie direkt auf `main`.** Jede Änderung: Zweig → Pull Request → grüne CI → Merge.
  Pushes, Merges, Tags und Releases, Secrets und Repository-Einstellungen nur mit
  ausdrücklicher Freigabe von Lucas. Gepusht wird ausschließlich zum GitHub-Remote
  `origin`; weitere lokale Regeln stehen in nicht versionierten Dateien und gelten genauso.
- **Gegenseitige Prüfung.** Jede Änderung prüft vor dem Merge der jeweils andere Agent:
  Claude Code prüft Codex-Zweige, Codex prüft Claude-Zweige (`codex review --base main`)
  und kommentiert Pull Requests auf GitHub. Befunde werden vor dem Umsetzen am Code
  nachgeprüft; verworfene Befunde stehen mit Begründung im Pull Request.
- **Übergabe.** Ein Auftrag an den anderen Agenten nennt Ziel, betroffene Dateien,
  Akzeptanzkriterien und erwartete Tests. Der Ergebnisbericht nennt geänderte Dateien, das
  Ergebnis des Prüf-Gates und offene Punkte. Was nicht ausgeführt werden konnte (z. B.
  GUI-Tests ohne Bildschirm, Netzwerkzugriff in der Sandbox), wird als offen gemeldet, nie
  als bestanden.
- **Gleiche Qualitätsgrenze.** Für beide gilt: Prüf-Gate grün vor dem Pull Request, neue
  Funktionen mit Tests, Dokumentation nachgezogen.
- **Unklare Aufträge** nicht mit Annahmen füllen: offene Fragen im Ergebnisbericht stellen
  statt sie stillschweigend zu entscheiden.
