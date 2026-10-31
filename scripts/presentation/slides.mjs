// Portable, editable HTML slides. No remote assets or additional dependencies.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const out = path.join(repo, "docs/praesentation");
const before = "fc12aadc736367e4143ccde56e198c2f1ed56252";
const appCommit = "862fbb62639a3722b1a2195cfce94109f6a30617";
const origin = `https://github.com/lucasstrubel/studicompass/blob/${appCommit}/`;
const esc = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const font = (
  await readFile(
    path.join(
      repo,
      "node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
    ),
  )
).toString("base64");
const assets = new Map();
async function image(name, historical = false) {
  const key = `${historical ? before : appCommit}/${name}`;
  if (!assets.has(key)) {
    const filename = `docs/screens/${name}.png`;
    const data = historical
      ? execFileSync("git", ["show", `${before}:${filename}`], {
          cwd: repo,
          maxBuffer: 12 * 1024 * 1024,
        })
      : await readFile(path.join(repo, filename));
    assets.set(key, `data:image/png;base64,${data.toString("base64")}`);
  }
  return assets.get(key);
}
const screenshot = async (name, alt, historical = false) =>
  `<img src="${await image(name, historical)}" alt="${esc(alt)}">`;
const source = (filename, label) =>
  `<a href="${origin}${filename}">${label}</a>`;
const slides = [];
function add(title, content, notes, className = "") {
  slides.push({ title, content, notes, className });
}

add(
  "StudiCompass",
  `
  <p class="eyebrow">SE2 · Studienleistung III · 06.11.2026</p>
  <h1>StudiCompass</h1>
  <p class="lead">Studienstand verstehen.<br>Prüfungsfolgen vergleichen.</p>
  <p class="cover-note">Klickbarer Hi-Fi-Prototyp mit Demodaten</p>`,
  `Begrüßung: Wir zeigen einen Prototyp für Studierende der TH Mannheim. StudiCompass ist der Arbeitstitel. Die Vorführung verwendet fiktive Hochschuldaten und Beispielregeln. ${source("docs/KONZEPT.md", "Konzept §2–4")}`,
  "cover",
);

add(
  "Niklas im dritten Semester",
  `
  <h2>Niklas im dritten Semester</h2>
  <div class="columns persona">
    <div><p class="big-number">20</p><p>Jahre, Wirtschaftsinformatik<br>TH Mannheim</p></div>
    <div><p class="lead">Studium und Nebenjob<br>teilen sich seine Woche.</p>
      <p>Er organisiert sein Studium meist abends am Laptop.</p>
      <p>Kurz vor den Prüfungen braucht er eine verständliche Einschätzung seines Studienstands.</p></div>
  </div>
  <p class="footnote">Persona aus dem Projektkonzept, keine Testperson der Teamrunde</p>`,
  `Niklas Brandt ist die primäre Persona, 20 Jahre alt, im dritten Fachsemester, mit Nebenjob. Pendeln und kurzfristige Planung gehören zum Nutzungskontext. Die Persona ist nicht mit einem tatsächlich beobachteten Studierenden gleichzusetzen. ${source("docs/KONZEPT.md", "Konzept §2")}`,
);

add(
  "Die Entscheidung am Abend vor der Frist",
  `
  <h2>Die Entscheidung am Abend<br>vor der Frist</h2>
  <p class="quote">„Was bedeutet es für meinen Plan,<br>wenn ich Statistik schiebe?“</p>
  <div class="columns"><p>Das Modul läuft im Beispiel<br>nur im Wintersemester.</p><p>Eine Abmeldung kann das<br>Praxissemester verschieben.</p></div>
  <p class="footnote">Formuliertes Persona-Szenario, kein wörtliches Forschungszitat · Regeln als Beispiel</p>`,
  `Die Frage ist ein formuliertes Szenario, kein erhobenes Zitat. Ausgangslage: 48 ECTS Ist bei Soll 60, Prognose zum Semesterende 78 von 90. Beim Statistik-Szenario fällt die Prognose nach Abmeldung auf 72, das Praxissemester auf SS 2028 und der Abschluss auf SS 2029. ${source("docs/KONZEPT.md", "Konzept §9 und §10.4")}`,
);

