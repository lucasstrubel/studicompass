# ADR 0002: Drei Datenmodi statt eines gehosteten Moodle

Status: angenommen (13.11.2026)

## Kontext

Die öffentliche Demo ist eine statische Website und soll nichts kosten. Ein dauerhaft erreichbares Moodle braucht einen Server. Trotzdem soll sichtbar sein, dass die Anbindung echt ist.

## Entscheidung

Die App kennt drei Datenmodi. Sie unterscheiden sich nur darin, welcher Service den Kanal Moodle bedient; Oberfläche, Store und Fachlogik bleiben gleich.

| Modus        | Daten                                                        | Zeit       | Wo               |
| ------------ | ------------------------------------------------------------ | ---------- | ---------------- |
| Demo         | Beispieldaten aus `src/data/`                                | `DEMO_NOW` | öffentliche Demo |
| Aufzeichnung | aufgezeichnete Antworten der eigenen Moodle-Instanz          | fest       | öffentliche Demo |
| Live         | Antworten eines Moodle, mit dem der Nutzer die App verbindet | echte Zeit | lokal, in der CI |

## Gründe

- Der Modus Aufzeichnung führt den echten Adapter aus (Prüfung der Antworten, Zuordnung zum Fachmodell), ohne dass ein Server läuft.
- Der Modus Live wird durch Integrationstests gegen einen Moodle-Container in GitHub Actions belegt, dazu durch ein Video im README.
- Der Modus Demo und sein Kernablauf bleiben unverändert; bestehende Tests gelten weiter.

## Folgen

- „Jetzt“ kommt nicht mehr überall aus `DEMO_NOW`, sondern aus einer Uhr, die je Modus die Demo-Zeit oder die echte Zeit liefert. Die Fachlogik bekommt die Zeit weiterhin als Argument.
- Die Oberfläche zeigt den Modus an.
- Aufzeichnungen müssen neu erzeugt werden, wenn sich die Beispielkurse ändern.
