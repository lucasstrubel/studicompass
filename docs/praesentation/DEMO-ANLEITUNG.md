# Demo-Anleitung und Backup

## Schnellstart

**Online:** <https://studicompass-six.vercel.app>. Aktueller abgenommener App-Stand: `862fbb6` (PR #30).

**Im Repository:**

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Dann <http://127.0.0.1:4173> öffnen. Für die Vorführung den fertigen Build verwenden. `npm ci` benötigt bei einer frischen Installation Internet, der bereits gebaute Prototyp danach nicht.

**Separates Offline-Paket:** `artifacts/presentation/studicompass-lokal.zip` vollständig entpacken. Im entpackten Ordner `START.cmd` ausführen oder `node server.mjs` starten. Node.js 22.22.2 oder neuer muss bereits installiert sein. Keine npm-Installation und kein Internet erforderlich. Der Server bindet nur an `127.0.0.1`. Mit Strg+C beenden. Bei belegtem Port: `node server.mjs --port 4174` und die ausgegebene Adresse öffnen.

Das Paket enthält den Produktionsbuild, einen lokalen SPA-Server, diese Anleitung und ein Manifest mit Basis-Commit und SHA-256-Prüfsummen. Es ist ein Präsentationsbackup und kein veröffentlichter Release.

## Ausgangsstand herstellen

1. `/einstellungen` öffnen.
2. Unter **Demo** auf **Demo zurücksetzen** klicken und **Zurücksetzen** bestätigen.
3. Auf der Startseite **Demo ohne Einrichtung starten** wählen.
4. Übersicht kontrollieren: **48 ECTS**, **Knapp**, Semesterprognose **78 von 90**.
5. Demo-Zeit ist fest: **25.01.2027, 19:30 Europe/Berlin**. Präsentationsdatum ist davon unabhängig.

Zurücksetzen löscht die simulierten Entscheidungen, eigenen Einträge und lokalen Einstellungen an dieser Adresse. Es betrifft keine echten Hochschuldaten. Mehrere Tabs derselben Adresse während der Demo nicht für unterschiedliche Simulationen verwenden.

## Vorführung

Der vollständige Sprechtext mit Zielzeit 3:40 steht im [Demo-Skript](DEMO-SKRIPT.md).

| Station | Direkter Pfad | Erwartung |
|---|---|---|
| Übersicht | `/` | 48 ECTS Ist, 78 von 90 Prognose, Knapp |
| Statistik | `/entscheidung/e-stat-ws26` | Vergleich der Optionen, Beispielquellen |
| Nach simulierter Statistik-Abmeldung | `/` | 72 von 90 Prognose, Kritisch, Praxissemester SS 2028, Abschluss SS 2029 |
| Rückgängig | `/entscheidung/e-stat-ws26` | Dauerhafter Button, wenn die Simulation noch rückgängig gemacht werden kann |
| Marketing | `/entscheidung/e-mkt-ws26` | Abmeldung verschiebt das Praxissemester im Beispielszenario nicht |
| Assistent | `/assistent` | Frage „Was passiert, wenn ich Statistik schiebe?“ mit Quelle |
| Sonderfall | `/assistent` | Frage aus dem Skript, ehrlicher Fallback, Anfrageentwurf ohne Versand |

## Folien

`studicompass.html` lokal in Chrome/Edge öffnen. Die Datei enthält alle Bilder und die Schrift und benötigt kein Netzwerk.

- Pfeil rechts / Leertaste / Bild ab: nächste Folie.
- Pfeil links / Bild auf: vorherige Folie. Pos1 / Ende: erste / letzte Folie.
- **F** oder Schaltfläche **Vollbild**: Vollbild. Escape beendet es.
- **N** oder **Notizen**: Quellen und Sprechhinweise ein-/ausblenden. Vor dem Publikum geschlossen lassen.
- Über die Foliennummer in der Adresse (`#4`) eine Station direkt öffnen.
- `studicompass.pdf` ist die statische 16:9-Ausgabe. Keine interaktive Live-Demo im PDF.

Die HTML-Quelle ist lokal bearbeitbar; die reproduzierbare Erstellung liegt unter `scripts/presentation/`. Es wird keine PowerPoint-Datei als geprüft ausgegeben.

## Video und weitere Backups

`artifacts/presentation/hero-flow.webm` zeigt den tatsächlichen Browserablauf in 1440 × 900, ohne Ton. `hero-flow.vtt` liefert zuschaltbare Kapitelhinweise, `backup.html` einen lokalen Player. Die Zeitmarken und Prüfergebnisse stehen in `manifest.json` und im [P6-Prüfbericht](../reviews/P6.md).

Die Aufnahme verwendet ausschließlich Demodaten und ersetzt bei Ausfall die Live-Bedienung. Das Skript bleibt der Sprechtext. Screenshots stehen unter `docs/screens/`. Der Ordner `artifacts/presentation/` ist eine lokale Ausgabe und wird nicht als Build-Verzeichnis ins Repository eingecheckt. Er lässt sich mit den dokumentierten Skripten neu erzeugen.

## Vor dem Präsentationstermin durch das Team

- Offline-Paket, Video und Folien auf das Präsentationsgerät kopieren und dort öffnen.
- Projektor, Tonfreiheit des Videos, Vollbild, Browser-Zoom und Lesbarkeit prüfen. Zielauflösungen: 1280 × 720 und 1920 × 1080.
- Demo zurücksetzen und den Ablauf mit Sprecherwechseln proben.
- Content-Freeze und finalen Release-Stand mit Lucas abstimmen. Tags und Release benötigen ausdrückliche Freigabe.

Diese Generalprobe sowie echte Geräte, Screenreader und ein tatsächlicher ICS-Kalenderimport werden durch die lokale automatisierte Prüfung nicht als bestanden ausgegeben.