add(
  "Live-Demo",
  `
  <h2>Live-Demo</h2>
  <div class="demo-layout"><div>
    <p class="lead">Statistik und Marketing<br>im Vergleich</p>
    <p>Danach: Antwort mit Quelle<br>und ein offener Sonderfall</p>
    <p class="small">Demo-Zeit: 25.01.2027, 19:30 Uhr<br>Alle Daten sind Beispiele.</p>
  </div><figure>${await screenshot("folgen-check-statistik-1440", "Statistik-Folgen-Check mit Optionsvergleich und Beispielquellen")}<figcaption>Statistik-Folgen-Check, Ausschnitt</figcaption></figure></div>`,
  `Jetzt zum Browser wechseln. Der Ablauf dauert etwa 3:40 Minuten. Übersicht, Statistik vergleichen, Abmeldung simulieren, 72 von 90 und verschobene Meilensteine zeigen, dauerhaft Rückgängig im Statistik-Folgen-Check nutzen, Marketing vergleichen, Assistent mit Quelle, Fallback mit Entwurf. Vollständiger Sprechtext: DEMO-SKRIPT.md. Bei Ausfall: lokaler Build oder Backup-Video. Screenshot: docs/screens/folgen-check-statistik-1440.png, Stand ${appCommit}.`,
  "demo",
);

add(
  "VPC-Bezug der gezeigten Funktionen",
  `
  <h2>VPC-Bezug der gezeigten Funktionen</h2>
  <table><thead><tr><th>Bedarf aus der VPC</th><th>Antwort im Prototyp</th></tr></thead><tbody>
    <tr><td>P2 / G1 · Studienstand überblicken</td><td>ECTS und Soll/Ist auf der Übersicht</td></tr>
    <tr><td>P3 / G2 · Folgen abschätzen</td><td>Folgen-Check und Studienverlauf</td></tr>
    <tr><td>P4, P5 / G3 · Regeln verstehen</td><td>Assistent mit Quelle und Fallback</td></tr>
    <tr><td>P1 / G4 · Informationen finden</td><td>Postfach und gezielte Hinweise</td></tr>
  </tbody></table>
  <p class="footnote">Traceability aus KONZEPT §3 · P = Pain, G = Gain</p>`,
  `Die Tabelle verdichtet die im Konzept dokumentierte Traceability. G4 wird als In-App-Hinweis demonstriert, kein echter Push-Dienst. Die vier Zeilen decken P1 bis P5 sowie G1 bis G4 ab. ${source("docs/KONZEPT.md", "Konzept §3, vollständige Zuordnung zu Stories und Testaufgaben")}`,
);

add(
  "Feedback aus dem vierköpfigen Team",
  `
  <h2>Feedback aus dem vierköpfigen Team</h2>
  <div class="columns evidence"><div><p class="big-number">4</p><p>Teammitglieder testeten<br>alle Funktionen einzeln.</p></div>
    <div><p class="lead">Gemeinsam gesammeltes Feedback<br>bildete die Grundlage der Iteration.</p>
      <p>23 Einträge in der Sammelliste.<br>22 umgesetzt, eine Persona-Idee zurückgestellt.</p></div></div>
  <p class="footnote">Qualitative interne Runde. Kein nachgewiesener externer Thinking-Aloud-Test, keine Aufgabenzeiten oder Erfolgsquoten.</p>`,
  `Lucas bestätigte vier Teammitglieder, individuelle Funktionstests und gemeinsame Feedbacksammlung. Die 23 Einträge sind P5-F11 bis F33. F11 bis F32 sind umgesetzt, F33 (zweite Persona im 4. Semester) bleibt im Ideenparkplatz. Daraus lassen sich keine Personenhäufigkeiten oder repräsentativen Aussagen ableiten. M5 hat Lucas am 31.10. mit diesen Grenzen formal abgenommen. ${source("docs/evaluation/P5-teamrunde.md", "Teamrunde")} und ${source("docs/evaluation/P5-auswertung.md", "Befundliste")}. Die M5-Entscheidung steht im Präsentations-PR unter docs/abnahmen/M5.md.`,
);

