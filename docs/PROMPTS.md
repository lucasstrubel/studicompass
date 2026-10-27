# Prompt-Vorlagen für Claude Code und Codex

- Platzhalter in `<spitzen Klammern>` ersetzen.
- **Eine neue Unterhaltung pro Task** im Claude-Code-Panel. `CLAUDE.md` lädt automatisch, der Kontext bleibt klein.
- Plan-Modus: Prompt mit `/plan` beginnen – oder den Modus unten im Eingabefeld auf „Plan“ stellen und den Text ohne `/plan` senden.
- Für die Umsetzung danach „Auto“ oder „Edit automatically“ wählen.

---

## 0 Session 0 – einmalig vor dem ersten Task

```
Wir starten mit der Entwicklung des Prototyps. Schreib in dieser Session noch keinen App-Code und ändere keine Dateien.
1. Lies CLAUDE.md, AGENTS.md und alle Dateien in docs/; sieh dir die Bilder in docs/referenzen/ an. Fasse in höchstens 10 Punkten zusammen: was du baust, welche Regeln gelten und wie wir mit Codex zusammenarbeiten.
2. Prüfe die Umgebung und melde, was fehlt: node -v (Vite braucht mindestens 20.19 bzw. 22.12), npm -v, git status, git remote -v, gh auth status, codex --version.
3. Lies die Dokumente kritisch: Nenne Widersprüche, Lücken und Werte in docs/KONZEPT.md §10.4, die du aus docs/INHALTE.md nicht nachrechnen kannst.
4. Welche Tasks in docs/ROADMAP.md sind für dich unklar oder zu groß?
```

Prüfe in der Antwort:
- Demo-Zeit Mo, 25.01.2027, 19:30
- Testorakel: 48 ECTS; Abmeldung Statistik → 72 ECTS, Praxissemester SS 2028, Abschluss SS 2029; Marketing ohne Verschiebung
- Quelle ≠ Kanal
- Ablauf von Review und Delegation

Fehlt das, ist meist nicht der Repo-Ordner selbst in VS Code geöffnet.

---

## 1 Task umsetzen (Standard)

```
/plan Task <ID> aus docs/ROADMAP.md.
Lies den Task mit seinen Akzeptanzkriterien und die dort genannten Abschnitte aus docs/KONZEPT.md und docs/INHALTE.md.
Plan: betroffene Dateien, Schritte, wie du jedes Akzeptanzkriterium prüfst, offene Fragen.
Nach meiner Freigabe: Umsetzung auf Branch feat/<ID>-<kurzname>, dann npm run check und Commit.
Zum Schluss: Zusammenfassung mit Story-IDs (US-xx), VPC-Bezug (P1–P5, G1–G4) und was ich im Browser prüfen soll.
```

### Zusätze für einzelne Tasks (unten an den Standard-Prompt anhängen)

**P1-01**
```
Zusatz: Das Repo ist nicht leer. Scaffolde mit create-vite (Template react-ts) in einen temporären Unterordner _scaffold, übernimm die Dateien ins Root, führe README.md und .gitignore zusammen und lösche _scaffold danach. Nie „Remove existing files“ oder --overwrite verwenden. CLAUDE.md, AGENTS.md und docs/ bleiben unverändert.
```

**P1-02**
```
Zusatz: Lies vor dem Start https://ui.shadcn.com/docs/installation/vite und richte dich nach dem aktuellen Stand. Bei Peer-Dependency-Konflikten (z. B. zwischen Vite und @tailwindcss/vite) stoppen und mir die Optionen zeigen.
```

**P1-03**
```
Zusatz: Sieh dir docs/referenzen/referenz-2-warm-ink.png an. Maßgeblich sind die Token-Werte und Kontraste aus KONZEPT §12.2, nicht das Bild.
```

**P1-04, P3-02**
```
Zusatz: Sieh dir docs/referenzen/referenz-1-dashboard.png an und setze die Abweichungen aus KONZEPT §12.1 um (Studienstand statt Monatskalender, rechte Spalte laut §8 S1).
```

**P2-06**
```
Zusatz: Nur Signaturen mit JSDoc und Rumpf „not implemented“ – noch keine Logik. Branch feat/P2-06-domain; P2-07 und P2-08 laufen auf demselben Branch.
```

---

## 2 Plan prüfen – deine Checkliste vor der Freigabe

- [ ] Nur Dateien und Funktionen dieses Tasks, nichts aus dem Ideenparkplatz (KONZEPT §5.2)
- [ ] Jedes Akzeptanzkriterium hat eine konkrete Prüfung
- [ ] Neue Abhängigkeiten nur aus dem Stack in `CLAUDE.md`
- [ ] Zeit über `DEMO_NOW`, Farben über Tokens, Texte aus `docs/INHALTE.md`
- [ ] Bei Logik: Werte aus KONZEPT §10.4 als Testfälle genannt
- [ ] Offene Fragen sind beantwortet

Fehlt etwas: den Plan kommentieren, nicht freigeben.

---

## 3 Sichtprüfung (du selbst)

1. `npm run dev` → http://localhost:5173
2. Chrome-DevTools → Gerätesymbolleiste (`Cmd+Shift+M` / `Ctrl+Shift+M`) → 1440×900 und 390×844
3. Mit `Tab` durch den Screen: Ist der Fokus immer sichtbar?
4. Fällt dir etwas auf, kopierst du es wörtlich in die laufende Unterhaltung.

---

## 4 Review mit Codex

Claude Code startet jedes Review selbst über `/codex-review` (CLI, read-only) und arbeitet es in derselben Unterhaltung ab – du musst nichts tippen. Falls du anstoßen willst:

