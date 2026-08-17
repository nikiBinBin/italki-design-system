#!/usr/bin/env node
/* Take each component's card content from the Catalog route that documents it.
 *
 * The design project's cards were built by sweeping a component's contract: one
 * cell per enum value. That is exhaustive and it is not documentation — Badge got
 * nine cells for its types while Breadcrumb got one, because a breadcrumb's
 * shapes are not an enum. The Catalog already groups every component the way a
 * person reads it ("With an icon", "Long trail", "Custom separator"), and the
 * React project's cards are built from those groups, which is why they read
 * better.
 *
 * So: the Catalog is opened in a browser, every route's blocks are read, and the
 * result is written as JSON for build-ds-project to use. The markup is the
 * vanilla kit's own, so the design project can ship it as-is — its bundle and its
 * _cards.js are what make it interactive there, exactly as in the Catalog.
 *
 *   node maintenance/scripts/catalog-cards.mjs
 *
 * Writes maintenance/catalog-cards.json. Re-run it when a route changes; the
 * build reads the file and falls back to the contract sweep for anything the
 * Catalog does not document as a route of its own.
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
const { chromium } = require(join(ROOT, 'maintenance/node_modules/playwright'));

const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = createServer((request, response) => {
  try {
    const file = join(ROOT, decodeURIComponent(request.url.split('?')[0]));
    const body = readFileSync(file);
    response.setHeader('content-type', TYPES[extname(file)] ?? 'text/html');
    response.end(body);
  } catch { response.statusCode = 404; response.end(); }
});
await new Promise((done) => server.listen(0, done));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${origin}/index.html#components`, { waitUntil: 'networkidle' });

/* The routes the Catalog itself lists, so a component that moves route is not
   looked up under a name this script remembers. */
const routes = await page.evaluate(() => [...document.querySelectorAll('[data-route]')].map((link) => link.dataset.route));
const cards = {};

for (const route of [...new Set(routes)]) {
  await page.goto(`${origin}/index.html#${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
  const blocks = await page.evaluate(() => [...document.querySelectorAll('[class$="-doc-block"], [class*="-doc-block "]')]
    .map((block) => ({
      label: (block.querySelector('[class$="-doc-header"] h2') ?? block.querySelector('h2, h3, h4'))?.textContent?.trim() ?? '',
      html: block.querySelector('[class$="-doc-content"]')?.innerHTML?.trim() ?? '',
      blockClass: block.className,
    }))
    .filter((block) => block.html));
  if (blocks.length) cards[route] = blocks;
}

await browser.close();
server.close();

const out = join(ROOT, 'maintenance/catalog-cards.json');
writeFileSync(out, `${JSON.stringify(cards, null, 2)}\n`);
console.log(`✓ ${Object.keys(cards).length} 条路由的分组 → maintenance/catalog-cards.json`);
for (const [route, blocks] of Object.entries(cards)) console.log(`  ${route}: ${blocks.map((block) => block.label).join(' · ')}`);
