#!/usr/bin/env node
// Build the Design project's Pattern cards from the Catalog's own routes.
//
// The component generator (build-ds-project.mjs) works by calling a renderer
// with props. Patterns have no renderer: they are compositions assembled inside
// index.html's route functions, so the only faithful source for them is the
// Catalog page itself. This renders each pattern route in a real browser and
// lifts the rendered blocks out — which is why this script needs Playwright and
// build-ds-project.mjs does not.
//
// Run after build-ds-project.mjs, against the same --out:
//   node maintenance/scripts/build-ds-patterns.mjs --out maintenance/ds-project
//
// Without it the project ships 52 components and no patterns at all, which is
// the gap that had a generated template inventing its own page composition.

import { chromium } from 'playwright';
import http from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
const REPO = resolve(flag('repo', '.'));
const OUT = resolve(flag('out', 'maintenance/ds-project'));
const PORT = Number(flag('port', '4319'));

// Route slug → card name. The group is the Design pane's section label; the
// Catalog files these under Patterns, so the project does too.
const PATTERNS = [
  ['workspace-shell', 'WorkspaceShell', 'Workspace shell'],
  ['teacher-discovery', 'TeacherDiscovery', 'Teacher discovery'],
  ['filter', 'Filter', 'Filter'],
  ['teacher-card', 'TeacherCard', 'Teacher card'],
  ['lesson-card', 'LessonCard', 'Lesson card'],
  ['teacher-detail', 'TeacherDetail', 'Teacher detail'],
  ['booking-commitment', 'BookingCommitment', 'Booking commitment'],
  ['payment-checkout', 'PaymentCheckout', 'Payment checkout'],
  ['mira-module', 'MiraModule', 'Mira module'],
];

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const file = join(REPO, decodeURIComponent(req.url.split('?')[0]));
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404); res.end();
  }
});
await new Promise((r) => server.listen(PORT, r));

const write = (rel, body) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
};
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const browser = await chromium.launch();
const report = { ok: [], stubs: [], skipped: [] };

for (const [route, name, title] of PATTERNS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  await page.goto(`http://127.0.0.1:${PORT}/index.html?route=${route}#${route}`, { waitUntil: 'load' });
  try {
    await page.waitForFunction(
      () => (document.querySelector('main')?.innerText ?? '').trim().length > 0,
      undefined, { timeout: 15000 },
    );
  } catch {
    report.skipped.push(`${name}: route never rendered`);
    await page.close();
    continue;
  }
  await page.waitForTimeout(500);

  const { blocks, intro } = await page.evaluate(() => {
    /* Hover tooltips are transient and would freeze into the snapshot. */
    document.querySelectorAll('.ui-tooltip').forEach((n) => n.remove());
    const found = [...document.querySelectorAll('.component-doc-block')].map((block) => ({
      label: block.querySelector('.component-doc-header h2')?.textContent?.trim() ?? '',
      html: block.querySelector('.component-doc-content')?.innerHTML?.trim() ?? '',
    })).filter((b) => b.html);
    /* Some pattern routes are a single composition with no doc blocks; take the
       whole article rather than emitting an empty card. */
    if (!found.length) {
      const article = document.querySelector('main .component-detail, main article');
      if (article) found.push({ label: 'Composition', html: article.innerHTML.trim() });
    }
    return { blocks: found, intro: document.querySelector('main .intro')?.textContent?.trim() ?? '' };
  });
  await page.close();

  if (!blocks.length) {
    report.skipped.push(`${name}: no blocks extracted`);
    continue;
  }

  /* Six of the nine patterns are stubs in the Catalog itself: patternDetail()
     renders a paragraph pointing at PATTERNS.md and a list of entry names, with
     no composition behind it. Capturing that and filing it as a preview would
     imply a reference rendering exists, so the card and its prompt say plainly
     that one does not. */
  const isStub = blocks.some((b) => b.html.includes('This is a product-specific composition'));

  /* Cards live two levels down from the project root, so page-relative asset
     paths the Catalog emits have to be rebased. */
  const rebase = (html) => html.replaceAll('="Assets/', '="../../Assets/');
  const body = blocks
    .map(({ label, html }) => `  <div class="cell"><div class="cell-label">${escape(label)}</div><div class="cell-body">${rebase(html)}</div></div>`)
    .join('\n');

  const dir = `patterns/${name}`;
  write(`${dir}/${name}.html`, `<!-- @dsCard group="Patterns" -->
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${title} — italki UI Kit</title>
<link rel="stylesheet" href="../../styles.css">
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:var(--ui-space-6,24px);background:var(--ui-color-page,#FFFFFF);font-family:"Noto Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ui-color-text)}
  /* Patterns are page-level compositions: each one takes a full row. */
  .ds-grid{display:flex;flex-direction:column;gap:var(--ui-space-8,32px)}
  .cell{min-width:0}
  .cell-label{font-size:12px;line-height:16px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ui-color-secondary);margin:0 0 var(--ui-space-2,8px)}
</style>
</head><body>
<div class="ds-grid">
${body}
</div>
</body></html>
`);

  write(`${dir}/${name}.prompt.md`, `${title} — an italki product pattern, not a component.

${intro}

${isStub ? `**No reference rendering exists.** The Catalog documents this pattern by
name and lists its entries, but does not build it, and PATTERNS.md does not
specify it beyond that. Treat the entry list below as the only constraint, ask
before inventing an arrangement, and report the gap rather than filling it.` : `A pattern is a composition of kit components with a fixed information order and
action hierarchy. There is no \`window.ItalkiUI.${name}\`: build it from the
components below, in this arrangement. Changing which component carries a given
piece of information changes the pattern.`}

## Blocks on the card

${blocks.map((b) => `- ${b.label}`).join('\n')}

## Components this pattern composes

${[...new Set(blocks.flatMap((b) => [...b.html.matchAll(/data-component="([a-z-]+)"/g)].map((m) => m[1])))]
  .sort().map((k) => `- \`${k}\``).join('\n') || '- (none detected)'}

${isStub ? 'There is nothing here to match yet — this file records that the pattern is named but unbuilt.' : 'The rendered card is the reference. Match its structure before changing content.'}
`);

  report[isStub ? 'stubs' : 'ok'].push(`${name}${isStub ? ' — spec stub, no rendering' : ` (${blocks.length} blocks)`}`);
}

await browser.close();
server.close();

console.log(`✓ patterns → ${OUT}/patterns`);
for (const line of report.ok) console.log(`    ${line}`);
for (const line of report.stubs) console.log(`  · ${line}`);
for (const line of report.skipped) console.log(`  ! ${line}`);
if (report.skipped.length) process.exitCode = 1;
