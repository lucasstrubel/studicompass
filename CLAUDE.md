# StudiCompass – klickbarer Prototyp

Arbeitstitel „StudiCompass“ – der Name steht nur in `src/config/demo.ts` (`APP_NAME`).

## Worum es geht
Web-App, die Studierenden der TH Mannheim hilft, ihren Studienstand zu überblicken und Entscheidungen mit Folgen (z. B. eine Prüfungsabmeldung) informiert zu treffen. Sie bündelt POS, Moodle, Hochschul-Mail und Website und beantwortet Fragen zur Prüfungsordnung mit Quellenangabe.
Selbsterklärender Hi-Fi-Prototyp, kein Produktivsystem. Alle Hochschul-Schnittstellen sind **Dummy-Daten**.
Primäre Persona: **Niklas Brandt**, 20, Wirtschaftsinformatik, 3. Semester, Nebenjob 15 Std./Woche.

**Der Code ist die Quelle der Wahrheit.** Die Konventionen unten beschreiben den aktuellen Stand; sie dürfen geändert werden, wenn Lucas es so entscheidet. Tests werden angepasst, wenn sich das Verhalten bewusst ändert.

## Stack
Vite · React · TypeScript (strict) · React Router · Tailwind CSS · shadcn/ui (Radix) · lucide-react · Zustand (persist) · Recharts (über shadcn `chart`) · date-fns (Locale `de`) · @dnd-kit/core · Vitest + Testing Library · Playwright · Fontsource (Manrope, lokal) · Deployment: Vercel (statisch, SPA-Rewrite).
Kein Backend, keine Datenbank, keine Authentifizierung, keine Requests an fremde Server.
- Peer-Dependency-Konflikte nicht mit `--force` oder `--legacy-peer-deps` überdecken: stoppen und Konflikt samt Optionen an Lucas melden.

## Befehle
```
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build
npm run preview    # Build lokal ansehen
npm run lint       # ESLint
npm run typecheck  # tsc -b
npm run test       # Vitest
npm run check      # typecheck + lint + test + build  ← vor jedem PR grün
npm run e2e        # Playwright gegen den Produktions-Build (installiertes Chrome, nicht Teil von check)
```

## Ordnerstruktur
```
src/
  app/          App.tsx, router.tsx, providers.tsx (Toaster, Tooltip)
  features/     je Bereich Seite + Teilkomponenten:
                dashboard/ planner/ modules/ decision/ assistant/ inbox/ deadlines/ settings/ onboarding/
                dev-ui/ (Entwickler-Route /_ui, nur im Dev-Build)
  components/
    ui/         shadcn-Komponenten (generiert)
    layout/     AppShell, NavigationMenu, Topbar, RightRail
    common/     StatusBadge, ChannelBadge, Countdown, EctsProgress, ConsequenceItem,
                CitationList, DemoBadge, EmptyState, ErrorState, PageHeader
  domain/       reines TypeScript: types, terms, progress, rules, projection, decision, grades,
                assistant-matching (+ Tests daneben)
  services/     Interfaces je Kanal und Regelwerk; mock/ mit Latenz und optionalem Fehler
  data/         Dummy-Daten
  store/        Zustand-Store, Selektoren
  config/       demo.ts (APP_NAME, DEMO_NOW, LATENCY_MS, FLAGS)
  lib/          cn, Formatierung (Datum, Countdown, ECTS, Noten), ics
  styles/       globals.css (Tailwind, Design-Tokens)
```

## Architektur
Abhängigkeiten nur in diese Richtung: UI → Store/Selektoren → Domain; Store → Services → Data.
- `src/domain` ist pure TypeScript: keine React-Imports, keine Seiteneffekte, vollständig unit-getestet.
- UI importiert **nie** direkt aus `src/data`; Daten kommen über Services in den Store.
- Jeder Kanal (POS, Moodle, Mail, Website) und das Regelwerk haben ein eigenes Service-Interface. Mocks simulieren Latenz und optional Fehler (`FLAGS.simulateErrors`).
- „Jetzt“ ist ausschließlich `DEMO_NOW` – nie `new Date()` oder `Date.now()` in Komponenten oder Domäne.
- Simulierte Aktionen (z. B. Abmeldung) ändern nur den Store, speichern vorher einen Snapshot (Rückgängig) und sind im UI als Simulation erkennbar.
- Persistenz über Zustand `persist` mit `version`. Ändern sich Dummy-Daten: Version erhöhen, damit alte Demo-Stände verworfen werden. „Demo zurücksetzen“ in den Einstellungen.
- Nur helles Design: kein Theme-Code. `@custom-variant dark` in `globals.css` bleibt an die nie gesetzte Klasse `.dark` gebunden, damit die generierten `dark:`-Klassen von shadcn wirkungslos bleiben – nicht entfernen.
- App-Starts und GUI-Tests öffnen Fenster auf Lucas' Desktop: vorher ankündigen.

