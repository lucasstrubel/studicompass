# StudiCompass – klickbarer Prototyp

Hi-Fi-Prototyp einer Web-App für Studierende der TH Mannheim (SE2, Studienleistung III). Die App bündelt POS, Moodle, Hochschul-Mail und Website, zeigt den eigenen Studienstand und macht die Folgen von Entscheidungen wie einer Prüfungsabmeldung sichtbar.

„StudiCompass“ ist ein Arbeitstitel. Alle Hochschul-Daten sind Dummy-Daten: Es gibt kein Backend, keine Anmeldung und keine Requests an fremde Server.

## Voraussetzungen

- Node.js 24 LTS (ab 24.15) oder Node.js 22 (ab 22.22.2)
- npm (wird mit Node.js installiert)

## Starten

```sh
npm install
npm run dev
```

Die App läuft dann unter http://localhost:5173.

## Befehle

| Befehl                 | Zweck                                                                    |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run dev`          | Entwicklungsserver                                                       |
| `npm run build`        | Produktions-Build nach `dist/` (mit Typprüfung)                          |
| `npm run preview`      | Build lokal ansehen                                                      |
| `npm run lint`         | ESLint                                                                   |
| `npm run typecheck`    | TypeScript-Prüfung (`tsc -b`, ohne Ausgabedateien)                       |
| `npm run test`         | Vitest, einmaliger Lauf                                                  |
| `npm run test:watch`   | Vitest im Watch-Modus                                                    |
| `npm run format`       | Prettier formatiert alle Dateien                                         |
| `npm run format:check` | Prettier prüft die Formatierung                                          |
| `npm run check`        | Prüf-Gate: typecheck, lint, test und build – muss vor jedem PR grün sein |

## Deployment

Vercel baut die App bei jedem Push und veröffentlicht sie statisch (Preset Vite, Ausgabe `dist/`).

- **Produktion:** `main` → https://studicompass-six.vercel.app
- **Preview:** Jeder andere Branch bekommt eine eigene Preview-URL; im Pull Request verlinkt sie der Vercel-Bot. Previews können eine Vercel-Anmeldung verlangen.
- [`vercel.json`](vercel.json) leitet alle Pfade ohne passende Datei auf `index.html` um. So öffnen Direktlinks wie `/verlauf` die App auch nach dem Neuladen; die Route löst React Router im Browser auf.

Lokal ist das nicht nötig: `npm run dev` und `npm run preview` liefern für unbekannte Pfade ohnehin `index.html`.

## Komponenten-Übersicht (nur Entwicklung)

Unter http://localhost:5173/_ui zeigt `npm run dev` die Farb-Tokens, die Typografie und alle shadcn/ui-Komponenten. Umschaltbar ist zwischen Hell, Dunkel und System; die Wahl wird wie in der App gespeichert. Die Route gibt es nur im Entwicklungsserver: Im Produktions-Build und damit auch auf Vercel fehlt sie.

Neue shadcn-Komponenten kommen mit `npx shadcn@latest add <name>` nach `src/components/ui/`. Danach:

- `npm run format`
- den Diff von `src/styles/globals.css` prüfen: Die CLI ergänzt dort Variablen. `npm run test` meldet überschriebene Token-Werte.
- `bg-accent`/`text-accent-foreground` als Hover- oder Auswahlfläche durch `bg-muted`/`text-foreground` ersetzen (`--accent` ist hier Terrakotta)
- eigene Fokus-Ringe (`focus-visible:ring-…`) und `outline-none` an fokussierbaren Elementen entfernen

Nie `shadcn add --overwrite` für vorhandene Komponenten: Die Wrapper weichen bewusst vom Registry-Stand ab. Abweichungen:

- A11y-Korrekturen aus P1-02 ([docs/reviews/P1-02.md](docs/reviews/P1-02.md))
- zentraler Fokusring
- neutrale Hover-Fläche in Menü und Select
- `destructive` mit 10 % bzw. 15 % Tönung
- `link` in `--accent-strong`
- Recharts-Fläche mit sichtbarem Fokus
- sonner ohne next-themes
- deutsche Beschriftungen: „Schließen“ in Dialog und Sheet; bei sonner der Bereich „Meldungen“ und der Button „Meldung schließen“

## Design-Tokens und Darstellung

- **Farben:** [`src/styles/globals.css`](src/styles/globals.css) enthält die Werte aus KONZEPT §12.2, hell in `:root`, dunkel in `.dark`. Die shadcn-Variablen sind darauf abgebildet. Eigene Tokens gibt es als Tailwind-Klassen, z. B. `text-accent-strong`, `bg-accent-soft`, `bg-status-critical-soft`, `text-status-critical-foreground`. Komponenten verwenden nur Tokens, keine Hex-Werte. [`src/styles/tokens.test.ts`](src/styles/tokens.test.ts) vergleicht die Werte mit den Tabellen in KONZEPT §12.2, rechnet die Kontrastpaare nach und prüft die Quelltexte auf Hex-Werte.
- **Schrift:** Manrope, lokal über Fontsource; es gibt keine Requests an fremde Server. Größen über die Typo-Klassen aus KONZEPT §12.3: `text-page-title`, `text-section-title`, `text-card-title`, `text-body` (Standard), `text-meta`, `text-figure`. Zahlen mit `tabular-nums`.
- **Fokus:** Ein Fokusring für alle fokussierbaren Elemente steht zentral in `globals.css`: 2 px `--ring` (= `--accent-strong`), 2 px Abstand. Schneidet ein Elternteil mit `overflow-hidden` ihn ab, kommt er mit `focus-visible:-outline-offset-2` nach innen.
- **Theme:** Hell, Dunkel oder System, gespeichert im `localStorage` unter `studicompass:theme` (`THEME_STORAGE_KEY` in [`src/config/demo.ts`](src/config/demo.ts)). Ein Inline-Skript in [`index.html`](index.html) setzt die Klasse `dark` an `<html>` vor dem ersten Rendern, damit nichts hell aufblitzt. Danach hält der ThemeProvider sie aktuell, auch wenn sich die Systemeinstellung ändert. Komponenten lesen und setzen das Theme über `useTheme()`. Ab P2-05 übernimmt der Store `setTheme`.
- **Dunkel ansehen:** Einen Umschalter in der App gibt es erst mit den Einstellungen (S9, P4-05). Bis dahin folgt die App der Systemeinstellung. In Chrome geht es auch ohne: DevTools → ⋮ → More tools → Rendering → „Emulate CSS media feature prefers-color-scheme“. Lokal schaltet zusätzlich `/_ui` um; die Wahl gilt auch für die App-Seiten.

## App-Shell und Navigation

- **Routen:** [`src/app/router.tsx`](src/app/router.tsx), wie in KONZEPT §7.
  - Jede Route trägt ihren Titel im `handle`. Er erscheint als Überschrift in der Topbar und als Browser-Tab-Titel „‹Titel› · StudiCompass“.
  - Seiten ohne eigenen Inhalt zeigen bis zu ihrem Task nur den Titel.
  - Unbekannte Pfade zeigen die 404-Seite. Das Onboarding (`/start`) läuft ohne Shell.
- **Layout:** [`src/components/layout/`](src/components/layout/), Einträge einmal in `navigation.ts`.
  - ab 1280 px: Sidebar (Tinte) mit Text
  - 768–1279 px: Icon-Leiste mit Tooltips
  - darunter: Tab-Leiste mit „Mehr“-Sheet
  - Die aktuelle Seite markieren Balken und Fettung, gesteuert über `aria-current`.
- **Topbar:** Seitentitel, Demo-Chip, Glocke und Profil-Menü.
  - Der Chip zeigt die feste Demo-Zeit `DEMO_NOW` aus [`src/config/demo.ts`](src/config/demo.ts): Mo, 25.01.2027, 19:30.
  - Zähler, Initialen und Benachrichtigungen kommen mit dem Store.
- **Rechte Spalte:** Eine Seite belegt sie über `handle.rightRail` (Komponente). Ab 1280 px steht sie rechts neben dem Hauptbereich, darunter unter ihm.
- **Tastatur und Scrollen:**
  - Der Skip-Link „Zum Inhalt“ ist das erste fokussierbare Element und setzt den Fokus auf `<main>`.
  - Neue Seiten starten oben (`ScrollRestoration`), Zurück stellt die Position wieder her. Links, die nur Suchparameter ändern, bekommen `preventScrollReset`.

## Projektstruktur

```
src/
  app/          App-Komponente, Routing (Routen, Root-Layout, 404), Provider
  features/     ein Ordner je Bereich (dashboard, planner, modules, decision, …); dev-ui/ = Route /_ui
  components/   ui/ (shadcn), layout/ (App-Shell), common/ (gemeinsame Bausteine)
  domain/       reine Fachlogik in TypeScript, unit-getestet
  services/     Schnittstelle je Kanal und für das Regelwerk, Mocks unter mock/
  data/         Dummy-Daten
  store/        Zustand-Store und Selektoren
  config/       Demo-Konfiguration (App-Name, Demo-Zeit, …)
  lib/          Hilfsfunktionen
  styles/       globale Styles und Design-Tokens
```

Verbindlich beschrieben sind Ordner und Architekturregeln in [CLAUDE.md](CLAUDE.md).

## Dokumentation

- [docs/KONZEPT.md](docs/KONZEPT.md) – Scope, Screens, Domänenmodell, Regeln, Testorakel, Gestaltung
- [docs/ROADMAP.md](docs/ROADMAP.md) – Tasks, Akzeptanzkriterien, Gates
- [docs/INHALTE.md](docs/INHALTE.md) – Dummy-Inhalte
- [docs/TESTPLAN.md](docs/TESTPLAN.md) – Evaluation
- [CLAUDE.md](CLAUDE.md) und [AGENTS.md](AGENTS.md) – Regeln für Claude Code und Codex
