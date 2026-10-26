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

## Projektstruktur

```
src/
  app/          App-Komponente, Routing, Provider
  features/     ein Ordner je Bereich (dashboard, planner, modules, decision, …)
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
