# ADR 0004: Befunde aus dem Moodle-Spike

Status: angenommen (13.11.2026)

## Kontext

[ADR 0003](0003-kein-eigenes-backend.md) ließ offen, ob der Browser Moodle direkt aufrufen kann und was ein Zugriffsschlüssel für Studierende erreicht. Geprüft wurde gegen die Sandbox unter [`infra/moodle/`](../../infra/moodle/): Moodle 4.5.16 (LTS), Dienst „Moodle mobile web service“, Zugriffsschlüssel des Studenten Niklas.

## Befunde

### Zugriff aus dem Browser

- `webservice/rest/server.php`, `login/token.php`, `webservice/upload.php` und `webservice/pluginfile.php` antworten mit `Access-Control-Allow-Origin: *`. Aufrufe sind einfache POST-Anfragen ohne eigene Header, also ohne Preflight. **Ein eigener Server ist nicht nötig.**
- Der Zugriffsschlüssel steht in Moodle im Nutzerprofil unter „Sicherheitsschlüssel“. Die App braucht nur die Adresse des Moodle und diesen Schlüssel, kein Passwort.
- Nicht geprüft: eine über HTTPS ausgelieferte App, die ein Moodle unter `http://localhost` aufruft. Das Verhalten hängt vom Browser ab. Im Modus Live läuft die App deshalb zunächst lokal.

### Lesen

Alle Funktionen sind mit dem Schlüssel eines Studenten erreichbar.

| Funktion                                                     | liefert                                                                   | wird zu                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------- |
| `core_webservice_get_site_info`                              | Name der Instanz, Nutzer-ID, Name, Version                                | Verbindungsprüfung, Anzeige „verbunden als“ |
| `core_enrol_get_users_courses`                               | Kurse mit `idnumber`, Titel und Fortschritt in Prozent                    | Zuordnung Kurs → Modul über `idnumber`      |
| `core_course_get_contents`                                   | Abschnitte, Aktivitäten, Dateien mit Name, Größe, Zeitstempel und Adresse | Kursinhalt je Modul, Vergleichsstand        |
| `core_course_get_updates_since`                              | geänderte Aktivitäten seit einem Zeitpunkt, mit Art der Änderung          | „Neu in Moodle“                             |
| `mod_assign_get_assignments`                                 | Aufgaben mit Öffnung, Frist und Höchstpunktzahl                           | Fristen (Kanal Moodle), Vorschläge für PVL  |
| `mod_assign_get_submission_status`                           | Abgabestatus und Bewertungsstatus je Aufgabe                              | Status einer verknüpften PVL                |
| `core_calendar_get_action_events_by_timesort`                | anstehende Termine mit Kurs, Aktivität und Adresse                        | Fristen, Kalender                           |
| `core_completion_get_activities_completion_status`           | Abschluss je Aktivität                                                    | `MoodleProgress` („Übungsblätter 5/12“)     |
| `gradereport_user_get_grade_items`                           | Bewertungen je Aktivität                                                  | Bewertung einer PVL                         |
| `mod_forum_get_forums_by_courses`, `…_get_forum_discussions` | Ankündigungen mit Titel, Text, Autorin und Zeitpunkt                      | Postfach (Kanal Moodle)                     |
| `message_popup_get_popup_notifications`                      | Benachrichtigungen von Moodle                                             | Glocke                                      |

Dateien lassen sich über `webservice/pluginfile.php/…?token=…` laden.

### Änderungen erkennen

Legt die Lehrperson eine Datei in den Kurs, meldet `core_course_get_updates_since` genau diese Aktivität mit der Art `contentfiles`; `core_course_get_contents` enthält sie mit Namen und Zeitstempel. Neue Ankündigungen erscheinen als Art `discussions`. Die App merkt sich je Kurs den Zeitpunkt des letzten Abgleichs und fragt nur die Änderungen ab.

### Schreiben

- **Nutzereinstellungen: nein.** `core_user_set_user_preferences` lehnt frei benannte Einstellungen ab (`nopermission`); Moodle erlaubt nur Einstellungen, die es selbst kennt.
- **Private Dateien: ja.** Eine JSON-Datei lässt sich über `webservice/upload.php` hochladen, mit `core_user_add_user_private_files` in die privaten Dateien des Nutzers übernehmen und über `pluginfile.php` wieder lesen.
- **Kalender: ja.** `core_calendar_create_calendar_events` legt eigene Termine des Nutzers an.

## Entscheidung

- ADR 0003 gilt ohne Einschränkung: direkter Aufruf aus dem Browser, kein eigener Server.
- Eigene Daten der App werden in Phase 5 als eine JSON-Datei in den privaten Dateien des Nutzers gespeichert, nicht in den Nutzereinstellungen. Umgesetzt als ausdrückliches Sichern und Laden statt eines stillen Abgleichs: ohne Konfliktregel, und keine Seite wird ungefragt überschrieben.
- Kurse werden über die `idnumber` den Modulen zugeordnet. Fehlt sie oder passt sie nicht, ordnet der Nutzer den Kurs von Hand zu.
- Alle Funktionen der Phasen 3 und 4 sind machbar.

## Folgen

- Die Texte von Moodle (Namen von Terminen, Benachrichtigungen) kommen in der Sprache der Instanz. Die App bildet eigene deutsche Texte aus den Daten (Aktivität, Frist) und übernimmt nur Titel, die Lehrende vergeben haben.
- Moodle liefert Zeitpunkte als Unix-Sekunden; die Zuordnung rechnet sie in die Formate des Fachmodells um.
- Ein Hochschul-Moodle kann den Dienst abgeschaltet oder Funktionen entzogen haben. Die App prüft beim Verbinden mit `core_webservice_get_site_info`, welche Funktionen verfügbar sind, und zeigt fehlende Bereiche als nicht verfügbar an.
