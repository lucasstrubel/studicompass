# Roadmap – StudiCompass Prototyp

Zeitraum: Fr, 23.10. – Fr, 06.11.2026 (Präsentation) · Stand: 26.10.2026 (v3: Zeitplan nach Verzug in Phase 1 neu gesetzt, Kürzungs-Checkpoints, Reviews startet Claude Code)

## So wird mit dieser Roadmap gearbeitet
- Reihenfolge einhalten. Jede Phase endet mit einem **Gate**; die nächste Phase beginnt erst, wenn das Gate erfüllt ist. **Ausnahme:** Phase 1 hängt nicht von Inhalten ab und läuft parallel zu Phase 0 – Gate M0 muss erst vor P2-03 erfüllt sein.
- **Owner:** [Claude] = Claude Code · [Codex] = Codex, delegiert von Claude Code mit Brief nach `AGENTS.md` · [Team] = Gruppe · [Lucas] = Lucas allein.
- **Pro Task:** neue Claude-Code-Unterhaltung → Plan (`/plan`) → Freigabe → Umsetzung auf eigenem Branch → `npm run check` → Sichtprüfung (1440×900 und 390×844; seit P5-06 nur hell) → Codex-Review (startet Claude Code mit `/codex-review --base main`) → Befunde abarbeiten → Checkbox abhaken → PR → Merge.
- **Pro Phase:** Phasen-Review (startet Claude Code mit `/codex-review --base m<n-1>` und dem Phasen-Fokus aus `docs/PROMPTS.md` §4) → Befunde abarbeiten → Gate prüfen → Tag `m<n>` auf `main`.
- Prompt-Vorlagen für alle Schritte: `docs/PROMPTS.md`.
- Prioritäten (Hoch/Mittel/Niedrig) und Stories: `docs/KONZEPT.md` §5 und §6.

## Überblick

| Phase | Zeitraum | Ergebnis | Gate |
|---|---|---|---|
| 0 Vorbereitung | Fr 23.10. – Mi 28.10. vormittags (parallel zu Phase 1) | Werkzeuge, Entscheidungen, echte Inhalte, Abgleich mit dem Flow Chart | M0 (vor P2-03) |
| 1 Fundament | Sa 24.10. – Di 27.10. | Projekt, Tokens, App-Shell, Routing, Deployment | M1 |
| 2 Domäne & Daten | Mi 28.10. – Do 29.10. | Typen, Dummy-Daten, Services, Store, Regeln + Tests | M2 |
| 3 Kern-Flows | Fr 30.10. – So 01.11. | Übersicht, Folgen-Check, Studienverlauf | M3 Durchstich |
| 4 Ergänzung | So 01.11. – Mo 02.11. | Assistent, Postfach, Module, Fristen, Onboarding, Einstellungen | M4 Feature-complete |
| 5 Test & Iteration | Di 03.11. – Mi 04.11. | Evaluation, Top-Fixes | M5 |
| 6 Release | Do 05.11. | Release-Kandidat, Demo-Skript, Generalprobe | M6 |
| Präsentation | Fr 06.11. | | |

Es gibt keinen separaten Puffer – die **Kürzungsliste** unten ist der Puffer. Wann gekürzt wird, legen die Kürzungs-Checkpoints darunter fest. Phase 5 und 6 bleiben fest (Testpersonen, Präsentation).

---

## Phase 0 – Vorbereitung (Fr 23.10. – Mi 28.10. vormittags, parallel zu Phase 1)

### P0-01 [Team] Entscheidungen bestätigen (bis Mo 26.10.)
- [ ] Name festlegen (Arbeitstitel StudiCompass; Hinweise in KONZEPT §15 A-5) → `APP_NAME`
- [ ] Priorisierung KONZEPT §5.1 bestätigen oder anpassen
- [ ] Stack laut CLAUDE.md bestätigen
- [ ] Demo-Zeit und Szenario (KONZEPT §10.2, §10.4) bestätigen
- **AK:** Markierungen `[Vorschlag]` in KONZEPT.md auf `[entschieden]` gesetzt oder geändert.

### P0-02 [Team] Echte Inhalte einsammeln → `docs/INHALTE.md` (bis Mi 28.10. vormittags – P2-03 braucht sie)
- [ ] Modulliste aus dem Studienverlaufsplan WI (Name, ECTS, Fachsemester, Angebot WS/SS)
- [ ] Regeln DR-4 bis DR-9 in der SPO WI nachschlagen (Abschnitt, Kurztext, Stand) → „geprüft: ja“
- [ ] Zuständige Stellen: öffentliche Kontaktdaten oder fiktiv lassen
- **AK:** INHALTE.md aktualisiert; ändert sich dadurch das Szenario, ist KONZEPT §10.4 angepasst.
- Wenn die Zeit fehlt: Beispielwerte bleiben, das UI zeigt „Beispiel“.

### P0-03 [Team] UX Flow Chart mit dem Konzept abgleichen (bis Mo 26.10.)
- [ ] Screens und Übergänge des Justinmind-Flow-Charts mit KONZEPT §7–§9 vergleichen
- [ ] Je Abweichung entscheiden: Prototyp anpassen oder Flow Chart aktualisieren
- **AK:** Abweichungen und Entscheidungen in KONZEPT §15 (A-4) notiert. Geänderte Abläufe gelten als Iteration und werden in der Präsentation so benannt.

