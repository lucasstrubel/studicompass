# StudiCompass – klickbarer Prototyp (SE2, Studienleistung III)

Arbeitstitel „StudiCompass“ – der Name steht nur in `src/config/demo.ts` (`APP_NAME`).

## Worum es geht
Web-App, die Studierenden der TH Mannheim hilft, ihren Studienstand zu überblicken und Entscheidungen mit Folgen (z. B. eine Prüfungsabmeldung) informiert zu treffen. Sie bündelt POS, Moodle, Hochschul-Mail und Website und beantwortet Fragen zur Prüfungsordnung mit Quellenangabe.
Ziel ist ein **selbsterklärender Hi-Fi-Prototyp** für die Präsentation am **Fr, 06.11.2026** – kein Produktivsystem. Alle Hochschul-Schnittstellen sind **Dummy-Daten**.
Primäre Persona: **Niklas Brandt**, 20, Wirtschaftsinformatik, 3. Semester, Nebenjob 15 Std./Woche.

## Verbindliche Dokumente – vor jeder Umsetzung lesen
| Datei | Inhalt |
|---|---|
| `docs/ROADMAP.md` | Reihenfolge, Tasks mit IDs, Akzeptanzkriterien, Owner ([Claude] / [Codex] / [Team] / [Lucas]) |
| `docs/KONZEPT.md` | Was gebaut wird: Scope, Screens, Hero-Flow, Domänenmodell, Regeln, Testorakel, Design-Tokens, Glossar |
| `docs/INHALTE.md` | Alle Dummy-Inhalte (Module, Prüfungen, Fristen, Postfach, Regeln, Assistent) |
| `docs/TESTPLAN.md` | Evaluation in Phase 5 |
| `docs/PROMPTS.md` | Prompt-Vorlagen für Lucas (für dich nur Kontext) |
| `docs/referenzen/` | `referenz-1-dashboard.png` = Layout-Orientierung (Abweichungen in KONZEPT §12.1) · `referenz-2-warm-ink.png` = Farbwelt (Werte in KONZEPT §12.2). Nicht pixelgenau nachbauen. Nur lokal vorhanden: fremde Designs, im öffentlichen Repo per `.gitignore` ausgeschlossen |
| `AGENTS.md` | Regeln für Codex (Review und delegierte Aufgaben). Für Claude Code nur bei Bedarf relevant, z. B. für die Brief-Vorlage – die Reviewer-Rolle dort gilt nicht für dich |

- Arbeite immer genau **einen Task** aus `docs/ROADMAP.md` ab; bei größeren Tasks zuerst im Plan-Modus planen und den Plan gegen die Akzeptanzkriterien prüfen.
- Baue nichts, was nicht in KONZEPT.md steht. Neue Ideen → eine Zeile in KONZEPT §5.2 „Ideenparkplatz“.
- Fachliche Unklarheit oder Widerspruch zwischen Dokumenten → Lucas fragen, nicht raten. Offene Fragen im Ergebnisbericht stellen, nicht stillschweigend entscheiden.
- App-Starts und GUI-Tests öffnen Fenster auf Lucas' Desktop: vorher ankündigen.

## Stack
Vite · React · TypeScript (strict) · React Router · Tailwind CSS · shadcn/ui (Radix) · lucide-react · Zustand (persist) · Recharts (über shadcn `chart`) · date-fns (Locale `de`) · Vitest + Testing Library · optional Playwright · Fontsource (Manrope, lokal) · Deployment: Vercel (statisch, SPA-Rewrite).
Aktuelle stabile Versionen verwenden und in `package.json` festhalten. Kein Backend, keine Datenbank, keine Authentifizierung, keine Requests an fremde Server.
- Vor Setup-Schritten die aktuelle offizielle Anleitung lesen (Vite, Tailwind CSS, shadcn/ui) – Versionen und Init-Befehle ändern sich.
- Peer-Dependency-Konflikte nicht mit `--force` oder `--legacy-peer-deps` überdecken: stoppen und Konflikt samt Optionen an Lucas melden.

## Befehle
```
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build
npm run preview    # Build lokal ansehen
npm run lint       # ESLint
npm run typecheck  # tsc -b
npm run test       # Vitest
npm run check      # typecheck + lint + test + build  ← Prüf-Gate: muss vor jedem PR grün sein
npm run e2e        # Playwright-Smoke-Test des Hero-Flows (installiertes Chrome, nicht Teil von check)
npm run screens    # Screenshots der Kernscreens nach docs/screens/ (2 Viewports × 2 Themes)
```
Bis das Projekt aufgesetzt ist (P1-01), gilt als Prüf-Gate: Änderungen sind nachvollziehbar beschrieben und manuell geprüft.

