# Inhalte – Dummy-Daten für den Prototyp

Alle Werte sind **Beispiele**, bis das Team sie ersetzt oder bestätigt (Task P0-02).
- Spalte „geprüft“: `ja` = mit SPO, Modulhandbuch oder Website abgeglichen → im Code `verified: true`.
- Ändert ihr Werte, müssen die Erwartungswerte in `docs/KONZEPT.md` §10.4 und die Tests im selben PR angepasst werden.
- Personen, Matrikelnummer und E-Mail-Adressen sind fiktiv. Echte Kontaktdaten nur übernehmen, wenn sie öffentlich auf der Hochschul-Website stehen; sonst bei `*.example` bleiben.
- Hi-Fi-Regel (VL05): keine Platzhaltertexte. Wenn ein Wert fehlt, lieber weglassen als „TBD“ anzeigen.

---

## 1 Studiengang

| Feld | Wert | geprüft |
|---|---|---|
| Studiengang | Wirtschaftsinformatik (B. Sc.) | nein |
| Hochschule | TH Mannheim | – |
| Prüfungsordnung | SPO Wirtschaftsinformatik (Version eintragen) | nein |
| ECTS gesamt | 210 | nein |
| Regelstudienzeit | 7 Semester | laut Persona |
| Grundstudium | Fachsemester 1–3 | nein |
| Hauptstudium | Fachsemester 4–7 | nein |
| Praxissemester | Fachsemester 5 | nein |
| Projektsemester | Fachsemester 6 | nein |
| Bachelorarbeit | Fachsemester 7 | nein |

---

## 2 Module (Studienverlaufsplan, Beispiel)

Angebot: `WS` = nur Wintersemester · `SS` = nur Sommersemester · `BOTH` = jedes Semester

| ID | Modul | ECTS | Fachsem. | Abschnitt | Angebot | Prüfung |
|---|---|---|---|---|---|---|
| m-gwi | Grundlagen der Wirtschaftsinformatik | 6 | 1 | Grund | WS | Klausur 90 Min. |
| m-prog1 | Programmieren 1 | 6 | 1 | Grund | WS | Klausur am Rechner 90 Min. |
| m-mathe1 | Mathematik 1 | 6 | 1 | Grund | WS | Klausur 90 Min. |
| m-bwl | Grundlagen der BWL | 6 | 1 | Grund | WS | Klausur 60 Min. |
| m-rewe | Externes Rechnungswesen | 6 | 1 | Grund | WS | Klausur 90 Min. |
| m-prog2 | Programmieren 2 | 6 | 2 | Grund | SS | Klausur am Rechner 90 Min. |
| m-mathe2 | Mathematik 2 | 6 | 2 | Grund | SS | Klausur 90 Min. |
| m-bsrn | Betriebssysteme und Rechnernetze | 6 | 2 | Grund | SS | Klausur 90 Min. |
| m-klr | Kosten- und Leistungsrechnung | 6 | 2 | Grund | SS | Klausur 60 Min. |
| m-recht | Wirtschaftsprivatrecht | 6 | 2 | Grund | SS | Klausur 90 Min. |
| m-stat | Statistik | 6 | 3 | Grund | **WS** | Klausur 90 Min. |
| m-db | Datenbanken | 6 | 3 | Grund | WS | Klausur 90 Min. |
| m-se1 | Software Engineering 1 | 6 | 3 | Grund | WS | Projektbericht + Klausur 60 Min. |
| m-gpm | Geschäftsprozessmanagement | 6 | 3 | Grund | BOTH | Klausur 60 Min. |
| m-mkt | Marketing | 6 | 3 | Grund | **BOTH** | Klausur 60 Min. |
| m-se2 | Software Engineering 2 | 6 | 4 | Haupt | SS | Projekt + Präsentation |
| m-web | Web-Technologien | 6 | 4 | Haupt | SS | Projektarbeit |
| m-erp | ERP-Systeme | 6 | 4 | Haupt | SS | Klausur 60 Min. |
| m-itpm | IT-Projektmanagement | 6 | 4 | Haupt | SS | Hausarbeit |
| m-wp1 | Wahlpflichtmodul 1 | 6 | 4 | Haupt | BOTH | je nach Modul |
| m-praxis | Praxissemester | 30 | 5 | Haupt | BOTH | Praxisbericht + Kolloquium (Meilenstein) |
| m-projekt | Projektsemester | 18 | 6 | Haupt | BOTH | Projektbericht (Meilenstein) |
| m-itsec | IT-Sicherheit | 6 | 6 | Haupt | BOTH | Klausur 60 Min. |
| m-wp2 | Wahlpflichtmodul 2 | 6 | 6 | Haupt | BOTH | je nach Modul |
| m-ba | Bachelorarbeit | 12 | 7 | Haupt | BOTH | Abschlussarbeit (Meilenstein) |
| m-kolloq | Kolloquium | 3 | 7 | Haupt | BOTH | mündlich |
| m-seminar | Wissenschaftliches Seminar | 6 | 7 | Haupt | BOTH | Seminararbeit |
| m-wp3 | Wahlpflichtmodul 3 | 6 | 7 | Haupt | BOTH | je nach Modul |
| m-planspiel | Unternehmensplanspiel | 3 | 7 | Haupt | BOTH | Teilnahme + Bericht |

