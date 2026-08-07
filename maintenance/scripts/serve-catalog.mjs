import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(portIndex === -1 ? 4173 : args[portIndex + 1]);
const host = "127.0.0.1";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function resolvedPath(urlPath) {
  const requestPath = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  const filePath = path.resolve(root, `.${requestPath}`);
  return filePath.startsWith(`${root}${path.sep}`) ? filePath : null;
}

const server = createServer(async (request, response) => {
  const filePath = resolvedPath(new URL(request.url || "/", `http://${host}`).pathname);
  if (!filePath) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    }).end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.on("error", (error) => {
  console.error(`Unable to start the local Catalog server: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`italki UI Kit available at http://${host}:${port}/index.html`);
});