## Ordnerstruktur
```
src/
  app/          App.tsx, router.tsx, providers.tsx (Theme, Toaster, Tooltip)
  features/     je Bereich Seite + Teilkomponenten:
                dashboard/ planner/ modules/ decision/ assistant/ inbox/ deadlines/ settings/ onboarding/
                dev-ui/ (Entwickler-Route /_ui, nur im Dev-Build)
  components/
    ui/         shadcn-Komponenten (generiert)
    layout/     AppShell, NavigationMenu, Topbar, RightRail
    common/     StatusBadge, ChannelBadge, Countdown, EctsProgress, ConsequenceItem,
                CitationList, DemoBadge, EmptyState, ErrorState, PageHeader
  domain/       reines TypeScript: types, terms, progress, rules, projection, decision, grades,
                assistant-matching (+ *.test.ts daneben)
  services/     Interfaces je Kanal und Regelwerk; mock/ mit Latenz und optionalem Fehler
  data/         Dummy-Daten aus docs/INHALTE.md
  store/        Zustand-Store, Selektoren
  config/       demo.ts (APP_NAME, DEMO_NOW, LATENCY_MS, FLAGS, THEME_STORAGE_KEY)
  lib/          cn, Formatierung (Datum, Countdown, ECTS, Noten), ics
  styles/       globals.css (Tailwind, Design-Tokens hell/dunkel)
```

## Architekturregeln
Abhängigkeiten nur in diese Richtung: UI → Store/Selektoren → Domain; Store → Services → Data.
- `src/domain` ist pure TypeScript: keine React-Imports, keine Seiteneffekte, vollständig unit-getestet.
- UI importiert **nie** direkt aus `src/data`; Daten kommen über Services in den Store.
- Jeder Kanal (POS, Moodle, Mail, Website) und das Regelwerk haben ein eigenes Service-Interface. Mocks simulieren Latenz (300–700 ms) und optional Fehler (`FLAGS.simulateErrors`).
- „Jetzt“ ist ausschließlich `DEMO_NOW` – nie `new Date()` oder `Date.now()` in Komponenten oder Domäne.
- Simulierte Aktionen (z. B. Abmeldung) ändern nur den Store, speichern vorher einen Snapshot (Rückgängig) und sind im UI als Simulation erkennbar.
- Persistenz über Zustand `persist` mit `version`. Ändern sich Dummy-Daten: Version erhöhen, damit alte Demo-Stände verworfen werden. „Demo zurücksetzen“ in den Einstellungen.
- Theme: Komponenten lesen und setzen es über `useTheme()`. Gespeichert wird nur über `readStoredTheme`/`writeStoredTheme` in `src/lib/theme.ts`; denselben Schlüssel liest das Init-Skript in `index.html`. Ab P2-05 übernimmt der Store `setTheme`, ohne zweiten Speicherort.
- Die Werte aus KONZEPT §10.4 sind das Testorakel. Weicht Code davon ab, ist zuerst der Code verdächtig.
- Tests: `*.test.ts` schreibst du selbst. `src/domain/*.spec.ts` sind Spezifikationstests von Codex, abgeleitet aus KONZEPT §10 – die änderst du nur nach Rücksprache mit Lucas.

