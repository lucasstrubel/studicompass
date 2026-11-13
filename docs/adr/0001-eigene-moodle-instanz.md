# ADR 0001: Eigene Moodle-Instanz als Ziel der Anbindung

Status: angenommen (13.11.2026)

## Kontext

StudiCompass soll einen Kanal echt anbinden. Moodle bietet mit den Web Services eine dokumentierte REST-Schnittstelle. Zur Wahl stehen das Moodle der TH Mannheim und eine eigene Instanz mit Beispielkursen.

## Entscheidung

Die Anbindung wird gegen eine eigene Moodle-Instanz entwickelt und getestet. Sie läuft per Docker unter `infra/moodle/` und wird von einem Skript mit Kursen zu den UIB-Modulen des 3. Semesters, einer Lehrperson und dem Studenten Niklas gefüllt.

## Gründe

- **Zugang.** Am Hochschul-Moodle entscheidet die Hochschule, ob Web Services freigegeben sind und wie man einen Zugriffsschlüssel bekommt. In der eigenen Instanz ist beides einstellbar.
- **Vorführbarkeit.** Studierende dürfen in Moodle nur lesen. Um zu zeigen, dass ein Upload in StudiCompass ankommt, braucht es auch die Rolle der Lehrperson.
- **Testbarkeit.** GitHub Actions kann eine eigene Instanz als Container starten und dagegen testen. Am Hochschul-Moodle kann sich weder die CI noch ein Besucher des Repositorys anmelden.
- **Datenschutz.** Das Hochschul-Moodle enthält Daten echter Personen. Die eigene Instanz enthält nur erfundene.
- **Reproduzierbarkeit.** Das Skript erzeugt immer denselben Stand; Tests und Screenshots bleiben stabil.

## Folgen

- Die Schnittstelle ist in beiden Fällen dieselbe. Der Adapter kann später unverändert gegen ein Hochschul-Moodle laufen, wenn die Hochschule den Zugriff freigibt.
- Ein Versuch gegen das Hochschul-Moodle bleibt möglich, aber nur lokal mit dem eigenen Zugriffsschlüssel und nie in der öffentlichen Demo.
- Die Beispielkurse müssen gepflegt werden, wenn sich die Beispieldaten der App ändern.