### P0-04 [Team, optional] Lo-Fi-Skizzen der vier Kernscreens (30–60 Min.)
- [ ] Übersicht, Folgen-Check, Studienverlauf, Assistent auf Papier oder Miro skizzieren (VL05: Lo-Fi für schnelle Iteration); Fotos nach `docs/skizzen/`

### P0-05 [Lucas] Repo und Werkzeuge vorbereiten (Sa 24.10.)
- [x] Kit ins Repo-Root (`CLAUDE.md`, `AGENTS.md`, `docs/`), Commit auf `main`, Tag `m0`
- [x] Codex CLI installieren und anmelden; Claude-Code-Plugin `codex` (openai/codex-plugin-cc) installieren; `/codex:setup` meldet Codex als bereit; Review-Gate bleibt aus
- [x] optional: `gh auth login`, damit Claude Code PRs anlegen kann
- [ ] Einstellung „Project instructions“ auf dem Standard lassen: Liegen `CLAUDE.md` und `AGENTS.md` beide im Repo, liest Claude Code nur `CLAUDE.md` – gewollt, weil `AGENTS.md` die Codex-Rolle beschreibt
- [x] Session 0 (`docs/PROMPTS.md` §0) – am 26.10. mit der Gesamtplanung erledigt: Umgebung geprüft, Testorakel §10.4 aus INHALTE.md nachgerechnet (stimmt), Lücken in v3 aufgelöst
- **AK:** Claude Code fasst Regeln, Testorakel und Zusammenarbeit mit Codex korrekt zusammen.

**Gate M0 (spätestens Mi 28.10. vormittags, vor P2-03):** Werkzeuge laufen · Entscheidungen fix · Inhalte geprüft oder bewusst als Beispiel belassen · Flow-Abgleich erledigt.

---

## Phase 1 – Fundament (Sa 24.10. – Di 27.10.)

Reihenfolge: P1-01 → P1-05 → P1-02 → P1-03 → P1-04 → P1-06. P1-05 ist vorgezogen, damit jeder weitere Branch eine Preview-URL hat.

