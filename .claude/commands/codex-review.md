---
description: Codex prüft den aktuellen Stand als zweiter Reviewer; jeder Befund wird am Code nachgeprüft
argument-hint: "[--uncommitted | --base <zweig> | --commit <sha>] [zusätzliche Prüfhinweise]"
allowed-tools: Bash(codex review:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-list:*), Read, Grep, Glob
---

Lass Codex den aktuellen Stand prüfen und bewerte das Ergebnis selbst. Codex ist ein zweiter
Reviewer, keine Autorität: Jeder Befund wird am Code nachgeprüft.

Argumente: $ARGUMENTS

1. **Umfang bestimmen.** Enthalten die Argumente `--uncommitted`, `--base <zweig>` oder
   `--commit <sha>`, diesen Umfang verwenden. Sonst: Hat der aktuelle Zweig Commits gegenüber
   `main` (`git rev-list --count main..HEAD` > 0), dann `--base main`; gibt es nur
   uncommittete Änderungen, `--uncommitted`. Gibt es nichts zu prüfen, abbrechen und das sagen.

2. **Codex aufrufen** (im Hintergrund, lange Zeitgrenze), Ausgabe in den Scratchpad schreiben.
   `codex review` liest AGENTS.md selbst; mit `--base`, `--commit` oder `--uncommitted`
   akzeptiert es **keine** eigenen Prüfhinweise (CLI 0.162 bricht sonst ab):

   ```bash
   codex review <umfang> -c windows.sandbox="unelevated" -c model_reasoning_effort="high" \
     > <scratchpad>/codex-review-<zeitstempel>.md 2> <scratchpad>/codex-review-<zeitstempel>.err
   ```

   Enthalten die Argumente zusätzliche Prüfhinweise, stattdessen eine schreibgeschützte
   Prüfung mit eigenem Auftrag:

   ```bash
   codex exec -s read-only --ephemeral -c windows.sandbox="unelevated" \
     -c model_reasoning_effort="high" -o <scratchpad>/codex-review-<zeitstempel>.md -C <repo> \
     "Prüfe die Änderungen aus 'git diff <basis>...HEAD' nach den Regeln in AGENTS.md.
      Schwerpunkt: <Prüfhinweise>. Nenne je Befund Datei:Zeile, Fehlerszenario und
      Schweregrad. Ändere nichts." 2> <scratchpad>/codex-review-<zeitstempel>.err
   ```

   `<basis>` ist die Basis aus den Argumenten (`--base <zweig>`, sonst `main`). Beim
   Phasen-Review auf `main` ist das das Tag `m<n-1>` – `main...HEAD` wäre dort leer.

   `windows.sandbox="unelevated"` ist nötig, weil die erhöhte Windows-Sandbox für die
   npm-CLI nicht eingerichtet ist; die Desktop-App bleibt unberührt.

3. **Jeden Befund nachprüfen.** Die genannte Stelle lesen und einordnen:
   - **bestätigt** — Fehler ist am Code nachvollziehbar (konkretes Szenario benennen)
   - **verworfen** — mit Begründung (z. B. Stelle existiert so nicht, Invariante anderswo gesichert)
   - **unklar** — was zur Entscheidung fehlt

4. **Bericht** an Lucas: Tabelle mit Befund, Einordnung, Begründung. Bestätigte Befunde, die
   zur laufenden Aufgabe gehören, im Haupt-Checkout beheben und das Prüf-Gate (AGENTS.md,
   *Build & Run*) erneut ausführen; größere oder fremde Befunde als offene Punkte vorschlagen.
   Gibt es einen Pull Request, gehören bestätigte und verworfene Befunde (mit Begründung) in
   dessen Beschreibung oder einen Kommentar — erst nach Rückmeldung von Lucas veröffentlichen.
