# Demo-Skript – Hero-Flow in 3:40 Minuten

Stand: 31.10.2026. Grundlage: genehmigte ROADMAP P6-02 und KONZEPT §9/§10.4. Alle Daten und ungeprüften Regeln sind Beispiele. Die Präsentation findet am 06.11. statt; **innerhalb der Demo ist es der 25.01.2027, 19:30 Uhr**.

## Vorbereitung vor dem Publikum

1. Produktionsseite oder lokalen Präsentationsbuild öffnen. Desktop 1440 × 900 oder Beamer-Auflösung, Browser-Zoom 100 %. Nicht während der Vorführung neu bauen.
2. `/einstellungen` öffnen, unten **Demo zurücksetzen** und im Dialog **Zurücksetzen** wählen.
3. **Demo ohne Einrichtung starten** wählen. Falls vorhanden, den einmaligen Assistent-Hinweis schließen oder kurz scrollen. Alle vier Kanäle bleiben verbunden.
4. Auf der Übersicht prüfen: „Guten Abend, Niklas“, Status **Knapp**, **48** ECTS Ist und **78 von 90** in der Semesterprognose. Keine eigene Termine, Notizen oder Vorleistungen eingeben.
5. Einen zweiten Tab mit `/entscheidung/e-mkt-ws26` bereithalten. Im ersten Tab auf die Übersicht zurückkehren. Backup-Video geöffnet pausieren und Folien lokal bereithalten.

## Bedienfolge und Sprechtext

Die Zeiten sind Zielmarken für die Vorführung, **keine gemessenen Nutzerzeiten**. Die Backup-Aufnahme folgt derselben Reihenfolge, ohne Ton. Der Sprechtext kann live darüber gesprochen werden.

| Zeit | Aktion / sichtbarer Beleg | Sprechtext |
|---|---|---|
| 0:00–0:25 | Übersicht. Studienstand und „Jetzt wichtig“ zeigen. | „Niklas studiert Wirtschaftsinformatik im dritten Semester und arbeitet nebenbei. Heute Abend überlegt er, Statistik abzumelden. Die Übersicht zeigt 48 erreichte ECTS. Gegenüber dem Soll von 60 ist er knapp. Wenn er die angemeldeten Prüfungen besteht, sind zum Semesterende 78 von 90 ECTS prognostiziert. Alle Angaben stammen hier aus Demodaten.“ |
| 0:25–1:00 | In **Jetzt wichtig** auf **Folgen prüfen**. Überschrift „Statistik – antreten oder abmelden?“. Vergleich der Optionen und Quellen zeigen. | „Vor der Entscheidung vergleicht er die Folgen. Statistik wird im Beispiel nur im Winter angeboten. Abmelden bedeutet deshalb mehr als sechs fehlende ECTS. Die Regel und ihre Quelle stehen direkt beim Vergleich. Ungeprüfte Regeln tragen das Label Beispiel.“ |
| 1:00–1:35 | Nach unten zu **Deine Entscheidung**. **Abmeldung vornehmen**, dann **Abmeldung simulieren**. Auf Übersicht **Kritisch**, **72 von 90**, **Praxissemester SS 2028**, **Abschluss SS 2029** zeigen. | „Ich simuliere die Abmeldung. StudiCompass sendet nichts an das POS. Die Prognose fällt auf 72 ECTS. Im Beispielszenario verschiebt sich das Praxissemester auf Sommer 2028 und der Abschluss auf Sommer 2029. Der Ist-Stand bleibt bei 48 ECTS.“ |
| 1:35–1:50 | Zweiten Statistik-Aufruf `/entscheidung/e-stat-ws26` öffnen. In der Ansicht der abgemeldeten Prüfung **Rückgängig** wählen. | „Die Simulation lässt sich zurücknehmen. Ich nutze dafür den dauerhaften Rückgängig-Button beim Folgen-Check. So hängt die Vorführung nicht vom kurzen Hinweisfenster ab.“ |
| 1:50–2:15 | Marketing-Tab oder `/entscheidung/e-mkt-ws26` öffnen. Vergleich bis Praxissemester zeigen. Keine zweite Abmeldung durchführen. | „Zum Vergleich Marketing: Auch hier fehlen bei einer Abmeldung ECTS. Das Praxissemester verschiebt sich im Beispielszenario jedoch nicht. Die Anwendung zeigt die konkreten Regeln und warnt nicht pauschal bei jeder Abmeldung.“ |
| 2:15–3:00 | `/assistent` öffnen. **Deine Frage**: „Was passiert, wenn ich Statistik schiebe?“ Dann **Frage stellen**. Antwort und Quellen zeigen, bei Bedarf im Verlauf scrollen. | „Der Assistent erklärt dieselbe Regel in Alltagssprache und bezieht sie auf den Studienstand. Er nennt die Quelle. Im Prototyp ordnet er Fragen lokal einem vorbereiteten Antwortkatalog zu. Eine echte KI oder Hochschulschnittstelle ist hier nicht angebunden.“ |
| 3:00–3:40 | Frage: „Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?“ Senden. **Anfrage vorbereiten** öffnen. Entwurf zeigen. | „Bei diesem Sonderfall reicht der Katalog nicht aus. Der Assistent benennt die Grenze und hilft mit einem Anfrageentwurf an die zuständige Stelle. Es wird nichts versendet. Das ist der Kern der Idee: den Studienstand verstehen, konkrete Folgen vergleichen und bei offenen Fragen einen nachvollziehbaren nächsten Schritt finden.“ |

## Falls etwas nicht klappt

- **Falscher Ausgangsstand:** Unter Einstellungen die Demo zurücksetzen, Standarddemo starten. Das betrifft nur den lokalen Browser-Speicher dieser Adresse.
- **Toast verschwunden:** `/entscheidung/e-stat-ws26` öffnen und dort **Rückgängig** wählen. Nicht unter Zeitdruck nach dem Toast suchen.
- **Antwort nicht sichtbar:** Im Assistenten zum neuesten Beitrag scrollen. Nicht doppelt senden. Quellen stehen am Ende der Antwortkarte.
- **Netz/Vercel nicht erreichbar:** Den bereits gestarteten lokalen Build auf `http://127.0.0.1:4173` verwenden. Online und lokal besitzen getrennte Demo-Speicher.
- **Lokaler Browserablauf scheitert:** Zum passenden Kapitel der Backup-Aufnahme springen und denselben Sprechtext fortsetzen. Die Folie „Live-Demo“ enthält zusätzlich ein statisches Bild.
- **Prüfungsregeln werden nachgefragt:** Als Beispielregeln benennen. Keine verbindliche Auskunft zur echten SPO behaupten. Die fachliche Verifikation bleibt separat ausgewiesen.

## Übergang zu den Ergebnisfolien

„Vier Teammitglieder haben alle Funktionen einzeln getestet und anschließend gemeinsam Feedback gesammelt. Daraus entstanden die folgenden Änderungen. Wir zeigen qualitative Befunde und technische Nachprüfungen. Aufgabenzeiten oder eine gemessene Verbesserung bei Studierenden haben wir nicht erhoben.“