Kontrollsumme: je Fachsemester 30 ECTS, gesamt 210.
Ab Fachsemester 5 sind im Beispiel alle Module jedes Semester belegbar. Das hält die Prognose übersichtlich; die Logik (KONZEPT §10.5) verarbeitet aber auch echte WS-/SS-Module korrekt.

### Modulsteckbriefe (für Moduldetail und Assistent)

| ID | Inhalt (1–2 Sätze) | Lehrende:r (fiktiv) |
|---|---|---|
| m-stat | Beschreibende und schließende Statistik: Verteilungen, Schätzen, Testen, Regression – mit Übungen in R. | Prof. Dr. Miriam Keller |
| m-db | Relationales Modell, ER-Modellierung, SQL, Normalisierung und Transaktionen. | Prof. Dr. Jonas Albrecht |
| m-se1 | Vorgehensmodelle, Anforderungen, UML-Modellierung, Entwurf und Test in einem Teamprojekt. | Prof. Dr. Sabine Wolter |
| m-gpm | Geschäftsprozesse mit BPMN modellieren, analysieren und verbessern. | Prof. Dr. Erik Hansen |
| m-mkt | Marktforschung, Marketing-Mix und digitale Kanäle anhand von Fallstudien. | Prof. Dr. Lea Brenner |
| m-prog2 | Objektorientierte Programmierung in Java: Vererbung, Collections, Ausnahmen, Unit-Tests. | Prof. Dr. Thomas Reiter |
| m-recht | Grundlagen von BGB und HGB: Vertragsrecht, Kaufrecht, Handelsgeschäfte. | Prof. Dr. Anna Lindner |

---

## 3 Studierender (Persona, fiktiv)

| Feld | Wert |
|---|---|
| Name | Niklas Brandt |
| Matrikelnummer | 3012458 |
| Studienbeginn | WS 2025/26 |
| Aktuelles Fachsemester | 3 (WS 2026/27) |
| Nebenjob | 15 Std./Woche |
| Ziel | Abschluss in Regelstudienzeit |
| Hinweis-Stil (Standard) | direkt |
| Hochschul-Mail | niklas.brandt@stud.hochschule.example |

---

## 4 Prüfungen (Kanal POS)

