# StudiCompass – klickbarer Prototyp

Arbeitstitel „StudiCompass“ – der Name steht nur in `src/config/demo.ts` (`APP_NAME`).

## Worum es geht
Web-App, die Studierenden der TH Mannheim hilft, ihren Studienstand zu überblicken und Entscheidungen mit Folgen (z. B. eine Prüfungsabmeldung) informiert zu treffen. Sie bündelt POS, Moodle, Hochschul-Mail und Website und beantwortet Fragen zur Prüfungsordnung mit Quellenangabe.
Selbsterklärender Hi-Fi-Prototyp, kein Produktivsystem. POS und Website sind **Dummy-Daten**; Moodle hat zusätzlich eine echte Anbindung (Datenmodi Demo, Aufzeichnung, Live), Mail zusätzlich das echte Hochschul-Postfach über die Brücke (nur lokal) – `docs/adr/`. Wie es weitergeht: `docs/ROADMAP.md`.
Primäre Persona: **Niklas Brandt**, 20, Unternehmens- und Wirtschaftsinformatik (UIB), 3. Semester, Nebenjob 15 Std./Woche.
Regeln stammen aus der StuPO Bachelor (Fassung ab 01.09.2026, § 56 für UIB), Module aus dem Modulhandbuch UIB (module.informatik.th-mannheim.de). Noten, Termine, Mails und Kontaktdaten bleiben erfunden.

**Der Code ist die Quelle der Wahrheit.** Die Konventionen unten beschreiben den aktuellen Stand; sie dürfen geändert werden, wenn Lucas es so entscheidet. Tests werden angepasst, wenn sich das Verhalten bewusst ändert.

## Stack
Vite · React · TypeScript (strict) · React Router · Tailwind CSS · shadcn/ui (Radix) · lucide-react · Motion · assistant-ui (Runtime und Eingabe des Chats) · Zustand (persist) · Recharts (über shadcn `chart`) · date-fns (Locale `de`) · @dnd-kit/core · zod (nur im Moodle-Adapter) · Vitest + Testing Library · Playwright · Fontsource (Bricolage Grotesque, Hanken Grotesk, lokal) · Deployment: Vercel (statisch, SPA-Rewrite).
Keine Datenbank, keine eigene Authentifizierung. Einziger Server-Teil ist die **Brücke** (`server/`, ADR 0005): zustandslos, feste Ziele, nur lesend, läuft nur im lokalen Dev- und Preview-Server und wird nicht deployt (kein Ordner `api/`). Server-Abhängigkeiten: imapflow, postal-mime. Requests gehen nur an ein Moodle, das der Nutzer in den Einstellungen selbst verbindet (Modus Live), und an die Brücke derselben Herkunft; sonst an keinen fremden Server.
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
npm run moodle:up  # Moodle-Sandbox starten (Docker, infra/moodle); moodle:down, moodle:reset
npm run test:moodle    # Integrationstests gegen die Sandbox (nicht Teil von check)
npm run moodle:record  # dasselbe und Aufzeichnung nach src/data/recordings/ schreiben
npm run mail:up    # Mail-Sandbox starten und füllen (Docker, infra/mail); mail:down
npm run test:mail  # Integrationstests der Brücke gegen die Mail-Sandbox (nicht Teil von check)
```

## Ordnerstruktur
```
src/
  app/          App.tsx, router.tsx, providers.tsx (Motion, Toaster, Tooltip)
  features/     je Bereich Seite + Teilkomponenten:
                dashboard/ planner/ modules/ decision/ assistant/ inbox/ deadlines/ settings/ onboarding/
                dev-ui/ (Entwickler-Route /_ui, nur im Dev-Build)
  components/
    ui/         shadcn-Komponenten (generiert)
    layout/     AppShell, NavigationMenu, Topbar, RightRail
    common/     StatusBadge, ChannelBadge, Countdown, EctsProgress, ConsequenceItem,
                CitationList, DemoBadge, EmptyState, ErrorState, PageHeader, BrandMark, CourseDot, Segmented
  domain/       reines TypeScript: types, terms, progress, rules, projection, decision, grades,
                assistant-matching (+ Tests daneben)
  services/     Interfaces je Kanal und Regelwerk; mock/ mit Latenz und optionalem Fehler;
                moodle/ = echter Adapter (client, schemas, mapping, service, replay), per import() nachgeladen;
                bridge/ = Aufruf der Brücke; mail/ und pos/ = Adapter dahinter (schemas, mapping, Fehlertexte)
  data/         Dummy-Daten; recordings/ = aufgezeichnete Moodle-Antworten (erzeugt, nicht von Hand ändern)
  store/        Zustand-Store, Selektoren
  config/       demo.ts (APP_NAME, DEMO_NOW, LATENCY_MS, FLAGS)
  lib/          cn, Formatierung (Datum, Countdown, ECTS, Noten), ics
  styles/       globals.css (Tailwind, Design-Tokens)