add(
  "Studienverlauf: Ergebnis direkt an der Aktion",
  `
  <h2>Studienverlauf: Ergebnis direkt<br>an der Aktion</h2>
  <div class="iteration"><div><p class="lead">Die Auswirkung einer Verschiebung<br>war zu weit von der Aktion entfernt.</p>
    <p>Ein Ergebnis-Dialog zeigt die<br>geänderten Meilensteine.</p><p class="small">P5-F13, F17, F19<br>Zusätzlich: Modul-Links und interne Scrollbreite</p></div>
    <figure>${await screenshot("studienverlauf-390", "Studienverlauf vor der Feedback-Umsetzung", true)}<figcaption>Vorher, Ausschnitt</figcaption></figure>
    <figure>${await screenshot("studienverlauf-ergebnis-390", "Ergebnis-Dialog nach einer Verschiebung im Studienverlauf")}<figcaption>Nachher: Ergebnis-Dialog</figcaption></figure></div>`,
  `Beleg aus der gemeinsamen Sammelliste: Orientierung, enge Spalten und entferntes Ergebnis. Umsetzung P5-10/P5-11, technisch geprüft einschließlich Szenario D. Keine gemessene Verkürzung von Aufgabenzeiten behaupten. Vorher: ${before}, docs/screens/studienverlauf-390.png. Nachher: ${appCommit}, docs/screens/studienverlauf-ergebnis-390.png. ${source("docs/evaluation/P5-teamrunde.md", "Zuordnung der Befunde")}`,
);

add(
  "Module: kompakter und ergänzbar",
  `
  <h2>Module: kompakter und ergänzbar</h2>
  <p>Die lange Liste wich aufklappbaren Semestergruppen.<br>Notizen und eigene Kurs-Links ergänzen die Moduldetails.</p>
  <div class="comparison"><figure>${await screenshot("module-1440", "Lange Modulliste vor der Iteration", true)}<figcaption>Vorher, Ausschnitt</figcaption></figure>
    <figure>${await screenshot("module-1440", "Kompakte Semestergruppen nach der Iteration")}<figcaption>Nachher, Ausschnitt</figcaption></figure></div>
  <p class="footnote">P5-F21 bis F23 · Speicherung nach Neuladen technisch geprüft, keine gemessene Zufriedenheit</p>`,
  `Die Sammelliste nennt eine zu lange Liste sowie fehlende Links und Notizen. P5-12 setzt diese Punkte um. Der unabhängige PR29-Review fand und schloss eine Speicherlücke bei schnellen Neuladungen. Die Screenshots zeigen die Liste, die Ergänzungen liegen in den Moduldetails. Vorher: ${before}, nachher: ${appCommit}, jeweils docs/screens/module-1440.png. ${source("docs/reviews/P5-PR29.md", "Nachprüfung der Speicherung")}`,
);

add(
  "Fristen: eigene Termine im Kalender",
  `
  <h2>Fristen: eigene Termine im Kalender</h2>
  <p>Aus der Fristenliste lässt sich auch ein Monat überblicken.<br>Eigene Termine lassen sich anlegen, bearbeiten und löschen.</p>
  <div class="comparison"><figure>${await screenshot("fristen-1440", "Fristenliste vor der Kalender-Ergänzung", true)}<figcaption>Vorher: Liste, Ausschnitt</figcaption></figure>
    <figure class="calendar">${await screenshot("fristen-kalender-1440", "Monatsansicht mit Fristen und Prüfungsterminen")}<figcaption>Nachher: Monatsansicht, Ausschnitt</figcaption></figure></div>
  <p class="footnote">P5-F25/F26 · Tastatur, Touch und Speicherung geprüft. Echter Kalenderimport bleibt separat.</p>`,
  `P5-13/P5-14 ergänzen eigene Einträge und Kalenderansicht. Die Liste bleibt erhalten. Kalender enthält Fristen, eigene Termine, Vorleistungen und Prüfungen. Die technische Prüfung ist kein Nachweis eines realen Kalenderimports oder einer verbesserten Gebrauchstauglichkeit. Vorher: ${before}, docs/screens/fristen-1440.png. Nachher: ${appCommit}, docs/screens/fristen-kalender-1440.png. ${source("docs/evaluation/P5-teamrunde.md", "Kernbefunde und Evidenzgrenzen")}`,
);