| ID | Modul | Semester | Termin | Abmeldung bis | Status | Note | Versuch |
|---|---|---|---|---|---|---|---|
| e-gwi-ws25 | m-gwi | WS 2025/26 | 03.02.2026 | – | bestanden | 2,3 | 1 |
| e-prog1-ws25 | m-prog1 | WS 2025/26 | 05.02.2026 | – | bestanden | 1,7 | 1 |
| e-mathe1-ws25 | m-mathe1 | WS 2025/26 | 09.02.2026 | – | bestanden | 3,0 | 1 |
| e-bwl-ws25 | m-bwl | WS 2025/26 | 11.02.2026 | – | bestanden | 2,0 | 1 |
| e-rewe-ws25 | m-rewe | WS 2025/26 | 13.02.2026 | – | bestanden | 2,7 | 1 |
| e-prog2-ss26 | m-prog2 | SS 2026 | 14.07.2026 | 13.07.2026, 23:59 | abgemeldet | – | – |
| e-mathe2-ss26 | m-mathe2 | SS 2026 | 16.07.2026 | – | bestanden | 3,3 | 1 |
| e-bsrn-ss26 | m-bsrn | SS 2026 | 20.07.2026 | – | bestanden | 2,0 | 1 |
| e-klr-ss26 | m-klr | SS 2026 | 22.07.2026 | – | bestanden | 2,3 | 1 |
| e-recht-ss26 | m-recht | SS 2026 | 24.07.2026 | – | nicht bestanden | 5,0 | 1 |
| e-stat-ws26 | m-stat | WS 2026/27 | Mi, 27.01.2027, 10:30, Raum A 210 | Di, 26.01.2027, 23:59 | angemeldet | – | 1 |
| e-db-ws26 | m-db | WS 2026/27 | Fr, 29.01.2027, 08:30, Raum B 104 | Do, 28.01.2027, 23:59 | angemeldet | – | 1 |
| e-se1-ws26 | m-se1 | WS 2026/27 | Di, 02.02.2027, 10:30, Raum A 210 | Mo, 01.02.2027, 23:59 | angemeldet | – | 1 |
| e-gpm-ws26 | m-gpm | WS 2026/27 | Do, 04.02.2027, 13:30, Raum C 012 | Mi, 03.02.2027, 23:59 | angemeldet | – | 1 |
| e-mkt-ws26 | m-mkt | WS 2026/27 | Mo, 08.02.2027, 10:30, Raum B 104 | So, 07.02.2027, 23:59 | angemeldet | – | 1 |

Kontrolle: 8 bestandene Module × 6 ECTS = **48 ECTS**; Notenschnitt **2,4** (KONZEPT §10.4).

### Moodle-Fortschritt (aktuelles Semester)

| Modul | Fortschritt | Zusatz |
|---|---|---|
| Statistik | Übungsblätter 5/12 | letzte Aktivität vor 16 Tagen |
| Datenbanken | Übungsblätter 11/12 | Probeklausur verfügbar |
| Software Engineering 1 | Projektbericht abgegeben | Feedback online |
| Geschäftsprozessmanagement | Übungen 9/10 | – |
| Marketing | Fallstudien 4/6 | Fallstudie 5 bis 31.01. |

---

## 5 Fristen

| ID | Titel | Fällig | Typ | Kanal | Bezug |
|---|---|---|---|---|---|
| d-stat-abm | Abmeldung Statistik | Di, 26.01.2027, 23:59 | Abmeldung | POS | e-stat-ws26 → Folgen-Check |
| d-db-abm | Abmeldung Datenbanken | Do, 28.01.2027, 23:59 | Abmeldung | POS | e-db-ws26 |
| d-mkt-fs5 | Abgabe Fallstudie 5 Marketing | So, 31.01.2027, 23:59 | Abgabe | Moodle | m-mkt |
| d-se1-abm | Abmeldung Software Engineering 1 | Mo, 01.02.2027, 23:59 | Abmeldung | POS | e-se1-ws26 |
| d-gpm-abm | Abmeldung Geschäftsprozessmanagement | Mi, 03.02.2027, 23:59 | Abmeldung | POS | e-gpm-ws26 |
| d-mkt-abm | Abmeldung Marketing | So, 07.02.2027, 23:59 | Abmeldung | POS | e-mkt-ws26 |
| d-praxis-info | Infoveranstaltung Praxissemester WS 2027/28 | Mi, 10.02.2027, 14:00 | Termin | Mail | Meilenstein |
| d-rueck | Rückmeldung zum SS 2027 | Mo, 15.02.2027 | Rückmeldung | Website | – |
| d-pruef-ss27 | Prüfungsanmeldung SS 2027 | 10.05.–24.05.2027 | Anmeldung | POS | – |
| d-praxis-antrag | Antrag auf Zulassung zum Praxissemester WS 2027/28 | Fr, 14.05.2027 | Antrag | Website | Meilenstein |

---

## 6 Postfach

Relevanz „hoch“ = betrifft eine Prüfung oder Frist in den nächsten 7 Tagen (ab `DEMO_NOW`) oder einen Meilenstein. Im Prototyp ist die Relevanz als Datenfeld gesetzt; die Regel dient der Begründung im UI („Wichtig, weil: Prüfung am Mi“).

