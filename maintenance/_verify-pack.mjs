import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const html = readFileSync(`${OUT}/iso/index.html`);
const srv = createServer((req, res) => {
  if (req.url === "/" || req.url.startsWith("/?") || req.url.startsWith("/#")) { res.setHeader("content-type", "text/html"); res.end(html); }
  else { res.statusCode = 404; res.end("nope"); }
}).listen(4599);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1.5 });
const failures = [];
p.on("response", (r) => { if (r.status() >= 400) failures.push(r.url()); });
p.on("pageerror", (e) => failures.push(String(e).slice(0, 200)));
for (const route of ["components", "lesson-card", "typography", "filter"]) {
  await p.goto(`http://127.0.0.1:4599/#${route}`, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/pack-${route}.png` });
}
const font = await p.evaluate(() => document.fonts.check("700 16px 'Noto Sans'"));
console.log(JSON.stringify({ failures: failures.slice(0, 5), notoSansLoaded: font }));
await browser.close();
srv.close();