## UI- und Inhaltsregeln
- Designrevision P1-07: Referenz 1 bestimmt Ästhetik, kompakte Karten und lokale Linienillustrationen. Referenz 2 liefert ausschließlich die Farbpalette. Topnavigation und Hamburger-Overlay statt permanenter Sidebar und mobiler Tab-Leiste (KONZEPT §7, §12.1).
- Die Übersicht liest seit P3-02 alle Werte über Store-Selektoren (`src/store/selectors.ts`); Lade- und Fehlerzustände je Kanal über `ResourceBoundary`.
- UI auf Deutsch mit Du-Ansprache; Code, Bezeichner und Commits auf Englisch; Dokumentation (README, CHANGELOG, `docs/`) auf Deutsch. Begriffe laut Glossar (KONZEPT §14) – insbesondere **Quelle** (Beleg) ≠ **Kanal** (Herkunftssystem).
- Farben **nur über Tokens** aus `src/styles/globals.css` (Werte: KONZEPT §12.2). Keine Hex-Werte in Komponenten.
- Terrakotta (`--accent`) ist Markenfarbe, **nie** Statusfarbe und nie Text auf hellem Grund (dort `--accent-strong`). Text auf Terrakotta-Flächen in `--accent-foreground` (Tinte). Neutrale Hover- und Auswahlflächen (Menüs, Listen) sind `bg-muted`, nicht `bg-accent`. Bringt eine neue shadcn-Komponente `bg-accent` als Hover mit, beim Hinzufügen umstellen.
- Helles Theme: Creme als Arbeitsfläche, Weiß als Karte, warme neutrale Nebenflächen; lange Texte in Tinte statt Terrakotta. Die hervorgehobene Terrakotta-Karte verwendet Tinte für Text und Fokusring. Informationshaltige Fortschrittsbalken nutzen `--accent-strong` statt `--accent` (Kontrastrevision P1-07).
- Schriftgrößen über die Typo-Klassen aus KONZEPT §12.3 (`text-page-title` … `text-figure`); Zahlen (ECTS, Countdown, Noten) mit `tabular-nums`.
- Status „Im Plan / Knapp / Kritisch“ immer als Icon + Text + Farbe.
- Hi-Fi-Regel (VL05): realistische deutsche Texte aus `docs/INHALTE.md`; kein Lorem Ipsum, keine Bildplatzhalter, keine sichtbaren TODOs.
- Jede Aussage zu Regeln oder Fristen zeigt ihre Quelle (`CitationList`); ungeprüfte Regeln tragen das Label „Beispiel“.
- Jeder Datenbereich hat Lade-, Leer- und Fehlerzustand.
- Barrierearm: Kontrast AA, sichtbarer Fokus, Kernflow per Tastatur, semantisches HTML, `aria-label` an Icon-Buttons, `prefers-reduced-motion`.
- Fokusring zentral aus `globals.css` (`:focus-visible`, 2 px `--ring` = `--accent-strong`, 2 px Abstand): Komponenten zeichnen keinen eigenen Ring und schalten ihn nicht mit `outline-none` ab. Schneidet ein Elternteil mit `overflow-hidden` ihn ab: `focus-visible:-outline-offset-2`.
- Keine Login- oder Passwortfelder. Keine Nachbildung echter POS- oder Moodle-Oberflächen; Übergaben an Originalsysteme nur als neutraler Hinweis („Im echten Betrieb …“).
- Beim Folgen-Check sind „Ich trete an“ und „Abmeldung vornehmen“ visuell gleich gewichtet – die App informiert, sie lenkt nicht.

## Definition of Done (pro Task)
1. Akzeptanzkriterien aus `docs/ROADMAP.md` erfüllt, Checkbox abgehakt.
2. `npm run check` grün.
3. Sichtprüfung bei 1440×900 und 390×844, jeweils hell und dunkel.
4. PR-Beschreibung nennt Task-ID, Story-IDs (US-xx), VPC-Bezug (P1–P5, G1–G4) und die Prüfergebnisse; bei Oberflächenänderungen Screenshots aus Demodaten.
5. Codex-Review ohne offene Blocker oder Major-Befunde.
6. Dokumentation nachgezogen.

## Zusammenarbeit mit Codex
Codex ist über das Claude-Code-Plugin `codex` (openai/codex-plugin-cc) angebunden und liest `AGENTS.md`. Plugin und CLI sind eingerichtet (ROADMAP P0-05). Reviews startest du über den CLI-Befehl `/codex-review` (siehe unten), Delegationen laufen über das Plugin.
- **Review:** Nach jedem Task startest du das Review selbst mit `/codex-review --base main` (`/codex:review` aus dem Plugin kann nur Lucas tippen). Bei P2-08, P3-03 und P3-04 kommt ein zweites Review mit dem Fokus aus `docs/PROMPTS.md` §4 dazu (KONZEPT §10), am Phasenende das Phasen-Review mit `--base m<n-1>`. Reviews laufen read-only. Test und Build kann Codex in seiner Sandbox nicht ausführen (`spawn EPERM`); Nachweis ist dein lokaler `npm run check`. Du arbeitest das Ergebnis ab: jeden Befund zuerst am Code nachprüfen, Blocker und Major vor dem Merge beheben, Widerspruch zu einem Befund begründen, Zusammenfassung nach `docs/reviews/<task-id>.md` (Format aus AGENTS.md, ergänzt um „Umgesetzt“ und „Abgelehnt mit Begründung“). Abgelehnte Befunde stehen mit Begründung auch im PR.
- **Delegation:** nur Tasks mit Owner [Codex] oder kleine, klar abgegrenzte Aufgaben (Inhalte übertragen, Spezifikationstests, A11y-Fixes, Lint). Ablauf:
  1. Brief nach der Vorlage in `AGENTS.md` unter `.agents/briefs/<task-id>.md` anlegen und Lucas zeigen
  2. nach OK Branch `codex/<task-id>` auschecken (bzw. bei P2-07 den laufenden Branch `feat/P2-06-domain`)
  3. an den Subagenten `codex:codex-rescue` übergeben: „Lies AGENTS.md und .agents/briefs/<task-id>.md und setze den Brief um.“
  4. solange Codex arbeitet, keine Dateien ändern (gemeinsames Arbeitsverzeichnis – immer nur ein Schreiber)
  5. Diff gegen den Brief prüfen, `npm run check` selbst ausführen (Codex-Angaben sind Vorschläge, kein Nachweis), selbst committen
