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

Beim ersten Aufruf der Übersicht öffnet sich das vierstufige Onboarding. „Demo ohne Einrichtung starten“ überspringt es mit den Standardwerten. Direkte Links auf andere Seiten bleiben erreichbar. Unter Einstellungen kannst du die Einrichtung erneut starten oder die Demo zurücksetzen; das gewählte Design bleibt dabei erhalten.

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
| `npm run e2e`          | Playwright: Hero-Flow (Desktop und 390 px) gegen den Produktions-Build   |
| `npm run screens`      | Playwright: Screenshots der Kernscreens nach `docs/screens/`             |

### End-to-End-Tests und Screenshots (P3-05, Phase 4)

- Playwright nutzt das lokal installierte **Google Chrome** (`channel: "chrome"`); ein Browser-Download ist nicht nötig. Ohne Chrome schlagen `e2e` und `screens` fehl.
- Beide Befehle bauen die App (`npm run build`) und starten `vite preview` auf Port 4173. Läuft dort schon ein Server, wird er wiederverwendet.
- `npm run e2e` prüft Übersicht → Folgen-Check → simulierte Abmeldung → Übersicht (Kritisch, SS 2028, SS 2029) → „Rückgängig“, dazu denselben Weg nur per Tastatur und horizontales Scrollen auf den Kernscreens.
- Zusätzlich prüft `e2e` Onboarding und Tour per Tastatur, Postfach-Deep-Links und Gelesenstatus nach Neuladen, acht Assistentenfragen per Klick und Freitext, Fallback, ICS-Download, persönliche Einstellungen, Kanalverbindungen und Demo-Reset. Die ergänzenden Screens werden bei 360 bis 1920 px in beiden Themes geprüft.
- `npm run screens` schreibt 72 Aufnahmen (18 Ansichten in 1440×900 und 390×844, jeweils hell und dunkel) nach `docs/screens/`: Kernscreens, Module und Detail, Postfach und Detail, Assistent mit Antwort und Fallback, Fristen, Einstellungen, Glocken-Sheet und vier Onboarding-Schritte.
- `npm run check` enthält die End-to-End-Tests nicht; Playwright-Dateien enden auf `.e2e.ts`, damit Vitest sie nicht aufgreift.

## Daten und Berechnungen (Phase 2)

- `src/data/` enthält die Beispieldaten aus `docs/INHALTE.md`; ungeprüfte Regeln bleiben mit `verified: false` gekennzeichnet.
- Sechs Services laden POS, Moodle, Mail, Website, Regelwerk und Assistent unabhängig voneinander. Die Mocks warten 500 ms; `FLAGS.simulateErrors` in `src/config/demo.ts` aktiviert Fehler. Es gibt keine Hochschul-Requests.
- `src/store/demo-store.ts` hält Ladezustände, Einstellungen und Simulationen. `hydrate()` lädt die Daten, `retry()` wiederholt einen einzelnen Service. Unter `/_ui` lassen sich Ladezustände und Fehler beobachten; Übersicht, Folgen-Check und Studienverlauf zeigen sie je Kanal (Phase 3).
- `src/store/selectors.ts` liefert akademischen Zustand, Studienstand, Prognose, Postfach, Fristen und Benachrichtigungen. Berechnete Selektoren liefern bei unverändertem Store stabile Referenzen für React.
- Abmeldung speichert einen Snapshot; `undo()` stellt ihn wieder her, auch nach einem Neuladen. Was-wäre-wenn bleibt temporär. Nutzeränderungen werden unter `DEMO_STORAGE_KEY` gespeichert und durch `resetDemo()` zurückgesetzt. Nach Änderungen an den Beispieldaten `DATA_VERSION` erhöhen. Version 3 übernimmt Einstellungen und Simulationen aus Version 2 durch eine additive Migration; ältere Datenversionen werden verworfen. Das Theme behält seinen eigenen Schlüssel und übersteht den Demo-Reset.
- `src/domain/` enthält ausschließlich reine TypeScript-Berechnungen nach KONZEPT §10. Die Spezifikationstests wurden vor der Implementierung ausgeführt und bleiben unverändert. Nach drei Fehlversuchen wird die Prognose blockiert; zukünftige Praxis- und Abschlusstermine bleiben offen.
- Prüfnachweis, Testorakel und Übergabe: [Phase-2-Review](docs/reviews/P2.md).

