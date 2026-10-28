# P5-07 – Abgleich mit Apples Designprinzipien

Stand: 28.10.2026 · Grundlage: `main` = `2424191` (P5-06) · Prüfer: Claude Code (Agenteninspektion) · Auftrag: Lucas

## Auftrag und Methode

Lucas wollte wissen, ob die acht Designprinzipien aus Apples Human Interface Guidelines im Prototyp umgesetzt sind: Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight.

Geprüft wurden der Code, KONZEPT, die bisherigen Reviews und die Screenshots in `docs/screens/` (1440×900, 390×844). Jede Aussage unten nennt ihren Beleg.

Apples Prinzipien stammen nicht aus der Vorlesung. KONZEPT §13 bildet ISO 9241-110, Nielsen und Norman ab (VL05); diese decken sich weitgehend mit Apples Prinzipien.

Grenze: Das ist eine Inspektion, keine Beobachtung von Nutzer:innen. Ob Verständnis, Vertrauen und Auffindbarkeit tatsächlich gelingen, zeigen erst die Tests (P5-02).

## Ergebnis

**Größtenteils umgesetzt.**
- Purpose, Agency, Responsibility und Familiarity sind stark.
- Flexibility, Simplicity, Craft und Delight sind es teilweise.

Ein Befund hätte die Nutzertests beeinflusst und ist behoben (DP-1): Die Sprechblase am Assistent-Button verdeckte beim ersten Laden Inhalte und erschien nach jedem Neuladen wieder.

## Bewertung je Prinzip

| Prinzip | Stand | Belege (Auswahl) | Lücken |
|---|---|---|---|
| Purpose – etwas Sinnvolles machen | ✅ erfüllt | Forschung mit Evidenzstärke (KONZEPT §1), Persona, VPC-Traceability (§3), Hero-Flow (§9). Was StudiCompass abhebt: die Folgen einer Entscheidung mit Quelle sehen, bevor man entscheidet (Statistik vs. Marketing). Kein Nachbau des POS | – |
| Agency – selbstbestimmt handeln, Fehler beheben | ✅ weitgehend | Der Folgen-Check erzwingt nichts; „Ich trete an“ und „Abmeldung vornehmen“ sind gleich gewichtet (`DecisionPage.tsx`). Bestätigungsdialog mit „Zurück zum Vergleich“. Rückgängig im Toast (8 s) und dauerhaft auf Übersicht und Folgen-Check (`WithdrawalNotice.tsx`). Simulation verwerfen, Demo-Reset mit Rückfrage. Onboarding mit Zurück und Überspringen, Tour abbrechbar, Deep-Links ohne Zwangs-Onboarding | DP-1 (behoben), DP-6, DP-7 |
| Responsibility – im Interesse der Menschen handeln | ✅ erfüllt | Quelle an jeder Regelaussage, „Beispiel“ bei ungeprüften Regeln (`CitationList`). Antworten tragen „KI-Antwort · verbindlich ist die SPO · Antworten im Prototyp vorbereitet“. Ehrlicher Fallback; „Anfrage vorbereiten“ sendet nichts. Übergaben an Originalsysteme nur als Hinweis („Im echten Betrieb …“). Im Onboarding: „StudiCompass liest nur“, Speicherung nur lokal; im Menü: „Prototyp mit Demodaten“. Keine externen Requests, Schriften lokal, kein Tracking, keine Login-Felder. „Diese Angebote sind keine Empfehlung – die Entscheidung liegt bei dir.“ | – |
| Familiarity – auf Bekanntem aufbauen | ✅ weitgehend | Bekannte Dashboard-Muster (Topnavigation, Menü, Glocke, Profil, Karten). Radix-Bausteine verhalten sich wie gewohnt (Escape, Fokusfalle, Fokusrückgabe). Einheitliche Badges (Status immer mit Icon + Text + Farbe, Kanal) und Quellenlisten; Begriffe nach Glossar (Quelle ≠ Kanal). Rückmeldung über Skeletons, Sync-Stand, Toasts und „Antwort wird vorbereitet …“ | DP-5, DP-8 (Avatar behoben) |
| Flexibility – für alle und jede Situation | 🟡 teilweise | Kernflow per Tastatur (E2E), Skip-Link, Fokusführung, aria-Labels. Kontraste AA per Test, Reduced Motion. Typografie in rem, folgt also der Schriftgröße des Browsers. 360–1920 px ohne Überlauf; Hover-Menü auch per Klick, Touch und Tastatur | DP-2 (teilweise behoben), DP-3, DP-9 |
| Simplicity – klar und direkt | 🟡 teilweise | StudiCompass warnt nur, wenn eine Sonderregel greift; das beugt Hinweis-Müdigkeit vor (KONZEPT §1). Disziplin beim Umfang (Ideenparkplatz, Kürzungsliste). Studienstand und „Jetzt wichtig“ sind bei 1440×900 ohne Scrollen sichtbar (Q-1, gemessen in P5). Kurze Sätze, Fakten zuerst (§12.5) | DP-4, DP-5 |
| Craft – Sorgfalt im Detail | 🟡 teilweise | Design-Tokens mit Kontrasttests, Typo-Skala, `tabular-nums`, Bewegung 150–200 ms. 242 Unit-Tests, E2E-Tests und ein Screenshot-Skript. Zwei Designrevisionen (P1-07, P5-06), Codex-Review je Task | DP-1 (Screenshots, behoben), DP-3, DP-8, DP-9 |
| Delight – menschlich gestalten | 🟡 teilweise | Begrüßung nach Tageszeit mit Namen, „Hallo Niklas!“. Warme Palette mit Farbfamilie, eigene Linienillustrationen, wählbarer Hinweis-Stil („Direkt“: „Morgen um 23:59 ist Schluss.“) | DP-10 |