| ID | Kanal | Absender/Kurs | Betreff | Vorschau | Empfangen | Relevanz | Modul | gelesen |
|---|---|---|---|---|---|---|---|---|
| i-01 | Moodle | Statistik | Übungsblatt 12 und Lösungen zu Blatt 10 online | Die Lösungen zu Blatt 10 und das letzte Übungsblatt stehen bereit. | Mo, 25.01.2027, 16:12 | hoch | m-stat | nein |
| i-02 | Mail | Prüfungsamt | Raumänderung: Klausur Statistik am 27.01. | Die Klausur findet in Raum A 210 statt (bisher B 104). | Fr, 22.01.2027, 14:05 | hoch | m-stat | nein |
| i-03 | Mail | Fachschaft WI | Tutorium zur Klausurvorbereitung Statistik | Am Di, 26.01., 17 Uhr rechnen wir in Raum A 104 alte Klausuren durch. | Fr, 22.01.2027, 18:40 | hoch | m-stat | ja |
| i-04 | Mail | Praktikantenamt | Infoveranstaltung Praxissemester WS 2027/28 | Am Mi, 10.02., 14 Uhr informieren wir über Zulassung, Stellensuche und Fristen. | Fr, 22.01.2027, 09:30 | hoch | – | nein |
| i-05 | Moodle | Datenbanken | Probeklausur hochgeladen | Die Probeklausur mit Musterlösung findet ihr im Abschnitt Prüfungsvorbereitung. | Sa, 23.01.2027, 11:20 | hoch | m-db | ja |
| i-06 | Moodle | Software Engineering 1 | Feedback zu eurem Projekt ist online | Das Feedback zum Projektbericht ist in der Bewertung sichtbar. | Do, 21.01.2027, 15:00 | normal | m-se1 | ja |
| i-07 | Website | TH-News | Rückmeldung zum Sommersemester 2027 | Die Rückmeldung ist vom 18.01. bis 15.02.2027 möglich. | Mi, 20.01.2027, 08:00 | normal | – | ja |
| i-08 | Mail | Studiendekanat | Wahlpflichtmodule SS 2027: Vorstellung und Einschreibung | Die Module werden am 03.02. vorgestellt; die Einschreibung beginnt am 15.03. | Di, 19.01.2027, 12:45 | normal | – | nein |
| i-09 | Moodle | Marketing | Fallstudie 5: Abgabe bis 31.01. | Bitte ladet eure Ausarbeitung als PDF hoch. | Mo, 18.01.2027, 09:10 | hoch | m-mkt | ja |
| i-10 | Website | Bibliothek | Verlängerte Öffnungszeiten in der Prüfungsphase | Vom 25.01. bis 12.02. ist die Bibliothek bis 22 Uhr geöffnet. | Mo, 18.01.2027, 07:30 | normal | – | ja |
| i-11 | POS | Prüfungsverwaltung | Prüfungsanmeldung WS 2026/27 bestätigt | Du bist für 5 Prüfungen angemeldet. | Di, 12.01.2027, 13:02 | normal | – | ja |
| i-12 | Website | Studierendenwerk | Mensa: geänderte Öffnungszeiten | In der vorlesungsfreien Zeit öffnet die Mensa um 11:30 Uhr. | Fr, 15.01.2027, 10:00 | normal | – | ja |

**Volltexte der wichtigsten Einträge** (übrige: Vorschau + 1–2 sachliche Sätze im selben Stil)
- **i-02:** „Liebe Studierende, die Klausur Statistik am Mittwoch, 27.01.2027, 10:30 Uhr findet in Raum A 210 statt (bisher B 104). Bitte seid 15 Minuten vorher da und bringt euren Studierendenausweis mit. Viele Grüße, Ihr Prüfungsamt“
- **i-03:** „Hi zusammen, am Dienstag, 26.01., um 17 Uhr rechnen wir in Raum A 104 die Klausuren der letzten zwei Jahre durch. Eine Anmeldung ist nicht nötig – bringt Taschenrechner und Formelsammlung mit. Eure Fachschaft WI“
- **i-04:** „Liebe Studierende des 3. Semesters, wer das Praxissemester im WS 2027/28 absolvieren möchte, sollte zur Infoveranstaltung am Mittwoch, 10.02.2027, 14 Uhr kommen. Wir erklären Zulassungsvoraussetzungen, Stellensuche und Fristen. Ihr Praktikantenamt“
- **i-01:** „Die Lösungen zu Übungsblatt 10 und das letzte Übungsblatt 12 sind online. Fragen zur Klausurvorbereitung bitte ins Forum. Viel Erfolg! Miriam Keller“

