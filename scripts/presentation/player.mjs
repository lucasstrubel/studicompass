import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function writePlayer(output, vtt) {
  // Embed VTT: Chrome blocks a second file:// resource as a text-track CORS request.
  const captions = `data:text/vtt;base64,${Buffer.from(vtt).toString("base64")}`;
  await writeFile(
    path.join(output, "backup.html"),
    `<!doctype html><html lang="de"><meta charset="utf-8"><title>StudiCompass – Backup</title><style>body{margin:2rem;background:#faf9f5;color:#1a1917;font:18px system-ui}video{display:block;width:100%;max-height:85vh}p{max-width:70ch}</style><h1>StudiCompass – Demo-Backup</h1><p>Tatsächlicher Browserablauf mit Demodaten, ohne Ton. Sprechtext: DEMO-SKRIPT.md. Die Aufnahme hat keine echten Hochschulsysteme verbunden.</p><video controls preload="metadata"><source src="hero-flow.webm" type="video/webm"><track src="${captions}" kind="subtitles" srclang="de" label="Kapitelhinweise" default></video></html>`,
  );
}