## UI und Inhalte
- Topnavigation und helles Menü-Panel unter dem Hamburger statt permanenter Sidebar und mobiler Tab-Leiste; ab 1280 px stehen alle Bereiche in der Topbar, den Hamburger gibt es nur darunter. Assistent-Button mit Sprechblase und Fenster unten rechts.
- Die Übersicht liest alle Werte über Store-Selektoren (`src/store/selectors.ts`); Lade- und Fehlerzustände je Kanal über `ResourceBoundary`.
- UI auf Deutsch mit Du-Ansprache; Code, Bezeichner und Commits auf Englisch; README auf Deutsch. **Quelle** (Beleg) ≠ **Kanal** (Herkunftssystem).
- Farben **nur über Tokens** aus `src/styles/globals.css`. Keine Hex-Werte in Komponenten.
- Terrakotta (`--accent`) ist Markenfarbe, **nie** Statusfarbe und nie Text auf hellem Grund (dort `--accent-strong`). Text auf Terrakotta-Flächen in `--accent-foreground` (Tinte). Neutrale Hover- und Auswahlflächen (Menüs, Listen) sind `bg-muted`, nicht `bg-accent`. Bringt eine neue shadcn-Komponente `bg-accent` als Hover mit, beim Hinzufügen umstellen.
- Creme als Arbeitsfläche, Weiß als Karte, warme neutrale Nebenflächen; lange Texte in Tinte statt Terrakotta. Terrakotta nur für Logo, Links, aktive Navigation, Fokusring, Assistent-Button und die Kante von „Jetzt wichtig“. Farbfamilie (`--tone-*`) für Module, Noten, ECTS und den Meilenstein-Chip im Studienverlauf (Violett) – ECTS immer `--tone-blue`; nie Statusfarbe. Informationshaltige Fortschrittsbalken nutzen die starken Töne (≥ 3:1 zum Track).
- Schriftgrößen über die Typo-Klassen (`text-page-title` … `text-figure`); Zahlen (ECTS, Countdown, Noten) mit `tabular-nums`.
- Status „Im Plan / Knapp / Kritisch“ immer als Icon + Text + Farbe.
- Realistische deutsche Texte; kein Lorem Ipsum, keine Bildplatzhalter, keine sichtbaren TODOs.
- Jede Aussage zu Regeln oder Fristen zeigt ihre Quelle (`CitationList`); ungeprüfte Regeln tragen das Label „Beispiel“. Quellen stehen als Fußzeile am Ende ihrer Karte, unter den Aktionen.
- Jeder Datenbereich hat Lade-, Leer- und Fehlerzustand.
- Barrierearm: Kontrast AA, sichtbarer Fokus, Kernflow per Tastatur, semantisches HTML, `aria-label` an Icon-Buttons, `prefers-reduced-motion`.
- Fokusring zentral aus `globals.css` (`:focus-visible`, 2 px `--ring` = `--accent-strong`, 2 px Abstand): Komponenten zeichnen keinen eigenen Ring und schalten ihn nicht mit `outline-none` ab. Schneidet ein Elternteil mit `overflow-hidden` ihn ab: `focus-visible:-outline-offset-2`.
- Keine Login- oder Passwortfelder. Keine Nachbildung echter POS- oder Moodle-Oberflächen; Übergaben an Originalsysteme nur als neutraler Hinweis („Im echten Betrieb …“).
- Beim Folgen-Check sind „Ich trete an“ und „Abmeldung vornehmen“ visuell gleich gewichtet – die App informiert, sie lenkt nicht.

## Git
- Branch pro Änderung: `feat/<kurzname>`, `fix/<kurzname>` oder `chore/<kurzname>`; Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Nie direkt auf `main`. Abschluss: `npm run check` grün → push → PR mit `gh` → Merge per Squash erst nach OK von Lucas → Branch löschen.
- Gepusht wird nur zum GitHub-Remote `origin`. Merges, Tags, Releases, Secrets und Repository-Einstellungen nur mit ausdrücklichem OK von Lucas.
- `main` ist immer deploybar (Vercel deployt `main` als Produktion; jeder andere Branch bekommt eine Preview-URL).
- Nie einchecken: Datenbanken, Logs, Secrets (`.env`), echte Nutzerdaten, fremde Designs.
- Dateien als UTF-8 mit den Zeilenenden aus `.gitattributes` (LF, Windows-Skripte CRLF).
