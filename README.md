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

Beim ersten Aufruf der Übersicht öffnet sich das vierstufige Onboarding. „Demo ohne Einrichtung starten“ überspringt es mit den Standardwerten und ohne Tour. Ab Schritt 2 behält „Überspringen“ deine Eingaben; die Produkt-Tour ist standardmäßig angehakt und lässt sich abwählen. Direkte Links auf andere Seiten bleiben erreichbar. Unter Einstellungen kannst du dein lokales Profil bearbeiten, die Einrichtung erneut starten oder die Demo zurücksetzen.

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
- Zusätzlich prüft `e2e` Onboarding und Tour per Tastatur, Postfach-Deep-Links und Gelesenstatus nach Neuladen, neun Assistentenfragen per Klick und Freitext, Fallback, ICS-Download, Profiländerungen, Kanalverbindungen und Demo-Reset. Kalender und Anlaufstellen gehören zu den ergänzenden Screens bei 360 bis 1920 px; der Kalender hat außerdem einen Touchtest bei 360 px. Der Hero-Flow-Test fragt den Assistenten im Fenster vom Folgen-Check aus.
- `npm run screens` schreibt 59 Aufnahmen (30 Ansichten in 1440×900 und 390×844; das Menü nur bei 390 px, nur helles Design) als `<ansicht>-<breite>.png` nach `docs/screens/`: Kernscreens, Module und Detail, Prüfungsvorleistung, Postfach und Detail, Assistent mit Antwort, Anlaufstellen-Antwort, Fallback und Wartezustand, Anlaufstellen, Fristen (auch Kalender, eigener Termin und Ladezustand), Einstellungen, Glocken-Sheet, Menü, Assistent-Fenster über dem Folgen-Check und vier Onboarding-Schritte.
- `npm run check` enthält die End-to-End-Tests nicht; Playwright-Dateien enden auf `.e2e.ts`, damit Vitest sie nicht aufgreift.

## Daten und Berechnungen (Phase 2)

- `src/data/` enthält die Beispieldaten aus `docs/INHALTE.md`; ungeprüfte Regeln bleiben mit `verified: false` gekennzeichnet.
- Sechs Services laden POS, Moodle, Mail, Website, Regelwerk und Assistent unabhängig voneinander. Die Mocks warten 500 ms; `FLAGS.simulateErrors` in `src/config/demo.ts` aktiviert Fehler. Es gibt keine Hochschul-Requests.
- `src/store/demo-store.ts` hält Ladezustände, Einstellungen und Simulationen. `hydrate()` lädt die Daten, `retry()` wiederholt einen einzelnen Service. Unter `/_ui` lassen sich Ladezustände und Fehler beobachten; Übersicht, Folgen-Check und Studienverlauf zeigen sie je Kanal (Phase 3).
- `src/store/selectors.ts` liefert akademischen Zustand, Studienstand, Prognose, Postfach, Fristen und Benachrichtigungen. Berechnete Selektoren liefern bei unverändertem Store stabile Referenzen für React.
- Abmeldung speichert einen Snapshot; `undo()` stellt ihn wieder her, auch nach einem Neuladen. Was-wäre-wenn bleibt temporär. Nutzeränderungen werden unter `DEMO_STORAGE_KEY` gespeichert und durch `resetDemo()` zurückgesetzt. Nach Änderungen an den Beispieldaten `DATA_VERSION` erhöhen. Version 4 (P5-15: Zuständigkeiten und A-09) übernimmt Einstellungen, Simulationen und gültige eigene Einträge aus Version 2 und 3 additiv; ältere Datenversionen werden verworfen. Der Profilname ersetzt nur die Anzeige, nicht die POS-Daten oder akademische Berechnungen. Der Gesprächsverlauf des Assistenten (`assistantThread`) liegt nur im Speicher; `resetDemo()` leert ihn.
- `src/domain/` enthält ausschließlich reine TypeScript-Berechnungen nach KONZEPT §10. Die Spezifikationstests wurden vor der Implementierung ausgeführt und bleiben unverändert. Nach drei Fehlversuchen wird die Prognose blockiert; zukünftige Praxis- und Abschlusstermine bleiben offen.
- Prüfnachweis, Testorakel und Übergabe: [Phase-2-Review](docs/reviews/P2.md).

