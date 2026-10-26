# P1-07 – Designrevision und Prüfung

Stand: 26.10.2026 · Zweig: feat/P1-07-ui-design · direkt von Lucas beauftragte Umsetzung des freigegebenen Plans.

## Erledigt

- Referenz 1 bestimmt Rahmen, kompakte Karten, Linienillustrationen und rechte Spalte. Referenz 2 liefert ausschließlich die Warm-Ink-Palette. Bestehender Stack und Farbtokens bleiben erhalten.
- Toplinks ab 1280 px; alle Ziele im dunklen, 280 px breiten Hamburger-Overlay. Permanente Sidebar, mobile Tab-Leiste und Mehr-Sheet entfernt.
- Hover-Vorschau nach 150 ms, Schließen nach 250 ms außerhalb; Wechsel ins Menü bleibt möglich. Explizites Öffnen über Radix-Sheet mit Fokusführung. Einklappen über Hamburger, Schließen, Escape, Außenklick und Navigation unterstützt.
- Übersicht mit Studienstand, Jetzt wichtig, fünf illustrierten Modulkarten, Meilenstein und rechter Spalte. Studienstand und Jetzt wichtig stehen auf Desktop nebeneinander. Mobil: Studienstand → Jetzt wichtig → nächste Frist → Module → Meilenstein → übrige Inhalte.
- Isolierte typisierte Präsentations-Fixture aus INHALTE und KONZEPT; keine Services, Persistenz oder Domänenberechnung. Beispielkennzeichnung und Quellen vorhanden. Bestehende Routen, RouteHandle und useTheme bleiben erhalten.
- Konzept, Projektregeln, Roadmap und Komponentenübersicht angepasst.

## Geänderte Dateien

- Shell/Navigation: src/components/layout/AppShell.tsx, Topbar.tsx, NavigationMenu.tsx (neu), RightRail.tsx, navigation.ts, route-handle.ts. Sidebar.tsx, MobileTabBar.tsx und MoreSheet.tsx entfernt.
- Dashboard (neu): src/features/dashboard/DashboardPreviewPage.tsx, dashboard-preview.ts, ModuleIllustration.tsx.
- Gestaltung: src/components/ui/card.tsx, src/styles/globals.css, src/features/dev-ui/UiShowcasePage.tsx.
- Routing/Tests: src/app/router.tsx, router.test.tsx, App.test.tsx, src/components/layout/AppShell.test.tsx.
- Dokumentation: CLAUDE.md, docs/KONZEPT.md, docs/ROADMAP.md, dieser Prüfbericht und Screenshots unter docs/reviews/screenshots/P1-07/.

## Prüfergebnisse

- **npm run check: bestanden.** Typecheck, ESLint, 96 Tests in 9 Dateien und Produktions-Build grün.
- **git diff --check: bestanden.**
- Produktions-Build: nicht blockierender Vite-Hinweis auf ein JavaScript-Bündel über 500 kB (538,70 kB, gzip 169,90 kB). Keine neuen Abhängigkeiten.
- Isolierter Headless-Chrome-Test gegen den lokalen Vite-Server: 1440×900, 834×1112 und 390×844, jeweils hell/dunkel. Screenshots visuell geprüft; keine horizontalen Überläufe, ein h1, erwartete Navigation je Breakpoint.
- Browser: Hover öffnen, Wechsel vom Trigger ins Menü, verzögertes Schließen, Klick fixieren, Menübreite 280 px und unveränderte Inhaltsposition geprüft.
- Browser: Tastaturöffnung, Fokusfalle, Escape mit Fokusrückgabe, Außenklick und Schließen nach Routenwahl bestanden. Touchöffnung und Schließen über emulierte Touch-Eingaben bestanden. Reduced Motion: Animationsdauer 0,00001 s.
- Vitest prüft zusätzlich die 150/250-ms-Grenzen, abgebrochenes Hover-Öffnen, keine Hover-Vorschau bei Touch, aktiven Routenstatus, Skip-Link und Schließen bei externer Navigation.

## Screenshots

| Ansicht | Hell | Dunkel |
|---|---|---|
| Desktop 1440×900 | [Screenshot](screenshots/P1-07/1440-light.png) | [Screenshot](screenshots/P1-07/1440-dark.png) |
| Tablet 834×1112 | [Screenshot](screenshots/P1-07/834-light.png) | [Screenshot](screenshots/P1-07/834-dark.png) |
| Mobil 390×844 | [Screenshot](screenshots/P1-07/390-light.png) | [Screenshot](screenshots/P1-07/390-dark.png) |

[Desktop vollständig](screenshots/P1-07/1440-light-full.png) · [Tablet vollständig](screenshots/P1-07/834-light-full.png) · [Mobil vollständig](screenshots/P1-07/390-light-full.png) · [Hover-Menü](screenshots/P1-07/desktop-hover.png) · [Fixiertes Menü](screenshots/P1-07/desktop-pinned.png) · [Touch-Menü](screenshots/P1-07/mobile-menu.png)

## Offen und Grenzen

- Die Übersicht ist eine statische Designvorschau. Funktionales Dashboard, asynchrone Lade-/Leer-/Fehlerzustände und Berechnungen folgen in Phase 2/3. Andere Fachseiten bleiben wie bisher noch unbefüllt.
- Browserprüfung mit Chrome-Emulation, kein Nachweis auf realer iOS-/Android-Hardware oder in weiteren Browsern; kein Screenreader-Durchgang.
- Unabhängiges Review und gestalterische Abnahme durch Lucas stehen aus. Nicht committed, gepusht oder deployed.