public/praesentation/   reveal.js-Folien für SE2 (statisch, nicht von Vite gebaut); Quelle: docs/praesentation/konzept.md
docs/                   PROZESS.md (Entstehung, für Besucher des Repos), TECHNIK.md (technische Details), ROADMAP.md, SICHERHEIT.md, adr/ (Architekturentscheidungen), img/ (Screenshots fürs README)
server/                 Brücke (Node, eigenes Stück neben src/): bridge.ts (Router), mail.ts (IMAP), config.ts (feste Ziele), vite-plugin.ts
infra/moodle/           Moodle-Sandbox (Docker Compose, Seed-Skript); nur lokal und in der CI
infra/mail/             Mail-Sandbox (GreenMail, Seed-Skript); nur lokal und in der CI
.github/workflows/      check.yml: `npm run check` und `npm run e2e` bei jedem PR und auf main; moodle.yml, mail.yml: Adapter gegen die Sandboxen
```

## Architektur
Abhängigkeiten nur in diese Richtung: UI → Store/Selektoren → Domain; Store → Services → Data.
- `src/domain` ist pure TypeScript: keine React-Imports, keine Seiteneffekte, vollständig unit-getestet.
- UI importiert **nie** direkt aus `src/data`; Daten kommen über Services in den Store.
- Jeder Kanal (POS, Moodle, Mail, Website) und das Regelwerk haben ein eigenes Service-Interface. Mocks simulieren Latenz und optional Fehler (`FLAGS.simulateErrors`).
- Moodle kennt drei Datenmodi (`moodleSource` im Store): `demo` (Mock), `recording` (Aufzeichnung durch den echten Adapter), `live` (verbundenes Moodle). Antworten werden mit den Schemas geprüft, bevor sie ins Fachmodell kommen; Fehler sind `MoodleError` mit deutschem Text. Der Zugriffsschlüssel liegt nur im Speicher, nie im State oder in `persist`. „Neu in Moodle“ entsteht aus dem Vergleich zweier Abgleiche (`domain/moodle-changes.ts`); die Aufzeichnung hat dafür zwei Zustände.
- Mail kennt zwei Quellen: Beispiel-Mails oder das verbundene Postfach (`mailAccount` im Store, nie in `persist`). Die Brücke nimmt Zugangsdaten nur im Rumpf entgegen, speichert und protokolliert nichts, verbindet nur zu den festen Zielen aus `server/config.ts` und öffnet das Postfach schreibgeschützt; Fehler sind `MailError` mit deutschem Text. Das Passwort liegt wie der Moodle-Schlüssel nur im Speicher. Ohne Brücke (öffentliche Demo) zeigt die Oberfläche einen Hinweis statt des Formulars. Für POS steht das Gerüst (`posAccount`, `src/services/pos`); das Auslesen des Portals und der Abschnitt in den Einstellungen fehlen noch.
- „Jetzt“ ist ausschließlich `DEMO_NOW` – nie `new Date()` oder `Date.now()` in Komponenten oder Domäne. Das gilt auch im Modus Live, solange POS simuliert ist; die Sandbox ist auf dieses Datum befüllt.
- Simulierte Aktionen (z. B. Abmeldung) ändern nur den Store, speichern vorher einen Snapshot (Rückgängig) und sind im UI als Simulation erkennbar.
- Persistenz über Zustand `persist` mit `version`. Ändern sich Dummy-Daten: Version erhöhen, damit alte Demo-Stände verworfen werden. „Demo zurücksetzen“ in den Einstellungen.
- Nur helles Design: kein Theme-Code. `@custom-variant dark` in `globals.css` bleibt an die nie gesetzte Klasse `.dark` gebunden, damit die generierten `dark:`-Klassen von shadcn wirkungslos bleiben – nicht entfernen.
- App-Starts und GUI-Tests öffnen Fenster auf Lucas' Desktop: vorher ankündigen.

## UI und Inhalte
- Topnavigation und helles Menü-Panel unter dem Hamburger statt permanenter Sidebar und mobiler Tab-Leiste; ab 1280 px stehen alle Bereiche in der Topbar (Übersicht, Studienverlauf, Fristen, Assistent, Postfach, Module & Noten), den Hamburger gibt es nur darunter. Anlaufstellen hat keinen eigenen Eintrag in der Navigation; der Weg führt über den Assistenten und das Profilmenü. Assistent-Button mit Sprechblase und Fenster unten rechts.
- Die Übersicht liest alle Werte über Store-Selektoren (`src/store/selectors.ts`); Lade- und Fehlerzustände je Kanal über `ResourceBoundary`.
- UI auf Deutsch mit Du-Ansprache; Code, Bezeichner und Commits auf Englisch; README auf Deutsch. **Quelle** (Beleg) ≠ **Kanal** (Herkunftssystem).
- Farben **nur über Tokens** aus `src/styles/globals.css`. Keine Hex-Werte in Komponenten.
- Identität „Kurs“: Graphit und Mandarine. Mandarine (`--accent`) ist Markenfarbe, **nie** Statusfarbe und nie Text auf hellem Grund (dort `--accent-strong`). Text auf Mandarine-Flächen in `--accent-foreground` (Graphit). Neutrale Hover- und Auswahlflächen (Menüs, Listen) sind `bg-muted`, nicht `bg-accent`. Bringt eine neue shadcn-Komponente `bg-accent` als Hover mit, beim Hinzufügen umstellen.
- Flächen: kühles Fast-Weiß als Arbeitsfläche, Weiß mit Haarlinie als Fläche, ein gemeinsamer Schatten nur für Schwebendes. **Keine Box in einer Box**; Listen sind Zeilen in einer Fläche. Anthrazit ist nur die Kopfzeile des Assistenten-Fensters (`.surface-hero`, kein Theme): Sie belegt die Token-Namen lokal neu, Kontraste prüft `tokens.test.ts`. Darauf nur wenig Text in mindestens `text-body`, nie `text-meta`.
- Mandarine nur für Logo, Nadel, Kurslinie, ECTS-Balken, aktive Navigation und Assistent-Button; `--accent-strong` für Links und Fokusring, `--accent-soft` für „Jetzt wichtig“ und „Für dich heißt das“. Farbfamilie (`--tone-*`) für Module, Noten, ECTS und den Meilenstein-Chip im Studienverlauf (Violett) – ECTS-Balken und Kurslinie in Mandarine auf Weiß (dort erreicht sie 3:1); die Farbfamilie nie als Statusfarbe. Informationshaltige Fortschrittsbalken nutzen die starken Töne (≥ 3:1 zum Track).
- Signatur ist die Kurslinie (△ Start, nummerierte Kreise, ◎ Abschluss): Karte der Übersicht, Kopf der Semesterspalten, Schrittanzeige im Onboarding. Keine weitere Dekoration. Icons aus Lucide; eigene SVGs nur für die Nadel (`BrandMark`) und die Modul-Zeichnungen (`ModuleIllustration`).
- Schriftgrößen über die Typo-Klassen (`text-page-title` … `text-figure`); Zahlen (ECTS, Countdown, Noten) mit `tabular-nums`. Bricolage Grotesque nur auf `text-page-title`, `text-section-title` und `text-figure`, nie auf Labels, Buttons oder Tabellendaten. Kein Kicker über Überschriften, keine farbige Seitenkante.
- Status „Im Plan / Knapp / Kritisch“ immer als Icon + Text + Farbe.
- Realistische deutsche Texte; kein Lorem Ipsum, keine Bildplatzhalter, keine sichtbaren TODOs.
- Jede Aussage zu Regeln oder Fristen zeigt ihre Quelle (`CitationList`); Regeln aus der StuPO nennen ihren Paragraphen (`section`, `verified: true`); eigene Rechenregeln der App tragen das Label „Beispiel“. Quellen stehen als Fußzeile am Ende ihrer Karte oder Zeile, unter den Aktionen, immer sichtbar.
- Jeder Datenbereich hat Lade-, Leer- und Fehlerzustand.
- Barrierearm: Kontrast AA, sichtbarer Fokus, Kernflow per Tastatur, semantisches HTML, `aria-label` an Icon-Buttons, `prefers-reduced-motion`. `e2e/a11y.e2e.ts` prüft neue Seiten mit axe; dort eintragen.
- Der Produktions-Build trägt eine Content-Security-Policy (`vite.config.ts`): keine Inline-Skripte, kein `eval`, keine fremden Quellen. Neue Bibliotheken müssen darunter laufen (`e2e/security.e2e.ts`).
- Fokusring zentral aus `globals.css` (`:focus-visible`, 2 px `--ring` = `--accent-strong`, 2 px Abstand): Komponenten zeichnen keinen eigenen Ring und schalten ihn nicht mit `outline-none` ab (Ausnahme: nicht bedienbare Sprungziele mit `tabIndex={-1}`). Auf `.surface-hero` wird `--ring` lokal zur hellen Akzentfarbe. Schneidet ein Elternteil mit `overflow-hidden` ihn ab: `focus-visible:-outline-offset-2`.
- Bewegung: Kurve `--ease-strong`, nur `transform`, `opacity` und `clip-path`, kein `transition-all`, Ausgänge schneller als Eingänge. CSS ist der Normalfall; Motion nur für Unterbrechbares (Nadel, Navigations-Indikator). Eine geplante Geste: Die Kurslinie zeichnet sich einmal je Sitzung und nach einer Entscheidung. Keine Seitenübergänge, keine hochzählenden Zahlen. `AnimatePresence` nicht um Radix-Flächen, weil es Knoten in Tests hält.
- Keine Login-Seite. Geheimnisse werden nur in den Einstellungen eingegeben: der Moodle-Zugriffsschlüssel und, wo eine Brücke läuft, der Hochschul-Zugang (einziges Passwortfeld, mit Hinweis, wohin das Passwort geht). Keine Nachbildung echter POS- oder Moodle-Oberflächen; Übergaben an Originalsysteme nur als neutraler Hinweis („Im echten Betrieb …“).
- Beim Folgen-Check sind „Ich trete an“ und „Abmeldung vornehmen“ visuell gleich gewichtet – die App informiert, sie lenkt nicht.

## Git
- Branch pro Änderung: `feat/<kurzname>`, `fix/<kurzname>` oder `chore/<kurzname>`; Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Nie direkt auf `main`. Abschluss: `npm run check` grün → push → PR mit `gh` → Merge per Squash erst nach OK von Lucas → Branch löschen.
- Gepusht wird nur zum GitHub-Remote `origin`. Merges, Tags, Releases, Secrets und Repository-Einstellungen nur mit ausdrücklichem OK von Lucas.
- `main` ist immer deploybar (Vercel deployt `main` als Produktion; jeder andere Branch bekommt eine Preview-URL).
- Nie einchecken: Datenbanken, Logs, Secrets (`.env`), echte Nutzerdaten, fremde Designs.
- Dateien als UTF-8 mit den Zeilenenden aus `.gitattributes` (LF, Windows-Skripte CRLF).
