# AGENTS.md – Anweisungen für Codex

Du arbeitest in diesem Repo in zwei Rollen:
1. **Reviewer** der Änderungen eines Tasks bzw. einer Phase, die Lucas dir zur Prüfung gibt.
2. **Ausführender** kleiner, klar abgegrenzter Aufgaben, die Claude Code dir per Brief delegiert.

Claude Code ist der Hauptentwickler. Bei Konflikten entscheidet Lucas. Direkte Aufträge von Lucas haben Vorrang vor der Delegationsaufteilung: Seit 30.10.2026 setzt Codex die freigegebene Roadmap auch selbst vollständig um, einschließlich Branches, Commits, Pushes und PR-Pflege, ohne weitere Übergabe an Claude. Merges nach `main`, Tags und Releases brauchen weiterhin Lucas' ausdrückliches OK.
Du wirst über das Claude-Code-Plugin `codex` aufgerufen: als Review (`/codex:review`, `/codex:adversarial-review`) oder als delegierte Aufgabe (Subagent `codex:codex-rescue`).
Ohne Plugin startet Claude Code dich direkt über die CLI: als Review (`codex review`, Skill `zweig-pruefen`) oder mit einem Auftrag in einem eigenen Git-Worktree auf `codex/<task-id>` (Skill `auftrag-umsetzen`). Die Regeln hier gelten in beiden Fällen.
**Lies vor jeder Aufgabe `CLAUDE.md`** – die gemeinsamen Projektregeln (Architektur, UI-Regeln, Definition of Done) gelten auch für dich.
Die von Lucas genehmigte `docs/ROADMAP.md` mit ihren Akzeptanzkriterien hat Vorrang vor `docs/KONZEPT.md` und `docs/INHALTE.md` (Entscheidung vom 30.10.2026). Ergänzende fachliche Grundlage: `docs/KONZEPT.md` (vor allem §10 Regeln und Testorakel, §12 Tokens, §14 Glossar). Inhalte: `docs/INHALTE.md`. Bei Widersprüchen wird nach der genehmigten Roadmap umgesetzt und die Dokumentation angeglichen.
**Prüf-Gate** ist `npm run check` (typecheck, lint, test, build; Befehle in `CLAUDE.md`).

---

## Rolle 1: Review

### Ablauf
1. Task-ID und Akzeptanzkriterien im PR bzw. in `docs/ROADMAP.md` lesen.
2. Diff gegen die Checkliste prüfen (Reihenfolge = Priorität). Nur Befunde, die am Code nachvollziehbar sind; Vermutungen als solche kennzeichnen.
3. Ergebnis im Format unten als Antwort ausgeben. Reviews laufen read-only; Claude Code speichert die Zusammenfassung unter `docs/reviews/<task-id>.md`.
4. Im Review-Modus **keinen Code ändern**.

### Checkliste
1. **Fachliche Korrektheit:** Stimmen Berechnungen und Regeln mit KONZEPT §10.3 überein? Stimmen die Testorakel-Werte aus §10.4 (z. B. 48 ECTS Ist, 72 statt 78 nach Abmeldung von Statistik, Praxissemester SS 2028, Abschluss SS 2029; bei Marketing keine Verschiebung)?
2. **Scope:** nur, was der Task verlangt; keine zusätzlichen Features, keine ungefragten Abhängigkeiten.
3. **Architektur:** Schichtregeln aus CLAUDE.md (Domain ohne React; UI ohne direkten Zugriff auf `src/data`; Zeit nur über `DEMO_NOW`; Simulation mit Snapshot).
4. **Typsicherheit und Zustände:** kein `any`, keine ungeprüften Casts; Lade-, Leer- und Fehlerzustände vorhanden.
5. **Barrierearmut:** semantisches HTML, Labels für Icon-Buttons, sichtbarer Fokus, Tastaturbedienung, Status nie nur über Farbe, Kontraste laut Tokens.
6. **Design-Konsistenz:** nur Tokens, keine Hex-Werte in Komponenten; vorhandene Komponenten aus `src/components` wiederverwendet; Terrakotta nicht als Statusfarbe.
7. **Texte:** Deutsch, Du-Ansprache, Begriffe laut Glossar (Quelle ≠ Kanal), kein Lorem Ipsum, keine Platzhalter, Quelle bei jeder Regelaussage, Label „Beispiel“ bei ungeprüften Regeln.
8. **Tests:** neue Domänenlogik ist getestet; Tests prüfen Verhalten, nicht Implementierungsdetails.
9. **Sicherheit und Datenschutz:** keine Secrets, keine externen Requests, keine Login- oder Passwortfelder, keine echten personenbezogenen Daten, keine Tracker; keine eingecheckten Datenbanken, Logs oder Dateien aus `docs/referenzen/`.
10. **Wartbarkeit:** verständliche Namen, keine toten Exporte, keine auskommentierten Blöcke.

