#!/usr/bin/env node
// Build the Patterns cards that are templates, not renderings of the Catalog.
//
// build-ds-cards.mjs makes a card by screenshotting a Catalog route, which means
// the composition on the card is one someone re-expressed in index.html's own
// vanilla dialect. For a component that is right — the Catalog route is the
// reference. For a product pattern it drifts: the only real composition lives in
// maintenance/templates/*.dc.html, and every hand translation of it into
// `ui.*` calls was a chance to lose the header, the column width, a default, or
// a whole radiogroup. Six rounds of review found exactly those.
//
// So these cards are the template. A card is an HTML file in an iframe, and a
// `.dc.html` renders in a plain browser as long as support.js is loaded — which
// is how the templates are captured for Figma already. Nothing is translated,
// and a template edit reaches the card on the next build.
//
// Three things make it work without touching the template's own markup:
//   · ds-base.js resolves the kit and Assets/ against its OWN url, not the
//     page's, so the scripts stay in templates/<name>/ and the card points at
//     them from patterns/<Name>/.
//   · both directories sit two levels below the project root, so the template's
//     `../../Assets/...` is already correct from the card.
//   · the props block is left alone, so the pane's own prop editors still work.
//
// Run after build-ds-project.mjs and build-ds-cards.mjs — it overwrites the
// cards those produced for the patterns listed here:
//   node maintenance/scripts/build-template-cards.mjs --out maintenance/ds-project

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
const HERE = resolve(fileURLToPath(import.meta.url), '../../..');
const REPO = resolve(flag('repo', HERE));
const OUT = resolve(flag('out', join(HERE, 'maintenance/ds-project')));

/* template directory → card, title, and the props the card should open with.
   `props` is applied to the template's own prop defaults, so opening the
   booking flow is a value rather than a second copy of the page. */
const CARDS = [
  { template: 'logged-in-shell', file: 'LoggedInShell.dc.html', name: 'LoggedInShell', title: 'Logged-in shell' },
  { template: 'logged-out-shell', file: 'LoggedOutShell.dc.html', name: 'LoggedOutShell', title: 'Logged-out shell' },
  { template: 'teacher-detail', file: 'TeacherDetail.dc.html', name: 'TeacherDetail', title: 'Teacher detail' },
  { template: 'teacher-search', file: 'TeacherSearch.dc.html', name: 'TeacherDiscovery', title: 'Teacher discovery' },
  { template: 'teacher-profile', file: 'TeacherProfile.dc.html', name: 'BookingCommitment', title: 'Booking commitment', props: { startOnBooking: true } },
];

/* A card is the template, so the template's own folder has to be reachable from
   it — support.js, ds-safe.js and any pattern stylesheet. The cloud project
   already carries templates/ (they are pushed on their own), but the payload
   directory is rebuilt from scratch every time, so mirror them in: it makes the
   local tree a faithful copy of the project, which is what lets the Catalog show
   the same card the pane does.

   Assets/ comes along for the same reason. The payload deliberately ships none —
   the cloud project holds them at its root — but without them here the one thing
   that cannot fall back to the hosted copy is a CSS mask, and the Calendar's
   timezone pin is exactly that. Present locally, not part of a push. */
const mirror = (from, to) => {
  if (!existsSync(join(REPO, from))) return null;
  cpSync(join(REPO, from), join(OUT, to), { recursive: true, dereference: true });
  return to;
};