## Nachtrag – Hell-/Dunkel-Schalter

- Geändert: Topbar.tsx (Sonne/Mond-Schalter neben der Glocke), router.test.tsx (Integrationstests), KONZEPT §7 und ROADMAP P1-07.
- Der Schalter verwendet useTheme().resolvedTheme und setTheme; die Auswahl wird über den bestehenden Theme-Speicher gemerkt. Vor der expliziten Auswahl bleibt das bisherige System-/Speicherverhalten erhalten.
- Semantik: role="switch", deutscher Name „Dunkelmodus“, aria-checked für den aktuellen Zustand, sichtbarer Fokus und Titel mit der nächsten Aktion.
- npm run check bestanden: Typecheck, Lint, 94 Tests, Produktions-Build. Bestehender nicht blockierender Bündelgrößenhinweis bleibt bestehen.
- Browserprüfung: Klick in beide Richtungen, Leertaste, gespeichertes Hell nach Neuladen trotz dunklem System, kein Überlauf und alle Kopfaktionen in einer Zeile bei 390 px. Sichtprüfung bei 1440×900 und 390×844 in beiden Themes bestanden.
- Aktuelle Screenshots: [Desktop hell](screenshots/P1-07/theme-toggle-1440-light.png), [Desktop dunkel](screenshots/P1-07/theme-toggle-1440-dark.png), [Mobil hell](screenshots/P1-07/theme-toggle-390-light.png), [Mobil dunkel](screenshots/P1-07/theme-toggle-390-dark.png).
- Offen bleiben unabhängiges Review und Tests auf realen Mobilgeräten; nicht committed oder deployed.

## Nachtrag – Kontrast und Warm-Ink-Farbpalette

- Geändert: globals.css und tokens.test.ts, AppShell.tsx, RightRail.tsx, DashboardPreviewPage.tsx, button.tsx sowie CLAUDE.md, KONZEPT §12.2 und ROADMAP P1-07.
- Cremefarbene Arbeitsfläche auf warmem neutralem Außenbereich, weiße Karten, deutlichere Rahmen und deckende neutrale rechte Spalte. Referenz 1 bleibt die Layoutgrundlage; Referenz 2 bestimmt die Farbwelt.
- Sekundärtext dunkler: 7,264:1 auf der Arbeitsfläche, 7,653:1 auf Weiß, 6,382:1 auf der neutralen Nebenfläche.
- Jetzt wichtig: originales Marken-Terrakotta mit Tinte als Textfarbe (5,627:1). Der lange farbige Text auf blasser Fläche entfällt. Dark Mode behält die weichere Akzentfläche. Statusfarben bleiben getrennt vom Markenakzent.
- Fortschrittsbalken verwenden den dunkleren Akzent (4,904:1 zum Track). Outline-Buttons erhalten sichtbare Konturen (4,200:1 auf Weiß, 3,502:1 auf der neutralen Fläche).
- Der Fokus auf der Terrakotta-Karte nutzt Tinte (5,627:1); Button-Transitionen schließen den Fokusring aus, sodass er sofort vollständig sichtbar ist.
- npm run check bestanden: Typecheck, Lint, 96 Tests und Build. Die bestehende Tokenprüfung wurde um Sekundärtext, interaktive Konturen, Fortschrittsbalken und Text auf Terrakotta ergänzt. Kein Absenken von Kontrastgrenzen; Konzeptwerte und dokumentierte Messwerte aktualisiert.
- Browserprüfung: 1440×900, 834×1112 und 390×844, jeweils hell/dunkel, ohne horizontalen Überlauf. Je Ansicht 90–94 gerenderte Textpaare gegen ihre zusammengesetzten Hintergrundflächen geprüft: keine Unterschreitung der AA-Schwellen; geringster Wert hell 5,196:1, dunkel 5,449:1. Dies ist ein gezielter Kontrastcheck der Übersicht, keine vollständige WCAG-Zertifizierung.
- Hoverprüfung der beiden Hauptaktionen: hell 12,451:1 / 14,652:1, dunkel 10,372:1 / 9,025:1. Tastaturfokus unmittelbar 2 px Tinte, ohne Einblendanimation. Sichtprüfung der Screenshots bestanden.
- Maßstab: [WCAG 2.2 – Textkontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) und [Kontrast von Bedienelementen](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- Aktuelle Screenshots: [Desktop hell](screenshots/P1-07/contrast-1440-light.png), [Desktop dunkel](screenshots/P1-07/contrast-1440-dark.png), [Tablet hell](screenshots/P1-07/contrast-834-light.png), [Tablet dunkel](screenshots/P1-07/contrast-834-dark.png), [Mobil hell](screenshots/P1-07/contrast-390-light.png), [Mobil dunkel](screenshots/P1-07/contrast-390-dark.png), [Desktop vollständig](screenshots/P1-07/contrast-1440-light-full.png), [Tastaturfokus](screenshots/P1-07/contrast-focus.png).
- Offen: unabhängiges Review, reale Mobilgeräte und Screenreader-Durchgang. Nicht committed oder deployed.
