# ADR 0002: Drei Datenmodi statt eines gehosteten Moodle

Status: angenommen (13.11.2026)

## Kontext

Die öffentliche Demo ist eine statische Website und soll nichts kosten. Ein dauerhaft erreichbares Moodle braucht einen Server. Trotzdem soll sichtbar sein, dass die Anbindung echt ist.

## Entscheidung

Die App kennt drei Datenmodi. Sie unterscheiden sich nur darin, welcher Service den Kanal Moodle bedient; Oberfläche, Store und Fachlogik bleiben gleich.

| Modus        | Daten                                                        | Zeit       | Wo               |
| ------------ | ------------------------------------------------------------ | ---------- | ---------------- |
| Demo         | Beispieldaten aus `src/data/`                                | `DEMO_NOW` | öffentliche Demo |
| Aufzeichnung | aufgezeichnete Antworten der eigenen Moodle-Instanz          | `DEMO_NOW` | öffentliche Demo |
| Live         | Antworten eines Moodle, mit dem der Nutzer die App verbindet | `DEMO_NOW` | lokal, in der CI |

## Gründe

- Der Modus Aufzeichnung führt den echten Adapter aus (Prüfung der Antworten, Zuordnung zum Fachmodell), ohne dass ein Server läuft.
- Der Modus Live wird durch Integrationstests gegen einen Moodle-Container in GitHub Actions belegt, dazu durch ein Video im README.
- Der Modus Demo und sein Kernablauf bleiben unverändert; bestehende Tests gelten weiter.

## Folgen

- „Jetzt“ bleibt in allen Modi `DEMO_NOW` (geändert am 13.11.2026 bei der Umsetzung). Solange POS simuliert ist, hängt das Szenario an diesem Datum; zwei Uhren in einer Oberfläche würden Fristen aus Moodle und aus dem POS gegeneinander verschieben. Die Sandbox ist deshalb auf dieses Datum befüllt. Der Adapter bekommt die Zeit als Argument; eine echte Uhr lässt sich dort einsetzen, sobald auch POS echt ist.
- Die Oberfläche zeigt den Modus an.
- Aufzeichnungen müssen neu erzeugt werden, wenn sich die Beispielkurse ändern.