---

## 7 Regeln und Quellen

Abschnitt nur eintragen, wenn geprüft. Ungeprüft zeigt das UI „Beispiel“ und nur den Dokumentnamen.

| ID | Kurztext im UI | Quelle | Abschnitt | geprüft | Zuständig |
|---|---|---|---|---|---|
| DR-1 | Zu deinen ECTS zählen nur bestandene Prüfungen. | SPO Wirtschaftsinformatik | | nein | o-pa |
| DR-2 | Der Regelverlauf sieht 30 ECTS pro Semester vor. | Studienverlaufsplan Wirtschaftsinformatik | | nein | o-sd |
| DR-4 | Statistik wird nur im Wintersemester angeboten. | Modulhandbuch Wirtschaftsinformatik, Modul Statistik | | nein | o-sd |
| DR-5 | Von einer angemeldeten Prüfung kannst du dich bis zum Vortag, 23:59 Uhr, ohne Angabe von Gründen abmelden. Die Abmeldung zählt nicht als Versuch. | SPO Wirtschaftsinformatik | | nein | o-pa |
| DR-6 | Zum Praxissemester wirst du zugelassen, wenn alle Module des Grundstudiums bestanden sind. | SPO Wirtschaftsinformatik | | nein | o-prakt |
| DR-7 | Prüfungen des Hauptstudiums darfst du nur ablegen, wenn höchstens drei Prüfungen des Grundstudiums offen sind. | SPO Wirtschaftsinformatik (Hinweis aus Interview I1) | | nein | o-pa |
| DR-8 | Jede Prüfung kannst du höchstens dreimal ablegen. | SPO Wirtschaftsinformatik | | nein | o-pa |
| DR-9 | Dein Notenschnitt ist der nach ECTS gewichtete Durchschnitt; berücksichtigt wird nur die erste Nachkommastelle. | SPO Wirtschaftsinformatik | | nein | o-pa |

DR-3 und DR-10 sind Gestaltungsregeln von StudiCompass, keine SPO-Regeln (Quelle: „StudiCompass – Berechnungsregel“).

---

## 8 Zuständige Stellen

| ID | Name | Kontakt | Sprechzeiten |
|---|---|---|---|
| o-pa | Prüfungsamt | pruefungsamt@hochschule.example | Mo–Do 9–12 Uhr |
| o-prakt | Praktikantenamt | praktikantenamt@hochschule.example | Di und Do 10–12 Uhr |
| o-sb | Studienberatung | studienberatung@hochschule.example | nach Vereinbarung |
| o-sd | Studiendekanat Wirtschaftsinformatik | studiendekanat-wi@hochschule.example | Mi 13–15 Uhr |

---

## 9 Benachrichtigungen (je Hinweis-Stil)

| ID | Typ | Ziel | Sachlich | Direkt |
|---|---|---|---|---|
| n-01 | Entscheidung | `/entscheidung/e-stat-ws26` | Die Abmeldefrist für Statistik endet morgen um 23:59 Uhr. Statistik wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben. | Morgen um 23:59 ist Schluss. Meldest du dich von Statistik ab, gibt es das Modul erst im nächsten Winter – und dein Praxissemester rutscht voraussichtlich ein Semester nach hinten. |
| n-02 | Postfach | `/postfach?eintrag=i-02` | Raumänderung: Die Klausur Statistik findet in Raum A 210 statt. | Neuer Raum: Statistik schreibst du in A 210, nicht in B 104. |
| n-03 | Meilenstein | `/verlauf` | Für das Praxissemester im WS 2027/28 fehlen dir noch 7 Module des Grundstudiums; 5 davon sind in diesem Semester angemeldet. | Praxissemester im Winter? Dann müssen Programmieren 2 und Wirtschaftsprivatrecht im Sommer klappen – plus alles aus diesem Semester. |
| n-04 | Frist | `/fristen` | Die Rückmeldung zum SS 2027 ist bis 15.02. möglich. | Rückmeldung bis 15.02. nicht vergessen – dauert zwei Minuten. |

### Hinweise im Folgen-Check (formuliert von Claude Code in P3-03, von Lucas am 27.10.2026 freigegeben)

Der Folgen-Check zeigt oben einen Hinweis im gewählten Stil. Statistik übernimmt den Text von n-01. Prüfungen ohne Sonderregel (Angebot jedes Semester) bekommen bewusst keinen Alarm (KONZEPT §1, Szenario D).

