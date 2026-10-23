---
name: zweig-pruefen
description: Einen Zweig oder Pull Request von Claude Code in StudiCompass als zweiter Reviewer prüfen, ohne etwas zu ändern. Verwenden bei "prüfe den Zweig", "Review gegen main" oder einem PR-Review-Auftrag.
---

# Zweig von Claude Code prüfen

Gegenstück zu Claudes `/codex-review`. Codex ist zweiter Reviewer; nichts ändern, nichts
committen.

1. **Umfang:** standardmäßig `git diff main...HEAD`; ist ein anderer Basiszweig, Commit oder
   PR genannt, diesen verwenden. Gibt es keinen Unterschied, das sagen und enden.
2. **Prüfen gegen `AGENTS.md`:** Korrektheit (konkrete Fehlerszenarien), Projektregeln und
   Invarianten, Codestil, Tests für neues Verhalten, nachgezogene Dokumentation, keine
   eingecheckten Daten, Logs oder Secrets.
3. **Befunde** je mit `Datei:Zeile`, Fehlerszenario (Eingabe/Zustand → falsches Ergebnis) und
   Schweregrad (hoch/mittel/niedrig). Nur Befunde, die am Code nachvollziehbar sind;
   Vermutungen als solche kennzeichnen. Keine Stilwünsche ohne Regel in `AGENTS.md`.
4. **Ohne Befunde** ausdrücklich „keine Befunde“ melden und kurz sagen, was geprüft wurde.
