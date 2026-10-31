// Dependency-free loopback server for the presentation backup. Run next to app/.
import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--port")) {
  throw new Error("Aufruf: node server.mjs [--port 4173]");
}
const port = Number(args[1] ?? 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error("Port muss eine ganze Zahl zwischen 1024 und 65535 sein.");
}
const root = await realpath(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "app"),
);
const inside = (target) => {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, `http://127.0.0.1:${port}`).pathname,
    );
    if (pathname.includes("\0") || pathname.includes("\\")) {
      response.writeHead(400).end();
      return;
    }
    let target = path.resolve(root, `.${pathname}`);
    if (!inside(target)) {
      response.writeHead(403).end();
      return;
    }
    try {
      if (!(await stat(target)).isFile()) throw new Error("not a file");
    } catch (error) {
      // Routes use the SPA entry; missing assets must stay 404 rather than return HTML.
      if (path.extname(pathname) || pathname.startsWith("/assets/")) {
        response.writeHead(404).end();
        return;
      }
      target = path.join(root, "index.html");
    }
    target = await realpath(target);
    if (!inside(target)) {
      response.writeHead(403).end();
      return;
    }
    const bytes = await readFile(target);
    response.writeHead(200, {
      "Content-Type": types[path.extname(target)] ?? "application/octet-stream",
      "Content-Length": bytes.length,
    });
    response.end(request.method === "HEAD" ? undefined : bytes);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 500).end();
  }
});
server.on("error", (error) => {
  console.error(`Start fehlgeschlagen: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`StudiCompass: http://127.0.0.1:${port} (Beenden: Strg+C)`);
});