- Was Codex nicht ausführen konnte (z. B. Netzwerk in der Sandbox, GUI-Tests), gilt als offen, nie als bestanden.
- **Nie delegieren:** Architektur, Domänenlogik, Store, Layout-Shell, Design-Tokens.
- Das Review-Gate des Plugins bleibt aus (Endlosschleifen, hoher Verbrauch). Uneinigkeit zwischen dir und Codex → Lucas entscheidet.

### CLI-Befehle und Rückfallebene
CLI `codex` (npm-Paket `@openai/codex`, angemeldet mit ChatGPT), aufgerufen über versionierte Befehle:
- `/codex-review` – Codex prüft den Stand (`codex review --base <basis>`, mit Prüfhinweisen `codex exec -s read-only`); jeder Befund wird am Code nachgeprüft. Seit 26.10. der Standardweg für alle Reviews.
- `/codex-aufgabe` – Auftrag an Codex in einem **eigenen Git-Worktree** auf `codex/<task-id>`. Die Codex-Sandbox darf nicht in das gemeinsame `.git` schreiben: Du legst den Branch im Worktree an und committest nach dem Review; Codex ändert nur Dateien und committet nicht. Der Brief folgt trotzdem der Vorlage aus `AGENTS.md`.

| Pfad | Agent | Inhalt |
|------|-------|--------|
| `.claude/settings.json` | Claude Code | geteilte Berechtigungen (persönliche in `.claude/settings.local.json`, nicht versioniert) |
| `.claude/commands/` | Claude Code | `/codex-review`, `/codex-aufgabe` |
| `.codex/config.toml` | Codex | Sandbox und Freigaben; wirkt nur in vertrauten Projekten |
| `.agents/skills/` | Codex | `auftrag-umsetzen` (Gegenstück zu `/codex-aufgabe`), `zweig-pruefen` (Gegenstück zu `/codex-review`) |

Persönliche Vorgaben (Modell, Aufwand, Windows-Sandbox) gehören in die Benutzerkonfiguration, nicht ins Repository.

## Git
- Branch pro Task: `feat/<task-id>-<kurzname>` (Delegation: `codex/<task-id>`); Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Nie direkt auf `main` – einzige Ausnahme war der Kit-Commit mit Tag `m0` (P0-05).
- Abschluss eines Tasks: Checkbox in `docs/ROADMAP.md` abhaken → push → PR mit `gh` (Titel „<task-id>: <Kurztitel>“) → Merge per Squash erst nach OK von Lucas (und bei grüner CI, sobald eingerichtet) → Branch löschen.
- Nach bestandenem Gate setzt du nach OK von Lucas das Tag `m<n>` auf `main` und pushst es (Basis für das nächste Phasen-Review).
- Gepusht wird nur zum GitHub-Remote `origin`. Merges, Tags, Releases, Secrets und Repository-Einstellungen nur mit ausdrücklichem OK von Lucas.
- `main` ist immer deploybar (Vercel deployt `main` als Produktion; jeder andere Branch bekommt eine Preview-URL).
- Nie einchecken: Datenbanken, Logs, Secrets (`.env`), echte Nutzerdaten und `docs/referenzen/` (fremde Designs).
- Dateien als UTF-8 mit den Zeilenenden aus `.gitattributes` (LF, Windows-Skripte CRLF).