## Ergänzende Funktionen (Phase 4)

- Der Assistent ordnet Fragen lokal einem vorbereiteten Antwortkatalog zu. Persönliche Zeilen stammen aus dem aktuellen Studienstand; bei Sonderfällen wird ein kopierbarer Anfrageentwurf vorbereitet. Es wird nichts gesendet.
- Das Postfach bündelt die vier Kanäle mit Filtern, Wichtigkeitsbegründungen und gespeicherten Gelesenmarkierungen. Beispiel: `/postfach?eintrag=i-02`.
- Module & Noten zeigt Kennzahlen und Moduldetails. Von dort öffnen sich der passende Folgen-Check oder der Assistent mit Modulkontext.
- Fristen lassen sich einzeln oder gemeinsam als ICS herunterladen. Der Import in eine echte Kalender-App steht als externe Prüfung noch aus.
- Die Fristen haben eine Kalenderansicht (`/fristen?ansicht=kalender`) mit deutschen Kalendertagen, Fristen, eigenen Terminen, Prüfungsvorleistungen und Prüfungsterminen. Liste und Kalender teilen Quellen und Aktionen.
- Anlaufstellen zeigt Zuständigkeiten, Kontakt und Sprechzeiten mit Beispielquellen. Passende Fragen führen in den Assistenten; seine zuständigen Stellen verlinken zurück zur jeweiligen Karte.
- Einstellungen steuern Hinweis-Stil und Benachrichtigungstypen. Getrennte Kanäle behalten geladene Daten in der Sitzung; nach Neuladen lädt ein getrennter Kanal erst beim Wiederverbinden.
- Umsetzung, Prüfungen und offene Abnahmen: [Phasenbericht P4](docs/reviews/P4.md), [Umsetzungsnachweis](docs/reviews/P4-implementation.md).

## Deployment

Vercel baut die App bei jedem Push und veröffentlicht sie statisch (Preset Vite, Ausgabe `dist/`).

- **Produktion:** `main` → https://studicompass-six.vercel.app
- **Preview:** Jeder andere Branch bekommt eine eigene Preview-URL; im Pull Request verlinkt sie der Vercel-Bot. Previews können eine Vercel-Anmeldung verlangen.
- [`vercel.json`](vercel.json) leitet alle Pfade ohne passende Datei auf `index.html` um. So öffnen Direktlinks wie `/verlauf` die App auch nach dem Neuladen; die Route löst React Router im Browser auf.

Lokal ist das nicht nötig: `npm run dev` und `npm run preview` liefern für unbekannte Pfade ohnehin `index.html`.

## Komponenten-Übersicht (nur Entwicklung)

Unter http://localhost:5173/_ui zeigt `npm run dev` die Farb-Tokens, die Typografie und alle shadcn/ui-Komponenten. Dazu gehört die Farbfamilie (`--tone-*`). Die Route gibt es nur im Entwicklungsserver: Im Produktions-Build und damit auch auf Vercel fehlt sie.

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