## Ergänzende Funktionen (Phase 4)

- Der Assistent ordnet Fragen lokal einem vorbereiteten Antwortkatalog zu. Persönliche Zeilen stammen aus dem aktuellen Studienstand; bei Sonderfällen wird ein kopierbarer Anfrageentwurf vorbereitet. Es wird nichts gesendet.
- Das Postfach bündelt die vier Kanäle mit Filtern, Wichtigkeitsbegründungen und gespeicherten Gelesenmarkierungen. Beispiel: `/postfach?eintrag=i-02`.
- Module & Noten zeigt Kennzahlen und Moduldetails. Von dort öffnen sich der passende Folgen-Check oder der Assistent mit Modulkontext.
- Fristen lassen sich einzeln oder gemeinsam als ICS herunterladen. Der Import in eine echte Kalender-App steht als externe Prüfung noch aus.
- Einstellungen steuern Theme, Hinweis-Stil und Benachrichtigungstypen. Getrennte Kanäle behalten geladene Daten in der Sitzung; nach Neuladen lädt ein getrennter Kanal erst beim Wiederverbinden.
- Umsetzung, Prüfungen und offene Abnahmen: [Phasenbericht P4](docs/reviews/P4.md), [Umsetzungsnachweis](docs/reviews/P4-implementation.md).

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
- **Theme:** Hell, Dunkel oder System, gespeichert im `localStorage` unter `studicompass:theme` (`THEME_STORAGE_KEY` in [`src/config/demo.ts`](src/config/demo.ts)). Ein Inline-Skript in [`index.html`](index.html) setzt die Klasse `dark` an `<html>` vor dem ersten Rendern, damit nichts hell aufblitzt. Danach hält der ThemeProvider sie aktuell, auch wenn sich die Systemeinstellung ändert. Komponenten lesen und setzen das Theme über `useTheme()`, die Auswahl verwaltet der Store über `setTheme`.
- **Dunkel ansehen:** Der Schalter in der Topbar wechselt zwischen Hell und Dunkel. In den Einstellungen stehen Hell, Dunkel und System zur Auswahl; die Wahl bleibt gespeichert.

## App-Shell und Navigation

- **Routen:** [`src/app/router.tsx`](src/app/router.tsx), wie in KONZEPT §7.
  - Jede Route trägt ihren Titel im `handle`. Er erscheint als Überschrift im Inhaltsbereich und als Browser-Tab-Titel „‹Titel› · StudiCompass“; Seiten mit eigenem Kopf setzen `ownHeader`.
  - Unbekannte Pfade zeigen die 404-Seite. Das Onboarding (`/start`) läuft ohne Shell.
- **Layout:** [`src/components/layout/`](src/components/layout/), Einträge einmal in `navigation.ts`.
  - ab 1280 px: Toplinks und eingerückter Rahmen; alle Bereiche zusätzlich im Hamburger-Menü
  - darunter: Navigation über das Hamburger-Menü, mobil bildschirmfüllende App
  - Die aktuelle Seite markieren Kontur bzw. Balken und Fettung, gesteuert über `aria-current`.
- **Topbar:** Marke, Navigation, Theme-Schalter, Demo-Chip, Glocke mit Zähler und Profil-Menü.
  - Der Chip zeigt die feste Demo-Zeit `DEMO_NOW` aus [`src/config/demo.ts`](src/config/demo.ts): Mo, 25.01.2027, 19:30.
  - Datum und Uhrzeit erscheinen auf jedem Gerät in deutscher Zeit (`DEMO_TIME_ZONE`, Formatierung in [`src/lib/format.ts`](src/lib/format.ts)).
  - Die Glocke zeigt ungelesene Benachrichtigungen der gewählten Typen und öffnet ein Sheet mit Quellen und Ziel-Links.
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
