# Sprechhinweise und Quellen

Die Notizen sind auch über N in der HTML-Präsentation erreichbar.

## 1. StudiCompass

Begrüßung: Wir zeigen einen Prototyp für Studierende der TH Mannheim. StudiCompass ist der Arbeitstitel. Die Vorführung verwendet fiktive Hochschuldaten und Beispielregeln. [Konzept §2–4](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/KONZEPT.md)

## 2. Niklas im dritten Semester

Niklas Brandt ist die primäre Persona, 20 Jahre alt, im dritten Fachsemester, mit Nebenjob. Pendeln und kurzfristige Planung gehören zum Nutzungskontext. Die Persona ist nicht mit einem tatsächlich beobachteten Studierenden gleichzusetzen. [Konzept §2](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/KONZEPT.md)

## 3. Die Entscheidung am Abend vor der Frist

Die Frage ist ein formuliertes Szenario, kein erhobenes Zitat. Ausgangslage: 48 ECTS Ist bei Soll 60, Prognose zum Semesterende 78 von 90. Beim Statistik-Szenario fällt die Prognose nach Abmeldung auf 72, das Praxissemester auf SS 2028 und der Abschluss auf SS 2029. [Konzept §9 und §10.4](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/KONZEPT.md)

## 4. Live-Demo

Jetzt zum Browser wechseln. Der Ablauf dauert etwa 3:40 Minuten. Übersicht, Statistik vergleichen, Abmeldung simulieren, 72 von 90 und verschobene Meilensteine zeigen, dauerhaft Rückgängig im Statistik-Folgen-Check nutzen, Marketing vergleichen, Assistent mit Quelle, Fallback mit Entwurf. Vollständiger Sprechtext: DEMO-SKRIPT.md. Bei Ausfall: lokaler Build oder Backup-Video. Screenshot: docs/screens/folgen-check-statistik-1440.png, Stand 862fbb62639a3722b1a2195cfce94109f6a30617.

## 5. VPC-Bezug der gezeigten Funktionen

Die Tabelle verdichtet die im Konzept dokumentierte Traceability. G4 wird als In-App-Hinweis demonstriert, kein echter Push-Dienst. Die vier Zeilen decken P1 bis P5 sowie G1 bis G4 ab. [Konzept §3, vollständige Zuordnung zu Stories und Testaufgaben](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/KONZEPT.md)

## 6. Feedback aus dem vierköpfigen Team

Lucas bestätigte vier Teammitglieder, individuelle Funktionstests und gemeinsame Feedbacksammlung. Die 23 Einträge sind P5-F11 bis F33. F11 bis F32 sind umgesetzt, F33 (zweite Persona im 4. Semester) bleibt im Ideenparkplatz. Daraus lassen sich keine Personenhäufigkeiten oder repräsentativen Aussagen ableiten. M5 hat Lucas am 31.10. mit diesen Grenzen formal abgenommen. [Teamrunde](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/evaluation/P5-teamrunde.md) und [Befundliste](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/evaluation/P5-auswertung.md). Die M5-Entscheidung steht im Präsentations-PR unter docs/abnahmen/M5.md.

## 7. Studienverlauf: Ergebnis direkt an der Aktion

Beleg aus der gemeinsamen Sammelliste: Orientierung, enge Spalten und entferntes Ergebnis. Umsetzung P5-10/P5-11, technisch geprüft einschließlich Szenario D. Keine gemessene Verkürzung von Aufgabenzeiten behaupten. Vorher: fc12aadc736367e4143ccde56e198c2f1ed56252, docs/screens/studienverlauf-390.png. Nachher: 862fbb62639a3722b1a2195cfce94109f6a30617, docs/screens/studienverlauf-ergebnis-390.png. [Zuordnung der Befunde](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/evaluation/P5-teamrunde.md)

## 8. Module: kompakter und ergänzbar

Die Sammelliste nennt eine zu lange Liste sowie fehlende Links und Notizen. P5-12 setzt diese Punkte um. Der unabhängige PR29-Review fand und schloss eine Speicherlücke bei schnellen Neuladungen. Die Screenshots zeigen die Liste, die Ergänzungen liegen in den Moduldetails. Vorher: fc12aadc736367e4143ccde56e198c2f1ed56252, nachher: 862fbb62639a3722b1a2195cfce94109f6a30617, jeweils docs/screens/module-1440.png. [Nachprüfung der Speicherung](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/reviews/P5-PR29.md)

## 9. Fristen: eigene Termine im Kalender

P5-13/P5-14 ergänzen eigene Einträge und Kalenderansicht. Die Liste bleibt erhalten. Kalender enthält Fristen, eigene Termine, Vorleistungen und Prüfungen. Die technische Prüfung ist kein Nachweis eines realen Kalenderimports oder einer verbesserten Gebrauchstauglichkeit. Vorher: fc12aadc736367e4143ccde56e198c2f1ed56252, docs/screens/fristen-1440.png. Nachher: 862fbb62639a3722b1a2195cfce94109f6a30617, docs/screens/fristen-kalender-1440.png. [Kernbefunde und Evidenzgrenzen](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/evaluation/P5-teamrunde.md)

## 10. Technische Nachprüfung der Iteration

Die Zahlen beziehen sich auf den mit PR30 abgenommenen App-Stand 862fbb6: 325 Tests in 47 Dateien, 59 Browserfälle bestanden, 9 bewusst übersprungen, 66 Screenshots erstellt. Hauptstückaufteilung spart beim frischen Onboarding inklusive Vendor/Runtime rund 7,6 Prozent rohe JS-Bytes. Keine gemessene Ladezeitverbesserung behaupten. [Prüfbericht und unabhängiger Review](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/reviews/P5-abschluss.md)

## 11. Ausblick und Beteiligte

Diese Folie nennt Integrationsannahmen, Ideenparkplatz und ergänzte Stakeholder gemäß P6-03 / KONZEPT A-7. Das ist ein Ausblick, keine zugesagte Roadmap für ein Produktivsystem. Noch separat: ursprünglicher Flow-Chart-Abgleich, tatsächlicher ICS-Import, Screenreader, reale Geräte und Generalprobe. [Konzept §5.2 und §15](https://github.com/lucasstrubel/studicompass/blob/862fbb62639a3722b1a2195cfce94109f6a30617/docs/KONZEPT.md)

## 12. Entscheidungen mit nachvollziehbaren Folgen

Fragen aufnehmen. Die Live-Demo zeigt einen funktionalen Kern mit lokalen Berechnungen. Login, Hochschulkanäle, Assistent und Abmeldung sind simuliert. Keine Zugangsdaten werden erfasst, keine Anfrage wird gesendet. Bei fachlichen Fragen zur echten SPO die Grenze des Beispiels benennen.