- **Farben:** [`src/styles/globals.css`](src/styles/globals.css) enthält die Werte aus KONZEPT §12.2 in `:root`: Grundfarben, Farbfamilie und Statusfarben. Die shadcn-Variablen sind darauf abgebildet. Eigene Tokens gibt es als Tailwind-Klassen, z. B. `text-accent-strong`, `bg-accent-soft`, `bg-tone-blue`, `bg-status-critical-soft`, `text-status-critical-foreground`. Die Modulfarben ordnet `moduleTone()` in [`src/features/dashboard/module-art.ts`](src/features/dashboard/module-art.ts) zu; `moduleToneStyle()` setzt `--module-tone` und `--module-tone-soft` für Illustration, Balken und Notenkreis. Komponenten verwenden nur Tokens, keine Hex-Werte. [`src/styles/tokens.test.ts`](src/styles/tokens.test.ts) vergleicht die Werte mit den Tabellen in KONZEPT §12.2, rechnet die Kontrastpaare nach und prüft die Quelltexte auf Hex-Werte.
- **Schrift:** Manrope, lokal über Fontsource; es gibt keine Requests an fremde Server. Größen über die Typo-Klassen aus KONZEPT §12.3: `text-page-title`, `text-section-title`, `text-card-title`, `text-body` (Standard), `text-meta`, `text-figure`. Zahlen mit `tabular-nums`.
- **Fokus:** Ein Fokusring für alle fokussierbaren Elemente steht zentral in `globals.css`: 2 px `--ring` (= `--accent-strong`), 2 px Abstand. Schneidet ein Elternteil mit `overflow-hidden` ihn ab, kommt er mit `focus-visible:-outline-offset-2` nach innen.
- **Nur helles Design** (P5-06): Es gibt keinen Dark Mode. `@custom-variant dark` bleibt an die nie gesetzte Klasse `.dark` gebunden, damit die generierten `dark:`-Klassen von shadcn/ui auch bei dunkler Systemeinstellung wirkungslos bleiben.

## App-Shell und Navigation

- **Routen:** [`src/app/router.tsx`](src/app/router.tsx), wie in KONZEPT §7.
  - Jede Route trägt ihren Titel im `handle`. Er erscheint als Überschrift im Inhaltsbereich und als Browser-Tab-Titel „‹Titel› · StudiCompass“; Seiten mit eigenem Kopf setzen `ownHeader`.
  - Unbekannte Pfade zeigen die 404-Seite. Das Onboarding (`/start`) läuft ohne Shell.
- **Layout:** [`src/components/layout/`](src/components/layout/), Einträge einmal in `navigation.ts`.
  - ab 1280 px: alle Bereiche als Toplinks und eingerückter Rahmen; kein Hamburger-Menü
  - darunter: Navigation über das Hamburger-Menü, mobil bildschirmfüllende App
  - Das Hamburger-Menü ist ein helles Panel unter dem Button: Hover zeigt eine Vorschau, Klick oder Tastatur fixieren dasselbe Panel als Dialog mit Fokusführung. Die Seite bleibt sichtbar und scharf.
  - Die aktuelle Seite markieren Kontur bzw. Fläche und Fettung, gesteuert über `aria-current`.
- **Topbar:** Marke, Navigation, Glocke mit Zähler und ganz rechts das Profil-Menü.
  - „Jetzt“ ist die feste Demo-Zeit `DEMO_NOW` aus [`src/config/demo.ts`](src/config/demo.ts): Mo, 25.01.2027, 19:30. Die Topbar zeigt sie nicht mehr; das Testszenario nennt das Datum.
  - Datum und Uhrzeit erscheinen auf jedem Gerät in deutscher Zeit (`DEMO_TIME_ZONE`, Formatierung in [`src/lib/format.ts`](src/lib/format.ts)).
  - Die Glocke zeigt ungelesene Benachrichtigungen der gewählten Typen und öffnet ein Sheet mit Quellen und Ziel-Links.
- **Assistent-Button:** [`AssistantLauncher`](src/features/assistant/AssistantLauncher.tsx) unten rechts auf jeder Shell-Seite außer `/assistent`, beim Aufruf mit Sprechblase. Er öffnet ein Fenster mit [`AssistantChat`](src/features/assistant/AssistantChat.tsx), dem Chat der Assistent-Seite in kompakter Form; beide teilen den Verlauf im Store. Toasts und das Seitenende halten Abstand zum Button.
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