Bewusste Abweichungen ohne Befund:
- Kein Dark Mode. Lucas hat ihn für die Produktdemo gestrichen (P5-06, Ideenparkplatz).
- Das Demo-Datum steht nicht mehr in der Topbar (P5-06); die Testleitung nennt es (TESTPLAN).

## Befunde und Umgang

Schwere nach TESTPLAN: 0 kein Problem · 1 kosmetisch · 2 gering · 3 schwer · 4 kritisch. Die Nutzerhäufigkeit ist nicht erhoben.

| ID | Schwere | Prinzip | Befund | Beleg | Umgang |
|---|---|---|---|---|---|
| DP-1 | 2 | Agency („Stay out of the way“), Simplicity | Die Sprechblase verdeckte beim ersten Laden Inhalte: bei 390×844 „Studienverlauf ansehen“ und die Überschrift von „Jetzt wichtig“, bei 1440×900 den Postfach-Eintrag „Tutorium zur Klausurvorbereitung Statistik“ (eine Lösung von T4). Sie lag nur im Komponentenzustand und kam deshalb nach jedem Neuladen wieder, auch auf allen Screenshots für Folien. Der runde Button selbst liegt wie jeder schwebende Button über dem, was gerade darunter steht, bei 1440×900 anfangs über der Note 2,3; das Seitenende bleibt frei (P5-06) | `AssistantLauncher.tsx` (vorher `useState(true)`), frühere `docs/screens/uebersicht-390.png` | **Sprechblase behoben**; der Button bleibt (bewusstes Muster aus P5-06), im Nutzertest beobachten |
| DP-2 | 2 | Flexibility | „Warum?“-Schalter waren nur ca. 18 px hoch, genau in der Kernflow-Stufe „Interpretieren“. Standard-Buttons haben 36 px; Apple empfiehlt 44 pt | `ComparisonTable.tsx`, `ConsequenceItem.tsx`, `button.tsx` | **„Warum?“ behoben**; Button-Größen offen (Befundliste) |
| DP-3 | – | Craft („Test in real-world settings“), Flexibility | Noch nicht unter realen Bedingungen geprüft: Nutzertests, Screenreader, echte Geräte, Beamer-Auflösung | [P5.md](P5.md) „Offen“ | eingeplant: P5-02, P6-05 |
| DP-4 | 2 | Simplicity | Der Folgen-Check ist lang: 10 Folgen-Karten, 6 davon wiederholen Zeilen der Vergleichstabelle. Bei 390 px liegen etwa vier Bildschirmhöhen zwischen Vergleich und „Deine Entscheidung“ | `DecisionPage.tsx` („Was sich ändert“), `docs/screens/folgen-check-statistik-390.png` | Befundliste; in T2 Zeit und Scrollverhalten beobachten |
| DP-5 | 1 | Simplicity, Familiarity | Drei Einstiege in den Assistenten auf der Übersicht, die sich verschieden verhalten: Die Eingabe in der rechten Spalte wechselt die Seite, der Button öffnet ein Fenster | `DashboardRail.tsx` (`AssistantTeaser`) | Befundliste |
| DP-6 | 1 | Agency („Help people recover“) | Der Gelesen-Status lässt sich nicht zurücknehmen; „Alle als gelesen markieren“ hat kein Rückgängig | `demo-store.ts` (`markRead`), `NotificationsButton.tsx` | Befundliste; Idee im Ideenparkplatz |
| DP-7 | 2 | Agency | „Überspringen“ ab Schritt 2 des Onboardings setzt bereits gewählte Kanäle, Ziel, Nebenjob und Hinweis-Stil auf die Standardwerte zurück. KONZEPT §10.6 legt das so fest, für Nutzer:innen ist es aber überraschend | `OnboardingPage.tsx` (`finish`) | Befundliste (Konzeptfrage) |
| DP-8 | 1 | Craft, Familiarity | Der Avatar zeigte ein Personen-Icon statt der Initialen, die KONZEPT A-6 festlegt; der Code-Kommentar behauptete das Gegenteil. Der Browser-Tab zeigt kein Favicon | `Topbar.tsx`, `index.html` | **Avatar behoben**; Favicon im Ideenparkplatz |
| DP-9 | 1 | Flexibility, Craft | Umbruch nur von 360 bis 1920 px geprüft; WCAG 1.4.10 verlangt 320 px. Das Hauptbundle ist ca. 758 kB groß (Build-Warnung) | `e2e/phase4.e2e.ts`, Build-Ausgabe | Befundliste |
| DP-10 | – (Chance) | Delight | Das Gefühl, das StudiCompass auslösen soll, ist nirgends benannt; implizit lautet es „Ruhe und Kontrolle statt Alarm“ (§1, §12.1). Nach „Ich trete an“ kommt nur ein neutraler Toast, ohne „definierenden Moment“ | `DecisionPage.tsx` | Ideenparkplatz |