| Prüfung | Sachlich | Direkt |
|---|---|---|
| e-stat-ws26 | wie n-01 | wie n-01 |
| e-db-ws26 | Die Abmeldefrist für Datenbanken endet am Donnerstag um 23:59 Uhr. Datenbanken wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben. | Bis Donnerstag, 23:59 kannst du dich noch abmelden. Tust du es, gibt es Datenbanken erst im nächsten Winter – und dein Praxissemester rutscht voraussichtlich ein Semester nach hinten. |
| e-se1-ws26 | Die Abmeldefrist für Software Engineering 1 endet am Montag, 01.02., um 23:59 Uhr. Das Modul wird nur im Wintersemester angeboten; eine Abmeldung kann den Beginn deines Praxissemesters verschieben. | Bis Montag, 23:59 hast du Zeit. Meldest du dich von Software Engineering 1 ab, kommt das Modul erst im nächsten Winter wieder – und dein Praxissemester rutscht voraussichtlich mit. |
| e-gpm-ws26 | Geschäftsprozessmanagement wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027. | Geschäftsprozessmanagement gibt es jedes Semester – eine Abmeldung kostet dich keinen Meilenstein, macht dein SS 2027 aber voller. |
| e-mkt-ws26 | Marketing wird jedes Semester angeboten. Eine Abmeldung verschiebt keinen Meilenstein, erhöht aber deine Belastung im SS 2027. | Marketing gibt es jedes Semester – eine Abmeldung kostet dich keinen Meilenstein, macht dein SS 2027 aber voller. |

---

## 10 Assistent – Antwortkatalog

Aufbau jeder Antwort: Kurzantwort · „Für dich heißt das“ (Resolver) · Details · Quellen · Zuständig · Aktionen · Anschlussfragen.
Die ersten sechs Einträge sind die Vorschlagsfragen im leeren Zustand.

### A-01 Abmeldefrist
- **Vorschlagsfrage:** Bis wann kann ich mich von einer Prüfung abmelden?
- **Schlüsselwörter:** abmelden, abmeldung, abmeldefrist, prüfung absagen, nicht antreten, bis wann
- **Kurzantwort:** **Bis zum Vortag der Prüfung um 23:59 Uhr** – ohne Angabe von Gründen, im POS.
- **Für dich (Resolver `nextWithdrawalDeadline`):** Für Statistik heißt das: bis morgen, Di 26.01., 23:59 Uhr.
- **Details:** Eine Abmeldung zählt nicht als Prüfungsversuch. Nach Ablauf der Frist ist ein Rücktritt nur noch aus wichtigem Grund möglich, zum Beispiel mit ärztlichem Attest.
- **Quellen:** DR-5 · **Zuständig:** o-pa
- **Aktion:** Folgen-Check für Statistik öffnen · **Anschluss:** A-02, A-04

### A-02 Statistik schieben
- **Vorschlagsfrage:** Was passiert, wenn ich Statistik schiebe?
- **Schlüsselwörter:** statistik + schieben, verschieben, abmelden, später schreiben, nicht schreiben
- **Kurzantwort:** **Statistik gibt es nur im Wintersemester.** Meldest du dich ab, ist der nächste Termin im WS 2027/28 – dann ist dein Grundstudium nicht rechtzeitig vor dem Praxissemester abgeschlossen.
- **Für dich (Resolver `decisionSummary:e-stat-ws26`):** Voraussichtlich verschiebt sich dein Praxissemester auf das SS 2028 und dein Abschluss auf das SS 2029.
- **Quellen:** DR-4, DR-6 · **Zuständig:** o-pa, o-prakt
- **Aktion (primär):** Folgen-Check öffnen · **Anschluss:** A-03, A-01

### A-03 Zulassung Praxissemester
- **Vorschlagsfrage:** Was brauche ich für die Zulassung zum Praxissemester?
- **Schlüsselwörter:** praxissemester, praktisches studiensemester, praktikum, zulassung, voraussetzung
- **Kurzantwort:** **Alle Module des Grundstudiums (Fachsemester 1–3) müssen bestanden sein**, bevor das Praxissemester beginnt.
- **Für dich (Resolver `openFoundationModules`):** Offen sind noch Programmieren 2, Wirtschaftsprivatrecht und die fünf Module dieses Semesters.
- **Details:** Den Antrag stellst du beim Praktikantenamt. Frist für das WS 2027/28: Fr, 14.05.2027.
- **Quellen:** DR-6 · **Zuständig:** o-prakt
- **Anschluss:** A-02, A-05