### P1-01 [Claude] Projekt aufsetzen
- [x] Vite + React + TypeScript (strict), Pfad-Alias `@/`, ESLint, Prettier, Vitest + Testing Library (jsdom)
- [x] Scripts `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `check`
- [x] Ordnerstruktur laut CLAUDE.md; README mit Startanleitung
- [x] Das Repo ist nicht leer: in einen temporären Unterordner scaffolden und übernehmen – nie „Remove existing files“ oder `--overwrite` von create-vite
- **AK:** `npm run check` grün; `CLAUDE.md`, `AGENTS.md`, `docs/` und vorhandene Inhalte von `README.md`/`.gitignore` sind erhalten.

### P1-02 [Claude] Tailwind und shadcn/ui
- [x] vorher die aktuelle Anleitung lesen: https://ui.shadcn.com/docs/installation/vite
- [x] shadcn nach dieser Anleitung initialisieren (Tailwind CSS v4 über `@tailwindcss/vite`, Alias in `tsconfig.json` und `tsconfig.app.json`)
- [x] Komponenten: button, card, badge, dialog, alert-dialog, sheet, tabs, tooltip, popover, progress, separator, select, switch, slider, skeleton, sonner, dropdown-menu, avatar, scroll-area, accordion, toggle-group, chart
- Hinweis: `/_ui` braucht schon React Router (im Stack) – nur diese Dev-Route; die Routen aus KONZEPT §7 folgen in P1-04. „Dunkel“ zeigt `/_ui` über einen Container mit der Klasse `dark`; der ThemeProvider folgt in P1-03.
- **AK:** Entwickler-Route `/_ui` (nur im Dev-Build) zeigt alle Komponenten in hell und dunkel.

### P1-03 [Claude] Design-Tokens und Theme
- [x] Tokens aus KONZEPT §12.2 als CSS-Variablen (hell/dunkel), auf die shadcn-Variablen gemappt, plus eigene (`--accent-strong`, `--accent-soft*`, `--status-*`, `--sidebar-*`)
- [x] ThemeProvider (System/Hell/Dunkel, gespeichert); Theme wird vor dem ersten Rendern gesetzt (kein Aufblitzen)
- [x] Manrope über Fontsource; Utility für `tabular-nums`
- Hinweis: Theme so speichern, dass der Store in P2-05 (`setTheme`) die Speicherung übernehmen kann – kein zweiter Speicherort.
- **AK:** keine Hex-Werte außerhalb `globals.css`; Kontrastpaare wie in §12.2.

### P1-04 [Claude] App-Shell und Routing
- [x] Routen laut KONZEPT §7 (Seiten zunächst nur mit Seitentitel), 404-Seite, Browser-Tab-Titel je Seite
- [x] Sidebar (Tinte) mit aktivem Zustand (Balken + Fettung), Topbar (Titel, Demo-Chip, Glocke, Avatar-Menü), Slot für die rechte Spalte
- [x] Tablet: Icon-Sidebar mit Tooltips · Mobil: Tab-Leiste + „Mehr“-Sheet
- [x] Skip-Link „Zum Inhalt“; Scroll-Position bei Seitenwechsel zurücksetzen
- Hinweis: Der Demo-Chip braucht `DEMO_NOW` – hier schon in `src/config/demo.ts` anlegen (aus P2-02 vorgezogen). Die Datei bleibt ohne Imports, weil `vite.config.ts` sie lädt.
- **AK:** Navigation funktioniert bei 390, 834 und 1440 px und per Tastatur.

### P1-05 Deployment
- [x] [Lucas] Vercel: „Add New → Project“ → GitHub-Repo importieren (Preset Vite, Output `dist`) – möglich, sobald P1-01 auf `main` liegt
- [x] [Claude] `vercel.json` mit Rewrite aller Pfade auf `/index.html`
- Hinweis: direkt nach P1-01. Bis P1-04 gemergt ist, zeigt der Deep-Link-Test nur, dass Vercel `index.html` statt 404 liefert; den Seiteninhalt unter `/verlauf` prüft Gate M1.
- **AK:** Produktions-URL erreichbar; Deep-Link `/verlauf` funktioniert nach Neuladen; Branches bekommen Preview-URLs.

### P1-06 [Codex] Phasen-Review (`--base m0`) → `docs/reviews/P1.md`

**Gate M1 (Di 27.10., 18:00):** Shell deployed · beide Themes · Navigation auf allen Breakpoints.

---

## Designrevision vor Phase 2

### P1-07 [Codex, direkt von Lucas beauftragt] UI nach Referenz 1
- [x] Eingerückter Desktop-Rahmen, kompakte Karten und lokale Linienillustrationen nach Referenz 1; Referenz 2 nur Farbpalette.
- [x] Toplinks ab 1280 px, Hamburger-Menü mit Hover-Vorschau (150/250 ms) und Radix-Sheet bei explizitem Öffnen; keine permanente Sidebar oder mobile Tab-Leiste.
- [x] Gekennzeichnete Dashboard-Designvorschau mit dokumentierten Beispieldaten, Quellen und bestehender Navigation; keine Phase-2-Logik.
- [x] Hell-/Dunkel-Schalter in der Topbar mit gespeicherter Auswahl (Nachtrag von Lucas).
- [x] Kontrastrevision im hellen Theme: warme Flächenhierarchie, dunklerer Sekundärtext, kräftige Terrakotta-Karte mit Tinte, klarere Konturen und Fortschrittsbalken.
- [x] KONZEPT, CLAUDE und Komponentenübersicht nachgezogen.
- [x] Prüf-Gate und Sichtprüfung bei 1440×900, 834×1112 und 390×844, jeweils hell/dunkel; Screenshots und Prüfergebnis: docs/reviews/P1-07-validation.md.
- **AK:** kompakte Referenz-1-Komposition, vollständige Navigation per Maus/Touch/Tastatur, keine Überläufe, Fokusführung und Reduced Motion. Funktionales Dashboard bleibt P3-02.

---

## Phase 2 – Domäne & Daten (Mi 28.10. – Do 29.10.)

**Umsetzungsauftrag von Lucas:** P2-01 bis P2-09 übernimmt Codex selbstständig auf `dev`. Die ursprünglichen Owner unten beschreiben die geplante Arbeitsteilung. Signaturen und Spezifikationstests wurden vor der Implementierung geprüft; Gegencheck durch Claude und visuelle Abnahme am 27.10.2026 erledigt (siehe `docs/reviews/P2.md`). Kein Merge oder Tag ohne Lucas' OK.

### P2-01 [Claude] Domänentypen und Zeitmodell → `src/domain/types.ts`, `terms.ts`
- [x] Typen laut KONZEPT §10.1; Term-Funktionen (`next`, `compare`, `semesterNumber`, `format`, `nextOffering`)
- **AK:** Term-Funktionen getestet (u. a. WS 2026 → SS 2027 → WS 2027; Fachsemester 3 = WS 2026/27).

### P2-02 [Claude] Demo-Konfiguration → `src/config/demo.ts`
- [x] `APP_NAME`, `DEMO_NOW = 2027-01-25T19:30:00+01:00`, `LATENCY_MS`, `FLAGS.simulateErrors`
- Hinweis: `APP_NAME` (P1-01) und `DEMO_NOW` (P1-04) gibt es dann schon; hier kommen `LATENCY_MS` und `FLAGS` dazu.

### P2-03 [Claude] Kerndaten → `src/data/`
- [x] program, modules, exams, rules, offices, student aus INHALTE §1–§4, §7, §8
- **AK:** typgeprüft; Test: 210 ECTS gesamt, 30 je Fachsemester, 48 ECTS bestanden.

### P2-04 [Codex] Inhaltsdaten → `src/data/`
- [x] deadlines, inbox, notifications, assistant-catalog aus INHALTE §5, §6, §9, §10
- Brief: nur diese Dateien; Typen aus P2-01; keine Logik.
- **AK:** typgeprüft; Texte wörtlich aus INHALTE.md; Volltexte für übrige Postfach-Einträge im selben Stil.

### P2-05 [Claude] Services und Store
- [x] Service-Interfaces je Kanal (pos, moodle, mail, website) sowie Regelwerk und Assistent; Mock-Implementierungen mit Latenz und optionalem Fehler
- [x] Zustand-Store: `hydrate()`, Ladestatus und „zuletzt aktualisiert“ je Kanal; Aktionen `markRead`, `withdrawExam` (simuliert, mit Snapshot), `undo`, `confirmAttend`, `setWhatIf` / `clearWhatIf`, `setTheme`, `setHintTone`, `completeOnboarding`, `resetDemo`; `persist` mit `version`
- Hinweis: `setTheme` übernimmt die Theme-Speicherung aus P1-03. Auf den Speicher greifen nur `readStoredTheme`/`writeStoredTheme` (`src/lib/theme.ts`, Schlüssel `THEME_STORAGE_KEY`) und das Init-Skript in `index.html` zu. Der ThemeProvider bezieht `theme`/`setTheme` dann aus dem Store, `useTheme()` bleibt gleich. Vorschlag: Schlüssel behalten und `theme` per `partialize` aus `persist` ausnehmen, damit das Theme Versionssprünge übersteht.
- **AK:** Ladezustände sichtbar beobachtbar; `FLAGS.simulateErrors` erzeugt Fehlerzustand; `resetDemo` stellt den Ausgangszustand her.

P2-06 bis P2-08 arbeiten testgetrieben auf **einem** Branch (ursprünglich `feat/P2-06-domain`, auf Lucas' Auftrag jetzt `dev`): erst Signaturen, dann Tests aus der Spezifikation, dann Implementierung. Die Tests bleiben ab dem ersten roten Lauf unverändert; die Arbeitsfolge ist in `docs/reviews/P2.md` dokumentiert. Vor der Implementierung ist `npm run check` rot – gewollt. Die ursprüngliche unabhängige Arbeitsteilung ersetzt hier der spätere Gegencheck durch Claude.

### P2-06 [Claude] Domänen-Signaturen → `progress.ts`, `rules.ts`, `projection.ts`, `decision.ts`, `grades.ts`
- [x] typisierte Signaturen mit JSDoc (Regel-IDs) für `earnedEcts`, `targetEcts`, `trafficLight`, `openFoundationModules`, `nextOfferingTerm`, `projectPlan` (§10.5), `compareDecision` (attendPass / attendFail / withdraw), `gradeAverage`; Rumpf wirft `Error('not implemented')` (vor P2-08 geprüft)
- **AK:** `npm run typecheck` grün.

### P2-07 [Codex] Spezifikationstests → `src/domain/*.spec.ts`
- Brief: Tests ausschließlich aus KONZEPT §10.3–§10.5 gegen die Signaturen ableiten; Testnamen nennen Regel bzw. Szenario.
- [x] Szenarien Basis, A, B, C, D
- [x] Grenzfälle: Rückstand 6/7/23/24 (DR-3); Angebot BOTH vs. WS (DR-4); Note 4,0 vs. 4,3 (DR-1); Abschneiden 2,46 → 2,4 und 2,49 → 2,4 (DR-9); genau 3 vs. 4 offene Grundstudiums-Prüfungen (DR-7)
- **AK:** Tests kompilieren und scheitern erwartbar an „not implemented“; unklare Fälle sind als Frage gemeldet.

### P2-08 [Claude] Domänenlogik implementieren
- [x] implementieren, bis alle Spezifikationstests grün sind; eigene Unit-Tests (`*.test.ts`) für Hilfsfunktionen
- [x] hält ein Spezifikationstest der Spezifikation nicht stand: Rücksprache mit Lucas, dann Test oder KONZEPT.md anpassen (kein solcher Fall; zusätzlichen DR-8-Randfall mit Lucas geklärt und in §10.5 ergänzt)
- **AK:** rein funktional; alle Tests grün; liefert für Basis und Szenarien A–D exakt die Werte aus KONZEPT §10.4.

### P2-09 [Codex] Phasen-Review (`--base m1`, Fokus KONZEPT §10) → `docs/reviews/P2.md`

- [x] Technische Eigenprüfung einschließlich neuer Dateien dokumentiert.
- [x] Unabhängiger Gegencheck durch Claude und visuelle Abnahme (1440×900, 390×844, hell/dunkel); drei Befunde behoben.

**Gate M2 (Do 29.10., 22:00):** alle Domänentests grün · Testorakel-Werte stimmen · Store lädt alle Daten mit sichtbaren Ladezuständen.

---

## Phase 3 – Kern-Flows (Fr 30.10. – So 01.11.)

### P3-01 [Claude] Gemeinsame Komponenten (KONZEPT §12.4)
- [x] StatusBadge, ChannelBadge, Countdown, EctsProgress, ConsequenceItem, CitationList, DemoBadge, EmptyState, ErrorState, PageHeader
- [x] Offene Punkte aus Phase 1: Overlay-Token, Typo-Klassen in Button und CardTitle, deutliche Auswahl in ToggleGroup und Tabs, Card-Form (`docs/reviews/P1.md`)
- Hinweis: IconCircle gestrichen (Entscheidung von Lucas am 27.10.) – KONZEPT §12.4 schließt dekorative Icon-Kreise seit der Designrevision P1-07 aus.
- **AK:** alle Zustände in `/_ui` sichtbar; Status nie nur über Farbe; Icon-Buttons mit `aria-label`.

### P3-02 [Claude] Übersicht (S1) – US-03, US-04, US-05, US-07
- [x] Hauptspalte und rechte Spalte laut KONZEPT §8 S1, Reihenfolge = Priorität
- Hinweis: „Jetzt wichtig“ zeigt nur Benachrichtigungen vom Typ Entscheidung mit offener Frist und Sonderregel (Entscheidung von Lucas am 27.10.); der ECTS-Verlauf (Niedrig) ist enthalten und lädt Recharts getrennt.
- **AK:** Werte aus Store/Domäne (48 / Soll 60 / Knapp; Prognose 78 von 90); Studienstand, Ampel und „Jetzt wichtig“ bei 1440×900 ohne Scrollen sichtbar (Q-1); Skeletons; Fehlerzustand je Kanal; mobile Reihenfolge laut §8.

### P3-03 [Claude] Folgen-Check (S4) inkl. simulierter Abmeldung – US-06, US-07, US-08
- [x] Kopf, Ziel-Zeile, Vergleichstabelle (mobil: Umschalter), „Warum?“ mit Quelle, Hilfsangebote, Fußzeile
- [x] Beide Aktionen gleich gewichtet; Bestätigungsdialog; Toast mit „Rückgängig“ (8 s)
- Hinweis: Hinweistexte für die übrigen angemeldeten Prüfungen in INHALTE §9 ergänzt, von Lucas am 27.10. freigegeben; `DATA_VERSION` 2.
- **AK:** Tabelle zeigt exakt die Werte aus §10.4; nach simulierter Abmeldung zeigt die Übersicht Kritisch, Praxissemester SS 2028, Abschluss SS 2029; „Rückgängig“ stellt alles wieder her; Marketing (Szenario D) zeigt keine Meilenstein-Verschiebung, aber den Belastungshinweis; Kernflow per Tastatur bedienbar.

### P3-04 [Claude] Studienverlauf (S2) – US-04, US-09, US-10
- [x] Zeitleiste mit 7 Semestern, Meilensteinen, Abschlussprognose, Regeln mit Quellen
- [x] Was-wäre-wenn *(Mittel)*: „Verschieben nach …“ nur in zulässige Semester; Neuberechnung; Kennzeichnung; „Simulation verwerfen“
- Hinweis: vor dem Start den Kürzungs-Checkpoint „Start P3-04“ prüfen (unter der Kürzungsliste). Geprüft am 27.10.: Soll Sa 31.10., 12:00 nicht erreicht – nichts gestrichen.
- **AK:** Werte konsistent mit Folgen-Check und Übersicht; Simulation verändert keine echten Daten.

### P3-05 [Claude, Mittel] Playwright-Smoke-Test und Screenshots
- [x] Hero-Flow als E2E-Test (Übersicht → Folgen-Check → Abmeldung → Rückgängig)
- [x] Skript für Screenshots aller Kernscreens (2 Viewports × 2 Themes) nach `docs/screens/` – Grundlage für Reviews und Folien
- Hinweis: Playwright läuft mit dem lokal installierten Chrome, ohne Browser-Download (Entscheidung von Lucas am 27.10.).

### P3-06 [Codex] Phasen-Review (`--base m2`) + A11y-Check des Kernflows → `docs/reviews/P3.md`
- [x] Phasen-Review mit Phasen-Fokus und A11y-Check (gestartet von Claude Code); sieben Befunde bestätigt und behoben
- [x] Eigener A11y-Nachweis des Kernflows (Tastatur, Fokus, Struktur, Status, Kontraste, Reduced Motion) in `docs/reviews/P3.md`; Screenreader-Durchgang bleibt offen

### P3-07 [Team] Flur-Test (10 Min.)
- [ ] 1–2 Kommiliton:innen klicken den Durchstich; auffällige Stolperstellen notieren

**Gate M3 (So 01.11., 14:00):** Hero-Flow end-to-end deployed und auf Desktop und Smartphone bedienbar.
- [x] Erfüllt am 27.10.2026 (vor dem Soll), Tag `m3` auf `629a859` nach OK von Lucas. Nachweis in `docs/reviews/P3.md` („Gate M3“). P3-07 (Flur-Test) führt Lucas selbst durch.

---

## Phase 4 – Ergänzung (So 01.11. – Mo 02.11.)

**Umsetzungsauftrag von Lucas (27.10.2026):** Codex setzt P4-01 bis P4-08 vollständig einschließlich Fristen, ICS und Tour um. Die bisherigen Owner bleiben als ursprüngliche Planung stehen. Umsetzung und technische Eigenprüfung: `docs/reviews/P4-implementation.md`, Phasenbefunde: `docs/reviews/P4.md`. Kalenderimport in einer echten Kalender-App und unabhängiger Gegencheck bleiben separat offen; kein Merge oder Tag ohne Lucas' OK.

### P4-01 [Claude] Assistent (S5) – US-12, US-13, US-14
- [x] Chat-Oberfläche, Vorschlagsfragen, Zuordnung (KONZEPT §11), Antwortkarte, Resolver für „Für dich heißt das“, Fallback mit „Anfrage vorbereiten“, Kontext-Chip
- **AK:** alle 8 Katalogfragen und der Fallback F-01 funktionieren per Klick und per Freitext; jede Antwort mit Quelle und zuständiger Stelle (Q-3).

### P4-02 [Claude] Postfach (S6) – US-15, US-16
- [x] Filter, „Nur ungelesene“, „Für dich wichtig“ mit Begründung, Detail-Sheet, Sync-Status je Kanal
- **AK:** Deep-Link `/postfach?eintrag=i-02` öffnet das Detail; gelesen-Status bleibt nach Neuladen erhalten.

### P4-03 [Claude] Module & Noten (S3) inkl. Detail
- [x] Kennzahlen, Semesterliste, Moduldetail, Quellen und Kontextlinks umgesetzt und getestet.
- **AK:** Kennzahlen 48 ECTS, Schnitt 2,4, 8 bestandene Module; Detail verlinkt Folgen-Check und Assistent mit Kontext.

### P4-04 [Codex] Fristen (S7) inkl. ICS-Export *(Niedrig)*
- [x] Fristenliste, relative Gruppierung sowie Einzel- und Gesamtexport umgesetzt; ICS-Syntax und Browser-Download geprüft.
- [ ] Tatsächlicher Import in ein Kalenderprogramm (kein Kalenderprogramm in der verfügbaren Windows-App-Liste gefunden).
- Brief: nur `src/features/deadlines/` und `src/lib/ics.ts`; Daten über den Store.
- **AK:** Gruppierung relativ zu `DEMO_NOW`; ICS-Datei lässt sich in einen Kalender importieren.

### P4-05 [Claude] Benachrichtigungen (S8) und Einstellungen (S9) – US-18, US-19
- [x] Glocken-Sheet, Hinweis-Stil, Darstellung, Benachrichtigungstypen, simulierte Kanalverbindungen und Demo-Reset umgesetzt.
- **AK:** Hinweis-Stil wirkt auf Übersicht, Folgen-Check und Benachrichtigungen; „Demo zurücksetzen“ funktioniert.

### P4-06 [Claude] Onboarding (S0) *(Mittel)*, Produkt-Tour *(Niedrig)* – US-01, US-02
- [x] Vier Schritte, Erststart, Überspringen, persönliche Einstellungen und optionale dreistufige Tour umgesetzt.
- **AK:** Onboarding vollständig per Tastatur; überspringbar; Ziel und Nebenjob wirken auf Folgen-Check und Studienverlauf.

### P4-07 [Claude] Responsive-, Dark-Mode- und Textdurchgang aller Screens
- [x] Breitenprüfung, Sichtprüfung und Glossardurchgang; Screenshot-Skript auf alle Phase-4-Seiten erweitert.
- **AK:** keine horizontale Scrollleiste von 360 bis 1920 px; alle Texte gegen das Glossar geprüft; keine Platzhalter.

### P4-08 [Codex] Phasen-Review (`--base m3`) + A11y-Durchgang (Tastatur, Fokus, Labels, Kontraste) → `docs/reviews/P4.md`
- [x] Technische Eigenprüfung gegen `m3`, A11y-Nachweis und behobene Befunde dokumentiert.
- [x] Unabhängiger Gegencheck durch einen zweiten Reviewer: Claude Code, 27.10.2026 → [Gegencheck](reviews/P4-P5-gegencheck.md).

**Gate M4 (Mo 02.11., 22:00):** alle Stories mit Priorität Hoch und Mittel umgesetzt · keine offenen Blocker oder Major-Befunde.

Stand der Umsetzung: Hoch/Mittel implementiert, technische Prüfungen dokumentiert. Formale Abnahme einschließlich unabhängigem Gegencheck steht aus; `m4` wurde nicht gesetzt.

---

## Phase 5 – Test & Iteration (Di 03.11. – Mi 04.11.) – Details in `docs/TESTPLAN.md`

**Umsetzungsauftrag von Lucas (27.10.2026):** Codex übernimmt die Agenteninspektion, behebt belegte Befunde und bereitet das Testpaket vor. Eigenprüfung und Walkthrough: [P5.md](reviews/P5.md). Dies ersetzt keine Evaluation durch unabhängige Teammitglieder oder Studierende. Der vorhandene uncommittete Phase-4-Stand bleibt erhalten; M4-Abnahme und unabhängiger Gegencheck sind weiter offen.

- [ ] **P5-01 [Team]** Heuristische Evaluation und Cognitive Walkthrough des Hero-Flows (Di vormittags)
  - [x] Vorgelagerte Agenteninspektion aller Screens und Walkthrough dokumentiert; zwei belegte Befunde priorisiert.
- [ ] **P5-02 [Team]** Usability-Test mit Thinking Aloud, 3–5 Personen aus dem Persona-Segment (Di/Mi)
  - [x] Moderationsleitfaden, Aufgabenblatt ohne Lösungen und leere Protokolle P1–P5 vorbereitet: [Testpaket](TESTPLAN.md).
- [ ] **P5-03 [Team]** Auswertung: Befunde mit Schweregrad und betroffenem Prinzip, Top 5 festlegen
  - [x] Vorläufige Priorisierung der Inspektionsbefunde; [Auswertungsvorlage](evaluation/P5-auswertung.md) mit Schweregrad, beobachteter Häufigkeit und Präsentationsstruktur vorbereitet. Nutzerhäufigkeit nicht erhoben.
- [ ] **P5-04 [Claude]** Top 5 umsetzen; **[Codex]** Review
  - [x] Zwei belegte Inspektionsbefunde umgesetzt und technisch nachgeprüft; endgültige Top-Befunde nach Nutzertests und unabhängiges Review bleiben offen.
- [ ] **P5-05 [Team]** Ergebnisse für die Präsentation festhalten: drei Kernbefunde und was daraufhin geändert wurde
  - [x] Vorlage für Beobachtung, Änderung und Nachprüfung vorbereitet; noch keine Nutzertestergebnisse eingetragen.

### P5-06 [Claude] Designrevision 2 (Feedback von Lucas, 27.10.2026)
Vor den Nutzertests, damit sie den neuen Stand sehen. Entscheidungen von Lucas: Chatfenster vor Ort, Terrakotta bleibt Marke plus Farbfamilie, helles Menü-Panel, „Jetzt wichtig“ zart getönt mit Kante.
- [x] Topbar ohne Demo-Chip und Hell-/Dunkel-Schalter; Profil ganz rechts
- [x] Hamburger-Menü als helles, rundum abgerundetes Panel für Hover und Klick; keine Unschärfe hinter Overlays
- [x] Farbfamilie (Violett, Petrol, Blau, Pflaume, Terrakotta) für Module, Noten und ECTS; Terrakotta nur noch Marke
- [x] Übersicht: „Jetzt wichtig“ zart getönt mit Kante; ECTS-Verlauf direkt unter Studienstand und Jetzt wichtig
- [x] Assistent-Button mit Sprechblase und Chatfenster auf jeder Seite außer `/assistent`; gemeinsamer Verlauf mit der Assistent-Seite
- [x] Dark Mode vollständig entfernt (Code, Tokens, Tests, Screenshots, Doku); US-19 gestrichen
- **AK:** keine Hex-Werte außerhalb `globals.css`; Farbfamilie ≥ 3:1 zu Seite, Karte und Track; Menü und Assistent-Fenster per Tastatur bedienbar (Fokus hinein und zurück); keine horizontale Scrollleiste 360–1920 px; Assistent-Button verdeckt weder Seitenende noch Toasts; `npm run check` und `npm run e2e` grün; Screenshots neu (1440×900, 390×844).

### P5-07 [Claude] Abgleich mit Apples Designprinzipien (Auftrag von Lucas, 28.10.2026)
Vor den Nutzertests, damit niemand mit einer verdeckenden Sprechblase startet. Bewertung und Befunde: [P5-07-designprinzipien.md](reviews/P5-07-designprinzipien.md). Entscheidungen von Lucas: Ergebnis festhalten, vorab nur testrelevante Punkte beheben; Sprechblase einmal je Demo-Stand.
- [ ] Alle Screens gegen die acht Prinzipien geprüft; Befunde DP-1 bis DP-10 dokumentiert, offene in der [Befundliste](evaluation/P5-auswertung.md), neue Ideen im Ideenparkplatz
- [ ] Sprechblase einmal je Demo-Stand: verschwindet beim Schließen, Öffnen, ersten Scrollen oder Seitenwechsel und kommt erst nach „Demo zurücksetzen“ wieder (DP-1)
- [ ] „Warum?“-Schalter mit mindestens 24 px Trefferhöhe, ohne das Layout zu verschieben (DP-2)
- [ ] Profil-Avatar mit Initialen (KONZEPT A-6, DP-8)
- **AK:** Sprechblase erscheint nach Neuladen nicht erneut und verdeckt nach dem ersten Scrollen oder Seitenwechsel nichts mehr; „Warum?“ reagiert auch 4 px neben dem Text (E2E); Avatar zeigt „NB“; `npm run check` und `npm run e2e` grün; Screenshots neu (1440×900, 390×844), die Sprechblase zeigt nur noch `assistent-hinweis`.

**Gate M5 (Mi 04.11. abends):** Top-Befunde behoben · Testergebnisse dokumentiert.

Stand: Agenteninspektion, technische Iteration und Testvorbereitung erledigt. Echte Sitzungen, nutzerbasierte Endauswertung und Präsentationsergebnisse stehen aus. **M5 bleibt offen; kein Tag gesetzt.**

---

## Phase 6 – Release & Präsentation (Do 05.11.)

- [ ] **P6-01 [Claude]** Content-Freeze 12:00 · finaler Deploy · Git-Tag `v1.0` · README mit Demo-Anleitung (Start, Demo zurücksetzen, Hero-Flow)
- [ ] **P6-02 [Team]** Demo-Skript für den Hero-Flow (3–4 Min.): Übersicht → „Jetzt wichtig“ → Folgen-Check → Vergleich mit Marketing → Assistent mit Quelle → Fallback
- [ ] **P6-03 [Team]** Folien: Persona und kritisches Szenario → Live-Demo → VPC-Fit (Traceability-Tabelle KONZEPT §3) → Testergebnisse und Iteration → Ausblick (Ideenparkplatz, Integrationsannahmen, ergänzte Stakeholder)
- [ ] **P6-04 [Team]** Backup: Bildschirmaufnahme des Hero-Flows, Screenshots, lokaler Build (`npm run build && npm run preview`)
- [ ] **P6-05 [Team]** Generalprobe am Präsentationsgerät (Beamer-Auflösung, z. B. 1280×720 und 1920×1080 prüfen); vorher „Demo zurücksetzen“

**Gate M6 (Do 05.11. abends):** präsentationsbereit, Backup vorhanden.

---

## Kürzungsliste (von oben nach unten streichen, wenn die Zeit knapp wird)
1. Produkt-Tour
2. ICS-Export
3. Restverlauf-Vorschlag (US-11) – der Belastungshinweis (DR-10) bleibt, weil Szenario D (KONZEPT §10.4), das AK von P3-03 und T5 ihn brauchen
4. Fehler-Simulation je Kanal (Fehlerzustände bleiben im Code)
5. ECTS-Verlaufsdiagramm auf der Übersicht
6. Playwright-Test (Screenshots dann manuell)
7. Fristen-Seite (das Widget bleibt)
8. Onboarding auf zwei Schritte kürzen (Willkommen + Kanäle)
9. Was-wäre-wenn im Studienverlauf (der Folgen-Check bleibt)

**Nie streichen:** Studienstand · Folgen-Check inkl. simulierter Abmeldung und Marketing-Vergleich · Assistent mit Quellen und Fallback · Postfach · mobile Bedienbarkeit von Übersicht und Folgen-Check.

**Kürzungs-Checkpoints:** beim Gate-Check (`docs/PROMPTS.md` §7) bzw. vor dem Start von P3-04 prüfen. Ist der Sollzeitpunkt überschritten, werden die genannten Punkte gestrichen.

| Checkpoint | Soll | Verfehlt → streichen |
|---|---|---|
| M1 | Di 27.10., 18:00 | 1, 2 |
| M2 | Do 29.10., 22:00 | 3, 4, 5 |
| Start P3-04 | Sa 31.10., 12:00 | 6, 7, 8; ab 1 Tag Verzug zusätzlich 9 |
| M3 | So 01.11., 14:00 | alles bis 8, was noch offen ist |
| M4 | Mo 02.11., 22:00 | Phase 5 beginnt trotzdem; Offenes kommt auf die Liste für P5-04 |

---

## Risiken

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Zwei Wochen Zeit, parallel weitere Module | Features unfertig | Gates, Kürzungsliste, kleine PRs, kurzes tägliches Update im Team |
| Scope Creep durch Agenten | Zeitverlust, Inkonsistenz | Regeln in CLAUDE.md, Ideenparkplatz, Review-Punkt „Scope“ |
| Inkonsistente Dummy-Zahlen | unglaubwürdige Demo | Testorakel §10.4, Tests aus der Spezifikation durch Codex |
| Falsche Regeln oder Fristen | Vertrauensverlust in der Präsentation | Label „Beispiel“ bis geprüft (P0-02) |
| Prototyp weicht vom abgegebenen Flow Chart ab | Widersprüche in der Bewertung | P0-03; Abweichungen als Iteration benennen |
| Live-Demo scheitert (Netz, Beamer) | Präsentation leidet | Bildschirmaufnahme, lokaler Build, Generalprobe |
| Assistent wirkt „fake“ | Glaubwürdigkeit | offen sagen, dass Antworten im Prototyp vorbereitet sind; Fokus auf Quellenkonzept und ehrlichen Fallback |

## Review-Protokoll
- **Pro Task:** Claude Code startet `/codex-review --base main` (CLI `codex review`, read-only). Bei P2-08, P3-03 und P3-04 zusätzlich `/codex-review --base main` mit dem Fokus aus `docs/PROMPTS.md` §4 (KONZEPT §10).
- **Pro Phase:** Claude Code startet `/codex-review --base m<n-1>` (Tag des vorigen Gates) mit dem Phasen-Fokus aus `docs/PROMPTS.md` §4 – Konsistenz über alle Tasks der Phase.
- Lucas kann jedes Review weiterhin selbst über das Plugin starten (`/codex:review`, `/codex:adversarial-review`).
- Claude Code arbeitet die Befunde ab (Blocker und Major vor dem Merge, Minor und Nit nach Ermessen) und speichert die Zusammenfassung unter `docs/reviews/<task-id>.md`.
- Das Review-Gate des Plugins bleibt aus (Endlosschleifen, hoher Verbrauch).
- Uneinigkeit zwischen Claude Code und Codex entscheidet Lucas.