## Umgesetzt in P5-07

- **DP-1 Sprechblase:**
  - Sie erscheint einmal je Demo-Stand: beim ersten Aufruf nach dem Onboarding bzw. nach „Demo zurücksetzen“, also in jeder Testsitzung.
  - Sie verschwindet beim Schließen, beim Öffnen des Assistenten, beim ersten Scrollen (mehr als 40 px) oder beim ersten Seitenwechsel. Nach Neuladen kommt sie nicht wieder.
  - Die Schwelle verhindert, dass schon das Zurücksetzen der Scrollposition beim Seitenwechsel sie schließt.
  - Gespeichert wird das in der Einstellung `assistantHintSeen` (additiv, Datenversion bleibt 3).
  - Das Screenshot-Skript blendet die Sprechblase aus; nur die Ansicht `assistent-hinweis` zeigt sie. Vor jeder Aufnahme bewegt es die Maus aus dem Bild, damit keine Hover-Zustände auf den Folien landen.
- **DP-2 „Warum?“:** Ein unsichtbares Pseudo-Element vergrößert die Trefferfläche auf ca. 30 px Höhe, ohne das Layout zu verschieben. Ein E2E-Test klickt 4 px neben den Text, auf Desktop und mobil.
- **DP-8 Avatar:** Der Avatar zeigt die Initialen aus den POS-Daten („NB“) und während des Ladens das bisherige Icon.

Nachweise: `npm run check` (242 Tests), `npm run e2e`, neue Screenshots und das Codex-Review stehen in [P5-07.md](P5-07.md) und im PR.