### A-04 Prüfungsversuche
- **Vorschlagsfrage:** Wie viele Versuche habe ich für eine Prüfung?
- **Schlüsselwörter:** versuch, versuche, wiederholen, wiederholung, durchgefallen, nicht bestanden
- **Kurzantwort:** **Jede Prüfung kannst du höchstens dreimal ablegen.** Eine Abmeldung zählt nicht als Versuch.
- **Für dich (Resolver `attemptsOverview`):** Wirtschaftsprivatrecht: Versuch 1 nicht bestanden – nächster Versuch im SS 2027 (Versuch 2 von 3).
- **Quellen:** DR-8 · **Zuständig:** o-pa
- **Anschluss:** A-01, A-06

### A-05 Hauptstudium mit offenen Prüfungen
- **Vorschlagsfrage:** Darf ich ins Hauptstudium, wenn noch Prüfungen aus dem Grundstudium offen sind?
- **Schlüsselwörter:** hauptstudium, grundstudium, offene prüfungen, vorziehen
- **Kurzantwort:** **Ja, solange höchstens drei Prüfungen des Grundstudiums offen sind.**
- **Für dich (Resolver `openFoundationAfterTerm`):** Nach diesem Semester wären bei dir zwei offen – vorausgesetzt, du bestehst alle angemeldeten Prüfungen.
- **Quellen:** DR-7 · **Zuständig:** o-pa
- **Anschluss:** A-03

### A-06 ECTS-Stand
- **Vorschlagsfrage:** Wie viele ECTS fehlen mir noch?
- **Schlüsselwörter:** ects, credits, leistungspunkte, punkte, stand, fehlen
- **Kurzantwort (Resolver `progressSummary`):** **Du hast 48 von 210 ECTS.** Laut Regelverlauf wären nach zwei Semestern 60 vorgesehen – du liegst 12 ECTS zurück (Status: Knapp).
- **Quellen:** DR-1, DR-2 · **Aktion:** Studienverlauf öffnen
- **Anschluss:** A-03, A-07

### A-07 Notenschnitt
- **Frage:** Wie wird mein Notenschnitt berechnet?
- **Schlüsselwörter:** notenschnitt, durchschnitt, gesamtnote, schnitt
- **Kurzantwort:** **Als nach ECTS gewichteter Durchschnitt deiner bestandenen Module**; berücksichtigt wird nur die erste Nachkommastelle, es wird nicht gerundet.
- **Für dich (Resolver `gradeAverage`):** Dein aktueller Schnitt: 2,4 aus 8 Modulen (48 ECTS).
- **Quellen:** DR-9 · **Zuständig:** o-pa

### A-08 Angebot eines Moduls
- **Frage:** Wann wird Statistik angeboten?
- **Schlüsselwörter:** angeboten, angebot, wintersemester, sommersemester, wann + statistik
- **Kurzantwort:** **Statistik wird nur im Wintersemester angeboten.**
- **Für dich:** Wenn du dieses Semester nicht antrittst, ist der nächste Termin im WS 2027/28.
- **Quellen:** DR-4 · **Zuständig:** o-sd

### F-01 Fallback (Sonderfall)
- **Demo-Frage für die Präsentation:** Kann ich das Praxissemester im Ausland machen und Statistik trotzdem im Winter schreiben?
- **Antwort:** Dazu finde ich in SPO und Modulhandbuch keine eindeutige Regel. Das ist ein Sonderfall – verbindlich beantworten kann ihn das Praktikantenamt.
- **Zuständig:** o-prakt (in Kopie: o-pa)
- **Aktion:** Anfrage vorbereiten → Dialog mit kopierbarem Text:

> Betreff: Praxissemester im Ausland und Prüfung Statistik im selben Semester
>
> Guten Tag, ich studiere Wirtschaftsinformatik im 3. Fachsemester (Matrikelnummer 3012458). Ich plane mein Praxissemester im WS 2027/28 im Ausland und müsste Statistik im selben Semester schreiben. Ist das möglich, und welche Regeln gelten dafür?
>
> Viele Grüße
> Niklas Brandt