const vendor = new Set();
const report = [];
for (const card of CARDS) {
  const source = join(REPO, 'maintenance/templates', card.template, card.file);
  if (!existsSync(source)) { report.push(`! ${card.name}: no ${card.template}/${card.file}`); continue; }
  let html = readFileSync(source, 'utf8');

  /* Read back out of a design project, a .dc.html carries two injected nodes
     that belong to that host. Writing them into a card would bake them in. */
  html = html.replace(/<(script|style) data-omelette-injected>[\s\S]*?<\/\1>/g, '');

  /* The only rewrite: the sibling files the page loads with `./`. They are
     copied next to the cards rather than pointed at templates/, so a card is
     self-contained and the project needs no templates/ folder at all — which is
     the point: the pattern lives in the kit now, not in two places.

     One shared folder rather than a copy per card, because support.js alone is
     69KB and three of them is 200KB of the same file. `_dc` holds no HTML, so
     the pane's card index never sees it. */
  const base = '../_dc/';
  html = html.replace(/(src|href)="\.\/([A-Za-z0-9._-]+)"/g, (_, attr, file) => {
    vendor.add(join('maintenance/templates', card.template, file));
    return `${attr}="${base}${file}"`;
  });

  /* Prop overrides go through the props block's own defaults, so the pane still
     shows an editor for each one and the card opens on the intended state. */
  if (card.props) {
    html = html.replace(/data-props="([^"]*)"/, (whole, encoded) => {
      const decode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const encode = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let props;
      try { props = JSON.parse(decode(encoded)); } catch { return whole; }
      for (const [key, value] of Object.entries(card.props)) {
        props[key] = { ...(props[key] || { editor: typeof value === 'boolean' ? 'boolean' : 'text', tsType: typeof value, section: 'Booking' }), default: value };
      }
      return `data-props="${encode(JSON.stringify(props))}"`;
    });
  }

  /* The template's own styles address assets page-relatively, which is right
     at templates/<name>/ and wrong at patterns/<Name>/ — the same depth, but the
     path is resolved against the document, and the document has moved. The
     Calendar's timezone pin is the visible casualty: the templates carry a
     hand-written !important override for it, and being page-relative that
     override is exactly what breaks here — and it beats the inline style the
     runtime base would have fixed. Rebase the static form; `../../Assets` does
     not match, so nothing is rewritten twice. */
  html = html.replace(/url\((['"]?)Assets\//g, (_, quote) => `url(${quote}../../Assets/`);

  /* Masked icons the kit paints at runtime — the Calendar timezone pin, the
     Stepper markers, a Selection mark — carry a page-relative url(Assets/…),
     which resolves against the document. At the project root that is right; two
     levels down inside patterns/<Name>/ it points at a folder that does not
     exist, and a failed mask paints nothing at all: no broken-image icon, no
     console error, just a 16px gap where the pin should be. This is the reason
     the templates carried a hand-written !important override — and that override
     is page-relative too, so it never helped here. Tell the runtime how deep the
     card sits and it addresses assets itself; the template's own static
     ../../Assets/… paths are already correct and are left alone.

     It has to be set before the bundle runs, so it goes ahead of support.js. */
  html = html.replace(/<script src="([^"]*support\.js)"><\/script>/, (whole, src) =>
    `<script>window.ITalkiUIAssetBase="../../"</script>\n<script src="${src}"></script>`);

  /* The pane indexes cards by this marker on the first line, and titles the tab
     from <title>. A .dc.html has neither. */
  const head = `<!-- @dsCard group="Patterns" -->`;
  html = html.replace(/^<!DOCTYPE html>/i, `${head}\n<!DOCTYPE html>`);
  if (!html.startsWith(head)) html = `${head}\n${html}`;
  if (!/<title>/i.test(html)) html = html.replace(/<\/head>/i, `<title>${card.title} — italki UI Kit</title>\n</head>`);

  const file = join(OUT, `patterns/${card.name}/${card.name}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);

  /* The note build-ds-cards wrote alongside the old card described blocks it had
     extracted from a Catalog route. There are none now, and saying there are
     would send an agent looking for a rendering that no longer exists. */
  const props = [...html.matchAll(/&quot;([A-Za-z0-9_]+)&quot;:\{&quot;editor/g)].map((m) => m[1]);
  writeFileSync(join(OUT, `patterns/${card.name}/${card.name}.prompt.md`), `${card.title} — an italki product pattern, not a component.

This card is not a rendering of the pattern. It **is** the template:
\`templates/${card.template}/${card.file}\`, loaded through that folder's own
\`support.js\`. Nothing here was re-expressed by hand, so it cannot drift from
the page the product ships — edit the template and this card follows.

## Working from it

- Read the template, not this file. Every composition decision lives there.
- It is interactive. The props below are real switches; the flow really steps.
- Do not copy this card's markup into a page. Start from the template.

## Props

${props.length ? props.map((p) => `- \`${p}\``).join('\n') : '- (none declared)'}
`);
  report.push(`${card.name} ← templates/${card.template}/${card.file} (${Math.round(html.length / 1024)} KiB)`);
}

/* One folder for all three cards only holds while the templates agree on these
   files. They did not: teacher-detail's ds-safe.js still carried a dispatcher
   binding the others had dropped, and writing both into one name would have
   silently kept whichever landed last — a card wired to two functions that no
   longer exist, warning into a console nobody reads. So the bytes are compared,
   and a real divergence stops the build instead of picking a winner. */
const written = new Map();
for (const from of vendor) {
  const file = from.split('/').pop();
  if (!existsSync(join(REPO, from))) { report.push(`! missing ${from}`); continue; }
  const body = readFileSync(join(REPO, from));
  const seen = written.get(file);
  if (seen && !seen.body.equals(body)) {
    report.push(`! ${file} differs between ${seen.from} and ${from} — the shared copy cannot serve both`);
    continue;
  }
  written.set(file, { from, body });
  mkdirSync(join(OUT, 'patterns/_dc'), { recursive: true });
  writeFileSync(join(OUT, 'patterns/_dc', file), body);
}

/* ds-base.js resolves the kit and Assets against its own url, so from
   patterns/_dc/ two levels up is the project root either way — the same answer
   it gave from templates/<name>/. Nothing in it needed changing. */
const assets = mirror('Assets', 'Assets');

console.log(`✓ template cards → ${OUT}/patterns`);
for (const line of report) console.log(`    ${line}`);
console.log(`    patterns/_dc: ${[...written.keys()].sort().join(', ')}`);
console.log(`    ${assets ? 'Assets/ mirrored (local only — do not push)' : 'no Assets/ to mirror'}`);
if (report.some((l) => l.startsWith('!'))) process.exitCode = 1;