add(
  "Technische Nachprüfung der Iteration",
  `
  <h2>Technische Nachprüfung der Iteration</h2>
  <div class="columns evidence"><div><p class="big-number">325</p><p>Tests im Prüf-Gate<br>Typecheck, Lint und Build</p></div>
    <div><p class="lead">59 bestandene Browserfälle<br>66 Screenshot-Aufnahmen</p>
      <p>Unabhängige Reviews und Nachläufe.<br>Bestätigte Major-Befunde behoben.</p>
      <p class="small">Zusätzlich: 320-px-Umbruch und<br>nachgeladener Studienverlauf geprüft.</p></div></div>
  <p class="footnote">Nachweis aus PR #30, neun Browserfälle bewusst übersprungen. Technische Prüfungen messen keine Nutzerzufriedenheit.</p>`,
  `Die Zahlen beziehen sich auf den mit PR30 abgenommenen App-Stand 862fbb6: 325 Tests in 47 Dateien, 59 Browserfälle bestanden, 9 bewusst übersprungen, 66 Screenshots erstellt. Hauptstückaufteilung spart beim frischen Onboarding inklusive Vendor/Runtime rund 7,6 Prozent rohe JS-Bytes. Keine gemessene Ladezeitverbesserung behaupten. ${source("docs/reviews/P5-abschluss.md", "Prüfbericht und unabhängiger Review")}`,
);

add(
  "Ausblick und Beteiligte",
  `
  <h2>Ausblick und Beteiligte</h2>
  <div class="columns outlook"><div><h3>Für einen echten Betrieb</h3><p>Hochschulkanäle anbinden.<br>Regelversionen verbindlich prüfen.<br>Sonderfälle fachlich absichern.</p>
      <p class="small">KI mit belegtem Regelzugriff und<br>Push-Hinweise bleiben Ideen.</p></div>
    <div><h3>Früh einzubeziehen</h3><p>IT / Rechenzentrum für Schnittstellen<br>Datenschutz für Datenflüsse<br>Praktikantenamt für Voraussetzungen<br>Studienberatung und Prüfungsamt<br>für Regeln und Sonderfälle</p></div></div>
  <p class="footnote">Echte Anbindungen und verbindliche SPO-Prüfung sind im Prototyp nicht umgesetzt.</p>`,
  `Diese Folie nennt Integrationsannahmen, Ideenparkplatz und ergänzte Stakeholder gemäß P6-03 / KONZEPT A-7. Das ist ein Ausblick, keine zugesagte Roadmap für ein Produktivsystem. Noch separat: ursprünglicher Flow-Chart-Abgleich, tatsächlicher ICS-Import, Screenreader, reale Geräte und Generalprobe. ${source("docs/KONZEPT.md", "Konzept §5.2 und §15")}`,
);