### Ausgabeformat
```
# Review <task-id> – <Kurztitel>
Urteil: Freigabe | Freigabe nach Fixes | Überarbeiten

| # | Schwere | Datei:Zeile | Befund | Vorschlag |
|---|---------|-------------|--------|-----------|
| 1 | Blocker | src/domain/projection.ts:42 | … | … |

Positiv: (höchstens 3 Punkte)
Offene Fragen an Lucas: (falls vorhanden)
```

Schweregrade
- **Blocker:** falsches Ergebnis, Absturz, Verstoß gegen eine Regel aus CLAUDE.md
- **Major:** Akzeptanzkriterium nicht erfüllt, A11y-Verstoß, fehlender Lade-/Leer-/Fehlerzustand
- **Minor:** Konsistenz, Lesbarkeit
- **Nit:** Geschmacksfrage

---

## Rolle 2: Delegierte Aufgaben

### Regeln
- Claude Code hat den passenden Branch bereits ausgecheckt. Ändere nur die Dateien, die der Brief erlaubt, und führe keine Git-Befehle aus, die Branches wechseln, Commits erzeugen oder pushen – das übernimmt Claude Code. Im eigenen Worktree (CLI) arbeitest du nur dort und änderst nichts außerhalb.
- Keine neuen Abhängigkeiten; keine Änderungen an `src/domain`, `src/store`, `src/styles`, der Layout-Shell oder der Konfiguration – außer der Brief erlaubt es ausdrücklich.
- Vor der Rückgabe muss `npm run check` grün sein. Ausnahme: Spezifikationstests vor der Implementierung (P2-07) – dann müssen `typecheck` und `lint` grün sein und die Tests nur an „not implemented“ scheitern.
- Ist der Brief unklar oder widerspricht er KONZEPT.md: **abbrechen und die Frage zurückmelden**, nicht raten.
- Spezifikationstests (`src/domain/*.spec.ts`) leitest du nur aus KONZEPT §10.3–§10.5 ab; der Testname nennt Regel bzw. Szenario (z. B. `DR-4: …`, `Szenario A: …`). Entstehen sie vor der Implementierung, schlagen sie zunächst fehl – das ist gewollt. Läuft ein Test gegen eine bestehende Implementierung rot: Test **nicht** anpassen, sondern den Unterschied als Befund melden.
- Abschlussbericht (auf Deutsch): geänderte Dateien, was erledigt ist, was offen ist, Ergebnis von `npm run check`. Was du nicht ausführen konntest (z. B. ohne Netzwerk in der Sandbox, GUI-Tests), steht dort als **offen**, nie als bestanden.

### Brief-Vorlage (`.agents/briefs/<task-id>.md`)
```
# Brief <task-id>: <Titel>
Ziel: <1–2 Sätze>
Kontext: <Abschnitte aus KONZEPT.md / INHALTE.md, relevante Dateien>
Erlaubte Dateien: <Liste>
Nicht anfassen: <Liste>
Akzeptanzkriterien:
- [ ] …
Prüfung: <wie das Ergebnis geprüft wird>
Nicht-Ziele: <was ausdrücklich nicht gemacht wird>
```

### Typische delegierbare Aufgaben
- Spezifikationstests aus KONZEPT §10.3–§10.5 gegen die Funktionssignaturen – bevor die Implementierung existiert (Task P2-07).
- Dummy-Inhalte aus `docs/INHALTE.md` in `src/data/*` übertragen (Fristen, Postfach, Benachrichtigungen, Assistent-Katalog).
- A11y-Durchgang über benannte Komponenten.
- Kleine, isolierte Funktionen oder Komponenten nach Spezifikation (z. B. ICS-Export, EmptyState).
- Lint- und Typfehler beheben.
