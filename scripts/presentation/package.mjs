// Run after npm run check. Outputs are local artifacts, never a published release.
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const output = path.join(repo, "artifacts/presentation");
const bundle = path.join(output, "studicompass-lokal");
// Refuse a stale package instead of silently mixing builds. Preserve prior artifacts.
await mkdir(bundle, { recursive: false });
await cp(path.join(repo, "dist"), path.join(bundle, "app"), {
  recursive: true,
});
await cp(
  path.join(repo, "scripts/presentation/server.mjs"),
  path.join(bundle, "server.mjs"),
);
await cp(
  path.join(repo, "docs/praesentation/DEMO-ANLEITUNG.md"),
  path.join(bundle, "DEMO-ANLEITUNG.md"),
);
await cp(
  path.join(repo, "docs/praesentation/DEMO-SKRIPT.md"),
  path.join(bundle, "DEMO-SKRIPT.md"),
);
await writeFile(
  path.join(bundle, "START.cmd"),
  '@echo off\r\ncd /d "%~dp0"\r\nnode server.mjs\r\nif errorlevel 1 pause\r\n',
);
await writeFile(
  path.join(bundle, "README.txt"),
  "StudiCompass – lokales Präsentationsbackup\r\n\r\nVoraussetzung: Node.js 22.22.2 oder neuer.\r\nSTART.cmd öffnen oder im Ordner: node server.mjs\r\nDann http://127.0.0.1:4173 im Browser öffnen.\r\nKein npm, keine Anmeldung, kein Internet erforderlich.\r\nZum Beenden im Serverfenster Strg+C.\r\nBei belegtem Port: node server.mjs --port 4174\r\nDemo: Einstellungen > Demo zurücksetzen > Zurücksetzen > Demo ohne Einrichtung starten.\r\nDetails siehe DEMO-ANLEITUNG.md.\r\n\r\nAlle Hochschuldaten und Regeln sind Beispiele. Kein veröffentlichter Release.\r\n",
);
async function files(dir) {
  const list = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) list.push(...(await files(full)));
    else if (entry.isFile()) list.push(full);
    else throw new Error(`Unerwarteter Dateityp: ${full}`);
  }
  return list.sort();
}
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const checksums = [];
for (const file of await files(bundle)) {
  const bytes = await readFile(file);
  checksums.push({
    path: path.relative(bundle, file).replaceAll(path.sep, "/"),
    bytes: bytes.length,
    sha256: sha256(bytes),
  });
}
const manifest = {
  kind: "local-presentation-backup",
  appBaseCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
  }).trim(),
  appSourceChanges: execFileSync(
    "git",
    [
      "diff",
      "HEAD",
      "--name-only",
      "--",
      "src",
      "public",
      "package.json",
      "package-lock.json",
      "vite.config.ts",
    ],
    { cwd: repo, encoding: "utf8" },
  ).trim(),
  preparedDate: "2026-10-31",
  demoTime: "2027-01-25T19:30:00+01:00",
  files: checksums,
};
if (manifest.appSourceChanges)
  throw new Error(
    "App-Quelle weicht vom Basis-Commit ab. Build-Provenienz vor Paketierung klären.",
  );
await writeFile(
  path.join(bundle, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    bundle,
    files: checksums.length,
    bytes: checksums.reduce((sum, file) => sum + file.bytes, 0),
    appBaseCommit: manifest.appBaseCommit,
  }),
);