add(
  "Entscheidungen mit nachvollziehbaren Folgen",
  `
  <h2>Entscheidungen mit<br>nachvollziehbaren Folgen</h2>
  <p class="lead closing">StudiCompass verbindet den eigenen Studienstand<br>mit dem Vergleich einer konkreten Entscheidung.</p>
  <p>Quellen machen die Regeln nachvollziehbar.<br>Offene Sonderfälle führen zu einer zuständigen Stelle.</p>
  <p class="demo-url">studicompass-six.vercel.app</p>
  <p class="footnote">Prototyp mit Demodaten und Beispielregeln · Arbeitstitel StudiCompass</p>`,
  `Fragen aufnehmen. Die Live-Demo zeigt einen funktionalen Kern mit lokalen Berechnungen. Login, Hochschulkanäle, Assistent und Abmeldung sind simuliert. Keine Zugangsdaten werden erfasst, keine Anfrage wird gesendet. Bei fachlichen Fragen zur echten SPO die Grenze des Beispiels benennen.`,
);

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light"><title>StudiCompass – Präsentation</title>
<style>
@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:200 800;font-style:normal;font-display:block}
:root{--paper:#faf9f5;--ink:#1a1917;--muted:#57534b;--brand:#a4492e;--line:#d4cfc6;--scale:1}
*{box-sizing:border-box}body{margin:0;font-family:Manrope,Arial,sans-serif;background:var(--paper);color:var(--ink);font-size:25px;line-height:1.5}
main{width:1280px;height:720px;position:absolute;left:50%;top:calc((100% - 62px)/2);transform:translate(-50%,-50%) scale(var(--scale));transform-origin:center}
.slide{position:relative;width:1280px;height:720px;padding:56px 70px;background:var(--paper);overflow:hidden}
body.ready .slide[aria-hidden=true]{display:none}h1{font-size:94px;line-height:1.15;letter-spacing:-4px;margin:52px 0 30px;font-weight:650}
h2{font-size:44px;line-height:1.22;letter-spacing:-1.4px;margin:0 0 30px;font-weight:650}h3{font-size:28px;margin:0 0 22px}
p{margin:0 0 24px}.lead{font-size:31px;line-height:1.45;letter-spacing:-.5px}.small{font-size:21px;color:var(--muted);line-height:1.6}
.eyebrow{font-size:21px;color:var(--brand)}.cover .lead{font-size:38px}.cover-note{font-size:23px;margin-top:68px;color:var(--muted)}
.columns{display:grid;grid-template-columns:1fr 1.3fr;gap:70px;margin-top:38px}.big-number{font-size:120px;line-height:1.1;margin-bottom:20px;color:var(--brand);font-weight:600}
.persona{margin-top:72px}.evidence{margin-top:60px}.quote{font-size:42px;line-height:1.5;margin:60px 0 52px;color:var(--brand)}
.footnote{position:absolute;bottom:35px;left:70px;right:70px;font-size:18px;line-height:1.5;color:var(--muted);margin:0}
.demo-layout{display:grid;grid-template-columns:400px 1fr;gap:36px;align-items:center;margin-top:30px}figure{margin:0;min-width:0}img{display:block;width:100%;height:100%;object-fit:contain;object-position:top center}figcaption{font-size:18px;color:var(--muted);margin-top:12px}
.demo-layout figure img{height:422px;object-fit:cover;object-position:top}.iteration{display:grid;grid-template-columns:1fr 235px 235px;gap:24px;margin-top:20px}.iteration .lead{font-size:28px}.iteration figure img{height:425px;object-fit:cover;object-position:top}
.comparison{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:22px}.comparison img{height:325px;object-fit:cover;object-position:top}.comparison .calendar img{object-position:center}.comparison figcaption{margin-top:10px}
table{border-collapse:collapse;width:100%;margin-top:42px;font-size:25px}th,td{text-align:left;padding:23px 16px 23px 0;border-bottom:1px solid var(--line)}th{font-size:21px;color:var(--muted);font-weight:600}td:first-child{width:51%}
.outlook{margin-top:55px;grid-template-columns:1fr 1fr;gap:48px}.outlook p{line-height:1.85}.closing{margin-top:82px}.demo-url{color:var(--brand);font-size:28px;margin-top:50px}
nav{position:fixed;bottom:6px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;background:var(--paper);padding:6px;border:1px solid var(--line);z-index:5;font-size:14px}
button{font:inherit;color:var(--ink);background:white;border:1px solid var(--line);padding:6px 10px;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid var(--brand);outline-offset:3px}button:disabled{opacity:.5;cursor:default}
#notes{position:fixed;right:16px;bottom:64px;max-width:760px;max-height:230px;overflow:auto;background:white;border:1px solid var(--line);padding:22px;font-size:18px;z-index:10;box-shadow:0 4px 25px #0002}a{color:var(--brand)}[hidden]{display:none!important}
@page{size:1280px 720px;margin:0}@media print{html,body{width:1280px;background:var(--paper)}main{position:static;transform:none;height:auto;width:1280px}body.ready .slide[aria-hidden=true]{display:block}.slide{break-after:page;page-break-after:always;print-color-adjust:exact;-webkit-print-color-adjust:exact}.slide:last-child{break-after:auto;page-break-after:auto}nav,#notes{display:none!important}}
</style></head><body><main aria-label="Präsentationsfolien">
${slides.map((slide, index) => `<section class="slide ${slide.className}" id="slide-${index + 1}" aria-label="Folie ${index + 1}: ${esc(slide.title)}">${slide.content}<template class="notes">${slide.notes}</template></section>`).join("\n")}
</main><nav aria-label="Foliensteuerung"><button id="prev" aria-label="Vorherige Folie">Zurück</button><span id="count" aria-live="polite"></span><button id="next" aria-label="Nächste Folie">Weiter</button><button id="toggle-notes" aria-pressed="false">Notizen</button><button id="fullscreen">Vollbild</button></nav><aside id="notes" aria-label="Sprechhinweise und Quellen" hidden></aside>
<script>
const slides=[...document.querySelectorAll('.slide')], notes=document.querySelector('#notes');let current=0;
function show(index){current=Math.max(0,Math.min(slides.length-1,index));slides.forEach((slide,i)=>{slide.setAttribute('aria-hidden',String(i!==current));slide.inert=i!==current});document.querySelector('#count').textContent=(current+1)+' / '+slides.length;document.querySelector('#prev').disabled=current===0;document.querySelector('#next').disabled=current===slides.length-1;notes.innerHTML=slides[current].querySelector('.notes').innerHTML;history.replaceState(null,'','#'+(current+1));document.title=slides[current].getAttribute('aria-label')+' · StudiCompass'}
function resize(){document.documentElement.style.setProperty('--scale',Math.max(.1,Math.min(innerWidth/1280,(innerHeight-62)/720)))}
function toggleNotes(){notes.hidden=!notes.hidden;document.querySelector('#toggle-notes').setAttribute('aria-pressed',String(!notes.hidden))}
async function full(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}}
document.querySelector('#prev').onclick=()=>show(current-1);document.querySelector('#next').onclick=()=>show(current+1);document.querySelector('#toggle-notes').onclick=toggleNotes;document.querySelector('#fullscreen').onclick=full;
addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey)return;if(event.target instanceof HTMLButtonElement&&[' ','Enter'].includes(event.key))return;if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();show(current+1)}else if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();show(current-1)}else if(event.key==='Home'){event.preventDefault();show(0)}else if(event.key==='End'){event.preventDefault();show(slides.length-1)}else if(event.key.toLowerCase()==='n'){toggleNotes()}else if(event.key.toLowerCase()==='f'){void full()}});
addEventListener('resize',resize);addEventListener('hashchange',()=>show((Number(location.hash.slice(1))||1)-1));document.body.classList.add('ready');show((Number(location.hash.slice(1))||1)-1);resize();
</script></body></html>`;
await mkdir(out, { recursive: true });
await writeFile(path.join(out, "studicompass.html"), html);
await writeFile(
  path.join(out, "FOLIEN-NOTIZEN.md"),
  "# Sprechhinweise und Quellen\n\nDie Notizen sind auch über N in der HTML-Präsentation erreichbar.\n\n" +
    slides
      .map(
        (slide, index) =>
          `## ${index + 1}. ${slide.title}\n\n${slide.notes.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, "[$2]($1)")}\n`,
      )
      .join("\n"),
);
console.log(
  JSON.stringify({
    slides: slides.length,
    images: assets.size,
    bytes: Buffer.byteLength(html),
    output: path.join(out, "studicompass.html"),
  }),
);
