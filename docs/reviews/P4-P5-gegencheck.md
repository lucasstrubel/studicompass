# Gegencheck P4/P5 – unabhängiges Review der Codex-Umsetzung

Urteil: Freigabe nach Fixes (alle Fixes umgesetzt)

Reviewer: Claude Code, 27.10.2026. Basis: `m3` bis `0b73eb4` (Phase-4-Umsetzung und agentenseitiger Teil von Phase 5 durch Codex, Eigenprüfung in [P4.md](P4.md) und [P5.md](P5.md)). Geprüft wurden alle neuen und geänderten Dateien in `src/` und `e2e/` sowie die Änderungen an KONZEPT, INHALTE und README. KONZEPT-Präzisierungen (§7 Kanaltrennung/Datenversion 3/Erststart, §11 Freitext-Zuordnung, `?module=`) hat Lucas am 27.10. bestätigt.

| # | Schwere | Datei:Zeile | Befund | Vorschlag |
|---|---------|-------------|--------|-----------|
| F1 | Minor | src/features/deadlines/DeadlinesPage.tsx:101, src/lib/ics.ts | Quellen und ICS-Beschreibung zeigten rohe Kanalschlüssel („WEBSITE“, „Kanal: website“) statt der UI-Namen. | `CHANNEL_LABELS` verwenden. |
| F2 | Minor | src/lib/ics.ts | Eine Frist mit Uhrzeit und `startsAt` wurde nur mit DTSTART = Beginn exportiert, die Fälligkeit fehlte (latent, keine solche Frist in den Demodaten). | DTSTART = Beginn, DTEND = Fälligkeit; Test ergänzt. |
| F3 | Minor | src/store/selectors.ts (`notifications`) | Simulationstexte für n-01/n-03 waren fest im Selektor, ignorierten den Hinweis-Stil, standen nicht in INHALTE; n-03 wechselte auch nach der Marketing-Abmeldung, die keine Meilensteine verschiebt. | Texte je Hinweis-Stil als `simulatedText` in die Daten und INHALTE §9; n-03 nur bei tatsächlicher Verschiebung von Praxissemester oder Abschluss gegenüber dem POS-Stand. |
| F4 | Minor | src/features/notifications/NotificationsButton.tsx | Ersatzquelle ohne Regelwerk war fest am Typ verdrahtet („Mail – Raumänderung Statistik“ für jede Postfach-Benachrichtigung). | Siehe „Abgelehnt“: nach Nachprüfung belassen. |
| F5 | Minor | src/features/inbox/InboxPage.tsx | Während des Ladens stand die Liste leer ohne Ladezustand; fehlende Kanaldaten waren nicht als unvollständig erkennbar (gleiches Muster wie P5-F01). | Skeleton „Nachrichten werden geladen“ und Hinweis „Das Postfach ist unvollständig“; Leerzustand nur bei vollständigen Daten. Test ergänzt. |
| F6 | Minor | src/components/common/ChannelStatus.tsx | Getrennter Kanal ohne Daten zeigte zwei Meldungen (Kopfzeile und Leerzustand). | Kopfzeile nur, wenn Daten vorhanden sind. |
| F7 | Nit | src/store/assistant-selectors.ts | A-08 war per ID fest verdrahtet und wich vom Text in INHALTE A-08 ab („Nächstes Angebot nach diesem Semester …“). | Sonderfall entfernt; es gilt der Text aus INHALTE. |
| F8 | Nit | src/store/demo-store.ts, src/features/inbox/InboxPage.tsx, src/domain/assistant-matching.ts | Ternärkette zur Kanalprüfung, Key-Narrowing per Hand, Schlüsselwörter doppelt normalisiert; Kanalliste siebenfach kopiert. | `CHANNELS` und `isChannel()` in `src/services/types.ts`; Schlüsselwörter einmal normalisieren. |
| F9 | Nit | src/features/settings/SettingsPage.tsx, src/features/onboarding/OnboardingPage.tsx | `useDemoStore((state) => state)` abonniert den ganzen Store. | Siehe „Abgelehnt“. |

Positiv:
- Domain-Spezifikationstests und Testorakel unverändert; neue Domänenfunktion (`assistant-matching`) rein und getestet.
- Migration Datenversion 2 → 3 additiv und mit Validierung getestet; keine Hex-Werte, keine neuen Abhängigkeiten, keine direkten Datenimporte in der UI, `DEMO_NOW` durchgängig.
- Onboarding, Assistent, Postfach und Einstellungen entsprechen KONZEPT S0–S9; Simulationen sind als solche erkennbar, Originalsysteme nur als neutraler Hinweis.

## Umgesetzt

F1, F2, F3, F5, F6, F7, F8. Neue Texte für n-01/n-03 nach der Simulation stehen in INHALTE §9 und brauchen Lucas' Freigabe mit dem PR.

## Abgelehnt mit Begründung

- **F4:** Die Ersatzquelle greift nur, wenn das Regelwerk fehlt bzw. eine Benachrichtigung keine Regel hat; in den Demodaten betrifft das genau n-02 (Raumänderung Statistik) und n-04 (Rückmeldung) – die Texte sind dafür zutreffend. Eine Ableitung aus dem Ziel wäre Aufwand ohne sichtbare Wirkung im Prototyp. Bei neuen Benachrichtigungen ohne Regel ist die Stelle anzupassen.
- **F9:** Beide Seiten lesen fast alle Store-Felder einschließlich `resources`; gezielte Selektoren würden kaum Re-Renders sparen.
- `?module=` statt `?modul=`: weicht von den deutschen Parametern (`frage`, `eintrag`) ab, ist aber von Lucas in KONZEPT bestätigt und bleibt.

## Prüfnachweise

- `npm run check`: grün, 261 Tests in 36 Dateien, Typprüfung, Lint, Build (bekannte Chunk-Warnung).
- `npm run e2e`: 25 bestanden, 1 bewusst übersprungen (mobiler Tastatur-Hero-Test).
- `npm run screens`: 80 bestanden; geändert nur Fristen (4 Ansichten, Quellname) – Sichtprüfung 1440 dunkel und Postfach 390 hell.
- `git diff --check` sauber.

## Offen

- Tatsächlicher ICS-Import in eine Kalender-App, Screenreader, reale Geräte (aus P4).
- Nutzertests P5-02, Auswertung P5-03/05 (Team).

Offene Fragen an Lucas: keine. Die zwei neuen Hinweistexte (INHALTE §9) hat Lucas am 27.10.2026 freigegeben.