**Nach jedem Task:**
```
Starte das Codex-Review mit /codex-review --base main und arbeite es ab: Blocker und Major beheben; widersprichst du einem Befund, begründe es. Minor und Nit nur, wenn sie diesen Task betreffen. Speichere die Zusammenfassung unter docs/reviews/<ID>.md (Format aus AGENTS.md plus „Umgesetzt“ und „Abgelehnt mit Begründung“). Dann npm run check und Commit.
```

**Zusätzlich bei P2-08, P3-03 und P3-04** (zweites Review mit Fokus):
```
/codex-review --base main Prüfe gegen docs/KONZEPT.md §10.3–10.5 und die Testorakel-Werte in §10.4, besonders Szenario A (Statistik) gegen D (Marketing). Nutze Checkliste, Schweregrade und Ausgabeformat aus AGENTS.md.
```

**Am Ende jeder Phase** (`m<n-1>` = Tag des vorigen Gates, z. B. `m0` für Phase 1):
```
/codex-review --base m<n-1> Prüfe alle Änderungen dieser Phase auf Konsistenz: Architekturregeln aus CLAUDE.md, Tokens statt Hex-Werten, Glossar-Begriffe, Lade-, Leer- und Fehlerzustände, Barrierearmut. Nutze Checkliste und Ausgabeformat aus AGENTS.md.
```

- Reviews mit Fokus laufen als `codex exec -s read-only`; dafür fragt Claude Code einmal nach deiner Freigabe.
- Test und Build kann Codex in seiner Sandbox nicht ausführen (`spawn EPERM`) – dort gelten sie als offen. Nachweis ist der lokale `npm run check` von Claude Code.
- Du kannst jedes Review weiterhin selbst über das Plugin starten (`/codex:review`, `/codex:adversarial-review`; bei langen Läufen mit `--background`, später `/codex:status` und `/codex:result`).

---

## 5 Task abschließen

```
Schließe <ID> ab: Hake den Task in docs/ROADMAP.md ab, committe und pushe den Branch. Erstelle mit gh einen PR (Titel „<ID>: <Kurztitel>“; Beschreibung: Stories, VPC-Bezug, Review-Ergebnis, was zu prüfen ist) und zeig mir den Link. Merge erst nach meinem OK per Squash, lösche den Branch und aktualisiere main lokal.
```

Vor deinem OK: Vercel-Preview-Link im PR öffnen und kurz durchklicken (ab P1-05).
Ohne `gh`: „… merge lokal per Squash nach main und pushe main.“

---

## 6 Aufgabe an Codex delegieren

```
Delegiere <ID> an Codex nach CLAUDE.md („Zusammenarbeit mit Codex“). Zeig mir zuerst den Brief unter .agents/briefs/<ID>.md. Nach meinem OK: Branch auschecken, an codex:codex-rescue übergeben, danach den Diff gegen den Brief prüfen, npm run check ausführen und mir berichten.
```

- Manuelle Alternative: `/codex:rescue Lies AGENTS.md und .agents/briefs/<ID>.md und setze den Brief um.`
- Bei P2-07 bleibt der Branch `feat/P2-06-domain`.

---

## 7 Gate prüfen (Phasenende)

```
Prüfe Gate M<n> aus docs/ROADMAP.md am aktuellen Stand von main: Geh jeden Task der Phase durch, prüfe jedes Akzeptanzkriterium (Befehle ausführen, Routen und Werte prüfen) und liste, was offen ist. Ändere nichts. Ist alles erfüllt, setz nach meinem OK das Tag m<n> und pushe es.
```

---

## 8 Inhalte geändert (z. B. nach P0-02)

```
docs/INHALTE.md wurde aktualisiert (siehe git diff). Prüfe, ob sich dadurch Werte in docs/KONZEPT.md §10.4 ändern: Rechne Basis und Szenarien A–D neu, zeig mir die Unterschiede und schlag Anpassungen an §10.4 sowie – falls schon vorhanden – an src/data und den Tests vor. Erhöhe die Persist-Version. Spezifikationstests änderst du erst nach meinem OK.
```

---

## 9 Wenn es hakt

| Situation | Was du tust |
|---|---|
| Claude baut mehr als verlangt | „Stopp – das steht nicht in KONZEPT.md. Trag die Idee als Zeile in §5.2 (Ideenparkplatz) ein und mach mit dem Task weiter.“ |
| Tests rot, Claude will Tests ändern | „Ändere keine Spezifikationstests. Zeig mir zuerst, wo Implementierung und KONZEPT §10 auseinanderlaufen.“ |
| npm-Konflikt | „Kein --force, kein --legacy-peer-deps. Zeig mir den Konflikt und die Optionen.“ |
| UI wirkt generisch | „Vergleiche den Screen mit KONZEPT §8 und §12 und den Bildern in docs/referenzen/. Nenne die drei größten Abweichungen, bevor du etwas änderst.“ |
| Ergebnis unbrauchbar | Maus über die Nachricht vor dem Fehler → „Rewind code to here“, dann den Prompt präzisieren |
| Unterhaltung wird lang oder langsam | Übergabe (§10), dann neue Unterhaltung |

---

## 10 Übergabe an eine neue Unterhaltung

```
Fasse den Stand für eine neue Unterhaltung zusammen: Task, erledigte Schritte, offene Akzeptanzkriterien, nächste Schritte, betroffene Dateien, offene Fragen. Als kurze Liste, die ich dort einfüge.
```

---

## 11 Screenshots (ab P3-05)

```
Erzeuge mit dem Screenshot-Skript Bilder aller Kernscreens (1440×900 und 390×844) nach docs/screens/ und vergleiche sie mit KONZEPT §8. Liste Abweichungen, ändere noch nichts.
```
