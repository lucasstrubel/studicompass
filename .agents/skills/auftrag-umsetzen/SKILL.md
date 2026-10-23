---
name: auftrag-umsetzen
description: Einen von Claude Code delegierten Auftrag in StudiCompass umsetzen (eigener Worktree, Zweig codex/<thema>, nicht committen, Ergebnisbericht). Verwenden, wenn ein Auftrag als codex-auftrag-*.md oder mit dem Hinweis "Auftrag von Claude Code" kommt.
---

# Auftrag von Claude Code umsetzen

Gegenstück zu Claudes `/codex-aufgabe`. Es gelten die Regeln aus `AGENTS.md`, Abschnitt
„Zusammenarbeit von Claude Code und Codex“.

1. **Zweig abwarten.** Erst beginnen, wenn `git branch --show-current` den Zweig
   `codex/<thema>` aus dem Auftrag zeigt — Claude legt ihn an, die Sandbox kann es nicht.
   Zeigt er nach kurzer Zeit noch einen losgelösten HEAD, das melden statt selbst einen Zweig
   anzulegen.
2. **Nur im eigenen Worktree arbeiten.** Nichts außerhalb ändern, **nicht committen**, nicht
   pushen. Vorhandenen Code wiederverwenden, den Stil aus `AGENTS.md` übernehmen.
3. **Unklarheiten** nicht mit Annahmen füllen: offene Fragen im Bericht stellen. Weicht der
   Auftrag von `AGENTS.md` ab, gilt `AGENTS.md`; den Widerspruch benennen.
4. **Prüfen.** Das Prüf-Gate aus `AGENTS.md` (*Build & Run*) ausführen, möglichst offline.
5. **Ergebnisbericht** (auf Deutsch, letzte Nachricht):
   - geänderte Dateien mit je einem Satz zum Warum
   - Ergebnis des Prüf-Gates (Befehl und Ausgabe-Zusammenfassung)
   - neue oder angepasste Tests
   - offene Punkte und Fragen; was nicht ausgeführt werden konnte (Netzwerk, GUI, fehlende
     Werkzeuge), steht hier als **offen**, nie als bestanden
