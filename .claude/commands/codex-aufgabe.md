---
description: Aufgabe an Codex als zweiten Programmierer (eigener Worktree), danach Review, Prüf-Gate und Commit durch Claude
argument-hint: "<Aufgabe in eigenen Worten>"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git worktree list:*), Bash(git branch:*), Read, Grep, Glob, Write
---

Übergib eine abgegrenzte Aufgabe an Codex. Codex arbeitet in einem eigenen Git-Worktree auf
einem Zweig `codex/<thema>`; der Haupt-Checkout bleibt Claudes Arbeitskopie (AGENTS.md,
Abschnitt „Zusammenarbeit“). `codex exec` bleibt bewusst hinter einer Rückfrage, damit Lucas
jede Delegation sieht.

Aufgabe: $ARGUMENTS

**Arbeitsteilung bei Git:** Die Codex-Sandbox darf nicht in das gemeinsame `.git`-Verzeichnis
schreiben. Claude legt den Zweig im Codex-Worktree an und committet nach dem Review; Codex
ändert nur Dateien und führt das Prüf-Gate aus.

1. **Eignung prüfen.** Gut geeignet: klar umrissene Änderungen mit überprüfbarem Ergebnis
   (Tests, Refactoring in einem Modul, Dokumentationsabgleich). Nicht delegieren: Pushen,
   Releases, Secrets, Repository-Einstellungen, Änderungen an bereits ausgelieferten
   Datenbankmigrationen. Ist die Aufgabe unklar, zuerst bei Lucas nachfragen.

2. **Auftrag schreiben** nach `<scratchpad>/codex-auftrag-<thema>.md`, auf Deutsch, mit:
   - Ziel und fachlichem Hintergrund
   - betroffene Dateien und vorhandener Code, der wiederverwendet werden soll
   - Akzeptanzkriterien und erwartete Tests
   - Grenzen: nur im eigenen Worktree arbeiten, **nicht committen**, nicht pushen, nichts
     außerhalb des Worktrees ändern; der Zweig `codex/<thema>` ist bereits ausgecheckt
   - Abschluss: das Prüf-Gate aus AGENTS.md (*Build & Run*) ausführen, möglichst offline,
     und im Ergebnisbericht geänderte Dateien, Ergebnis des Prüf-Gates und offene Punkte
     nennen; nicht Ausführbares als offen melden

3. **Worktree vorbereiten und Codex starten.** Codex legt den Worktree beim Start selbst an
   (`~/.codex/worktrees/<id>/StudiCompass`, losgelöster HEAD). Deshalb den Auftrag direkt
   starten und Codex anweisen, mit der Umsetzung erst zu beginnen, wenn
   `git branch --show-current` den Zweig `codex/<thema>` zeigt:

   ```bash
   codex exec --worktree -s workspace-write -c windows.sandbox="unelevated" \
     -o <scratchpad>/codex-ergebnis-<thema>.md -C <repo> - \
     < <scratchpad>/codex-auftrag-<thema>.md 2> <scratchpad>/codex-lauf-<thema>.err
   ```

   Sobald der Worktree in `git worktree list` erscheint, dort den Zweig anlegen:
   `git -C <worktree> switch -c codex/<thema>`. Die Sitzungs-ID steht in der `.err`-Datei
   (`session id:`); Rückfragen und Fortsetzungen laufen mit
   `cd <worktree> && codex exec resume <session-id> -c windows.sandbox="unelevated" -c model_reasoning_effort="high" "<text>"`.

4. **Ergebnis prüfen**, wenn der Lauf fertig ist:
   - Ergebnisbericht lesen; `git -C <worktree> diff` wie ein Code-Review durchgehen
     (Korrektheit, Stil nach AGENTS.md, Tests vorhanden, Doku nachgezogen)
   - Prüf-Gate im Worktree selbst ausführen — die Angabe von Codex nicht ungeprüft übernehmen

5. **Rückmeldung oder Übernahme.**
   - Mängel: zurück an Codex per `codex exec resume`, danach erneut Schritt 4
   - In Ordnung: im Worktree committen (Konventionen aus AGENTS.md, Co-Author-Zeile für Codex
     nicht nötig), Lucas den Stand zusammenfassen (Diff-Umfang, Review-Ergebnis, Prüf-Gate).
     Pushen und Pull Request erst nach Freigabe durch Lucas; danach prüft Codex auf GitHub erneut.
