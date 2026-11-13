# Moodle-Sandbox

Ein lokales Moodle 4.5 (LTS) mit Beispielkursen, gegen das StudiCompass die echte Schnittstelle entwickelt und testet. Warum eine eigene Instanz: [ADR 0001](../../docs/adr/0001-eigene-moodle-instanz.md). Was die Schnittstelle liefert: [ADR 0004](../../docs/adr/0004-moodle-spike.md).

Alle Personen, Inhalte, Passwörter und Schlüssel hier sind Beispielwerte. Die Sandbox ist nur von diesem Rechner aus erreichbar (`127.0.0.1`) und verschickt keine Mails.

## Starten

Voraussetzung: Docker Desktop.

```sh
npm run moodle:up      # baut und startet, wartet bis Moodle bereit ist
npm run moodle:down    # stoppt, Daten bleiben erhalten
npm run moodle:reset   # löscht alle Daten und baut den Beispielstand neu auf
```

Der erste Start dauert einige Minuten (Moodle laden, Datenbank installieren, Kurse anlegen). Danach läuft Moodle unter http://localhost:8080.

## Beispielstand

| Konto      | Rolle                | Passwort        |
| ---------- | -------------------- | --------------- |
| `niklas`   | Student in 5 Kursen  | `Sandbox-2026!` |
| `dozentin` | Lehrende in 5 Kursen | `Sandbox-2026!` |
| `admin`    | Administration       | `Sandbox-2026!` |

Zugriffsschlüssel von Niklas für die Web Services: `5c0de5a1dbeef0000000000000000001`

| Kurs (`idnumber` = `moduleId` der App) | Aufgaben         | davon abgegeben |
| -------------------------------------- | ---------------- | --------------- |
| `m-pr2` Programmierung 2               | 12 Übungsblätter | 5               |
| `m-dm` Datenmanagement                 | 12 Übungsblätter | 11              |
| `m-web` Webbasierte Systeme            | 1 Pflichtübung   | 1               |
| `m-bwl2` Betriebswirtschaftslehre 2    | 10 Übungen       | 9               |
| `m-wi3` Wirtschaftsinformatik 3        | 6 Pflichtübungen | 4               |

Dazu je Kurs Dateien im Abschnitt „Vorlesung“ und Ankündigungen. Die Zahlen entsprechen den Beispieldaten in `src/data/moodle-progress.ts`.

## Testen und aufzeichnen

```sh
npm run test:moodle     # Adapter der App gegen die laufende Sandbox
npm run moodle:record   # dasselbe und src/data/recordings/moodle.json neu schreiben
```

Die Aufzeichnung gehört zum Beispielstand: Nach einer Änderung am Seed-Skript `npm run moodle:reset` und danach `npm run moodle:record` ausführen.

In der App: Einstellungen → Moodle-Daten → „Eigenes Moodle“, Adresse `http://localhost:8080` und den Zugriffsschlüssel von oben eintragen.

## Eine Änderung auslösen

Als Dozentin eine neue Datei in einen Kurs legen, ohne die Oberfläche von Moodle zu öffnen:

```sh
docker compose -f infra/moodle/docker-compose.yml exec -u www-data moodle \
  php /opt/studicompass/seed/add-upload.php m-pr2 "Vorlesung 03: Ausnahmen"
```

Unter Git Bash vorher `export MSYS_NO_PATHCONV=1` setzen, sonst wird der Pfad im Container umgeschrieben.

## Schnittstelle ausprobieren

```sh
curl http://localhost:8080/webservice/rest/server.php \
  -d wstoken=5c0de5a1dbeef0000000000000000001 \
  -d moodlewsrestformat=json \
  -d wsfunction=core_enrol_get_users_courses -d userid=3
```
