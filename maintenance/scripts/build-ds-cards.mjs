#!/usr/bin/env node
// Build every Design card's visual from the Catalog route it documents.
//
// build-ds-project.mjs derives the contract side of each card — props, .d.ts,
// prompt — by calling renderers directly. It also emitted the card HTML, by
// sweeping one prop's enum values, and that was always an approximation: the
// Catalog's Radio route curates six demos (inline, vertical and block groups,
// disabled, a states matrix) where the sweep produced one row. Comparing the
// two found 34 cards thinner than their route.
//
// So the visual comes from the Catalog instead. This renders each route in a
// real browser and lifts its doc blocks, which is also the only way to get
// patterns at all — they have no renderer, being compositions assembled inside
// index.html. Contract-derived files are left alone; only the .html is rewritten.
//
// Run after build-ds-project.mjs, against the same --out:
//   node maintenance/scripts/build-ds-cards.mjs --out maintenance/ds-project

import { chromium } from 'playwright';
import http from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
/* The repo root is found from this file, not from the shell's working directory:
   npm runs these from maintenance/, where '.' is the wrong root — the build died
   on a missing catalog-runtime/contracts.js and only worked when invoked by hand
   from the top. --repo still overrides. */
const HERE = resolve(fileURLToPath(import.meta.url), '../../..');
const REPO = resolve(flag('repo', HERE));
const OUT = resolve(flag('out', join(HERE, 'maintenance/ds-project')));
const PORT = Number(flag('port', '4319'));

// Route slug → card name. The group is the Design pane's section label; the
// Catalog files these under Patterns, so the project does too.
/* The Foundation pages are where the token values live — the colour ramp, the
   type scale, the spacing and radius tables. They were never in the project at
   all, which left an AI reading it with components but no scales. */
const FOUNDATIONS = [
  ['color', 'Color', 'Color'],
  ['typography', 'Typography', 'Typography'],
  ['spacing', 'Spacing', 'Spacing'],
  ['grid', 'Grid', 'Grid'],
  ['radius', 'Radius', 'Radius'],
  ['shadow', 'Shadow', 'Shadow'],
  /* A Foundation page with no entry here produces no card, and the omission is
     silent: the Catalog gains a route, the pane gains nothing, and only reading
     both side by side shows it. */
  ['image', 'Image', 'Image'],
];

const PATTERNS = [
  ['workspace-shell', 'WorkspaceShell', 'Workspace shell'],
  ['teacher-discovery', 'TeacherDiscovery', 'Teacher discovery'],
  ['filter', 'Filter', 'Filter'],
  ['teacher-card', 'TeacherCard', 'Teacher card'],
  ['lesson-card', 'LessonCard', 'Lesson card'],
  ['teacher-detail', 'TeacherDetail', 'Teacher detail'],
  ['booking-commitment', 'BookingCommitment', 'Booking commitment'],
];

/* Components: discovered from what build-ds-project.mjs wrote, so the two
   cannot fall out of step. The route is the card name kebab-cased, except
   where the Catalog files it under another name. */
const ROUTE_ALIAS = { Button: 'button-variants', Icon: 'icon-library' };

/* Cards with no Catalog route of their own. Pointing them at a neighbour's
   route makes two cards render the same page: Logo and Icon both took
   icon-library and came out byte-identical. These keep the sheet
   build-ds-project.mjs generates for them from the contracts and the icon
   manifest, which is the only place their content exists. */
const KEEP_GENERATED = new Set([
  /* CheckboxGroup and Combobox used to sit here for the same reason — no route
     of their own — and build-ds-project no longer emits a card for either. They
     are documented on the Checkbox and Select cards, which is where the Catalog
     documents them. */
  'Logo',
  /* The icon-library route is a browser, not a component demo: a size
     switcher, a search field and seven category headings, none of which work
     on a static card. The generated sheet is just the icons. */
  'Icon',
]);
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const componentTargets = () => {
  const base = join(OUT, 'components');
  if (!existsSync(base)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.html')) continue;
      const name = entry.name.replace(/\.html$/, '');
      if (KEEP_GENERATED.has(name)) continue;
      /* This walk reads the directory the script itself writes, so a card
         emitted by the foundation pass comes back as a component target on the
         next run and overwrites itself through the wrong branch. Radius lost
         its "Radius scale" section that way: the component branch splits on
         .component-doc-block, and that section is not one. */
      if (FOUNDATIONS.some(([, foundationName]) => foundationName === name)) continue;
      out.push({ name, route: ROUTE_ALIAS[name] ?? kebab(name), file: full, kind: 'component' });
    }
  };
  walk(base);
  return out;
};

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const file = join(REPO, decodeURIComponent(req.url.split('?')[0]));
  /* Read before writing the header: a miss after writeHead cannot be turned
     back into a 404. */
  let body;
  try { body = readFileSync(file); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(body);
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
/* Pattern markup carries Catalog-only classes (.filter-pattern__*, and 20 more
   for Filter alone) whose rules live in catalog.css, which the Design project
   does not ship — so the first upload landed the markup unstyled and the Filter
   modal collapsed out of its stage. Collect every class the patterns actually
   use and emit exactly the rules that match, rather than shipping the whole
   Catalog shell stylesheet. */
const usedClasses = new Set();

const TARGETS = [
  ...PATTERNS.map(([route, name, title]) => ({ route, name, title, kind: 'pattern' })),
  ...FOUNDATIONS.map(([route, name, title]) => ({ route, name, title, kind: 'foundation' })),
  ...componentTargets(),
];

for (const target of TARGETS) {
  const { route, name, kind } = target;
  const title = target.title ?? name;
  const isPattern = kind === 'pattern';
  const isFoundation = kind === 'foundation';
  /* Foundation pages are single documents, like patterns — the colour page has
     no doc blocks at all, it is one composed sheet. */
  const wholePage = isPattern || isFoundation;
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

  const { blocks, intro } = await page.evaluate(({ wholeArticle, splitSections }) => {
    /* Tooltips are hidden by CSS until their wrapper is hovered, and the card
       is a live page, so they must ship — removing them left the Tooltip card
       with twelve triggers and nothing to show. Only a tooltip the Catalog has
       actively pinned open is transient; drop that state, not the element. */
    document.querySelectorAll('.is-calendar-tooltip-active, .ui-tooltip-wrap.is-open')
      .forEach((n) => n.classList.remove('is-calendar-tooltip-active', 'is-open'));
    /* A pattern is a page-level composition, so the unit is the whole detail
       article. Splitting on .component-doc-block loses everything the route
       renders outside one: the Teacher card route puts its two cards directly
       in the article and wraps only the recommendation group, so block-wise
       extraction captured a third of it. */
    const found = [];
    if (!wholeArticle) {
      /* Components: one cell per curated demo, keeping the Catalog's own
         variants/features/states ordering. */
      for (const block of document.querySelectorAll('.component-doc-block')) {
        const html = block.querySelector('.component-doc-content')?.innerHTML?.trim() ?? '';
        if (html) found.push({ label: block.querySelector('.component-doc-header h2')?.textContent?.trim() ?? '', html });
      }
    }
    if (!found.length) {
      const detail = document.querySelector('main .component-detail, main article');
      if (detail) {
        const clone = detail.cloneNode(true);
        /* Page chrome, not the component: the kicker and intro repeat the
           prompt, and the size/shape controls belong to the Catalog shell. */
        /* Page furniture, not the component. A Catalog detail route wraps its
           demos in controls that drive the page — size and shape switchers,
           search fields, a "When To Use" button opening a modal. On a static
           card none of them do anything, so shipping them just puts dead
           chrome in front of the thing being documented. */
        clone.querySelectorAll([
          '.detail-kicker', '.intro',
          '[data-segment-value]', '.ui-segmented-control',
          '.icon-search-field', '[type="search"]',
          '[data-demo$="-usage"]', '[data-demo^="open-"]',
          /* The Timeline route wraps its demo in a reverse-order button and a
             tone switcher. Both drive the page, not the component, and both
             shipped on the card as controls that did nothing when clicked. */
          '[data-demo="ui-timeline-reverse"]', '.timeline-tone-switch',
        ].join(', ')).forEach((n) => (n.closest('.ds-page-controls, .tag-global-controls') ?? n).remove());
        /* The dialog that "When To Use" button opened. The button is gone, so
           nothing can reveal it and it renders as nothing either way.

           Named, not `[hidden]` wholesale. That swept up every collapsed thing
           on the page as well, and a collapsed thing is not dead weight — it is
           the closed half of a disclosure the card is supposed to be able to
           open. On Filter it deleted the children of five of the six lesson
           categories, so clicking them on the card did nothing: the runtime
           toggled a group whose contents the capture had thrown away, and no
           error said so. */
        clone.querySelectorAll('[class$="-usage-modal"][hidden]').forEach((n) => n.remove());

        /* One cell per section, labelled with the section's own h2.
           Color, Typography and Button are pages of three to six h2 sections;
           as a single cell they all read "Composition" — the one word on the
           card carrying no information — while every name worth reading sat a
           level down as an h2. The card's label row is the heading, so the
           names move into it and the h2 goes away. Nothing is demoted and no
           new type style is needed.

           Only the Catalog's own scaffolding counts. Footer renders its column
           titles as h2 inside .ui-footer: that is the component, not the page,
           so a heading anywhere inside kit markup is left exactly as it is. */
        const insideKitMarkup = (el) => {
          for (let n = el; n && n !== clone; n = n.parentElement) {
            for (const c of n.classList) if (c.startsWith('ui-')) return true;
          }
          return false;
        };
        /* A section's own heading, wherever the route chose to put it: Color
           writes `section > h2`, the doc blocks wrap it in a header, and Button
           captions each demo from below in a .button-doc-footer. Matching on
           position missed that last one. What actually defines the heading is
           ownership — the nearest enclosing section is this one. */
        const ownHeading = (s) => [...s.querySelectorAll('h2')]
          .find((h) => h.closest('section') === s && !insideKitMarkup(h)) ?? null;
        const headed = [...clone.querySelectorAll('section')]
          .map((s) => ({ s, h: ownHeading(s) }))
          .filter(({ h }) => h);
        const tops = headed.filter(({ s }) => !headed.some((o) => o.s !== s && o.s.contains(s)));

        if (splitSections && tops.length > 1) {
          tops.forEach(({ s }, i) => s.setAttribute('data-ds-section', String(i)));
          for (let i = 0; i < tops.length; i += 1) {
            /* Prune siblings out of a full copy rather than lifting the section
               out: layout lives on the wrapper (.color-detail, .typography-detail,
               .component-doc-grid), so a section removed from its ancestor chain
               loses the rules that position it. */
            const one = clone.cloneNode(true);
            one.querySelectorAll('[data-ds-section]')
              .forEach((n) => { if (n.dataset.dsSection !== String(i)) n.remove(); });
            const kept = one.querySelector(`[data-ds-section="${i}"]`);
            const heading = ownHeading(kept);
            const label = heading.textContent.trim();
            const holder = heading.parentElement;
            heading.remove();
            /* The wrapper the heading sat in — a header, or Button's caption
               footer — is empty once it goes, and an empty flex child still
               takes its gap. */
            if (holder !== kept && !holder.children.length && !holder.textContent.trim()) holder.remove();
            kept.removeAttribute('data-ds-section');
            found.push({ label, html: one.innerHTML.trim() });
          }
        } else {
          found.push({ label: 'Composition', html: clone.innerHTML.trim() });
        }
      }
    }
    return { blocks: found, intro: document.querySelector('main .intro')?.textContent?.trim() ?? '' };
  }, { wholeArticle: wholePage, splitSections: !isPattern });
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
  for (const b of blocks) {
    for (const m of b.html.matchAll(/class="([^"]+)"/g)) {
      for (const name of m[1].split(/\s+/)) if (name && !name.startsWith('ui-')) usedClasses.add(name);
    }
  }

  /* Most cards stand on the page colour, which is right for anything that
     carries its own surface. These six do not: a tag, a badge, a progress bar,
     a result, a segmented control and a timeline all sit on a card in real use,
     so showing them on the page grey misreads their contrast and their edges.
     They get the card colour instead. */

  const depth = isPattern ? '../../' : '../../../';
  /* Two ways an asset is addressed, and this used to rewrite only the first.
     An `="Assets/…"` is a src or href; a `url(Assets/…)` is a mask on an inline
     style, which is how a glyph that has to take currentColor is drawn — the
     Calendar's timezone pin, the Selection card's category mark, the Stepper's
     markers. Those came through untouched, so three folders down they resolved
     against the card's own directory and the mask silently matted to nothing:
     no broken-image icon, no console error, just a label with a gap where its
     pin should be. The url() form carries no quotes by contract — see
     cssUrl() in the runtime — so matching the bare form is enough. */
  const rebase = (html) => html
    .replaceAll('="Assets/', `="${depth}Assets/`)
    .replaceAll('url(Assets/', `url(${depth}Assets/`);
  const body = blocks
    .map(({ label, html }) => `  <div class="cell"><div class="cell-label">${escape(label)}</div><div class="cell-body">${rebase(html)}</div></div>`)
    .join('\n');

  /* Components keep the group marker build-ds-project.mjs derived from the
     Catalog taxonomy, and their published path, so nothing re-slugs. */
  const group = isPattern ? 'Patterns'
    : isFoundation ? 'Foundation'
    : (readFileSync(target.file, 'utf8').match(/@dsCard group="([^"]+)"/)?.[1] ?? 'Components');
  const dir = isPattern ? `patterns/${name}`
    : isFoundation ? `components/foundations/${name}`
    : dirname(target.file).slice(OUT.length + 1);
  write(`${dir}/${name}.html`, `<!-- @dsCard group="${group}" -->
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>${title} — italki UI Kit</title>
<link rel="stylesheet" href="${depth}styles.css">\n<link rel="stylesheet" href="${depth}_cards.css">
<!-- The bundle guards on window.React because its second half wraps the
     renderers for the app. A card only needs the first half — the vanilla
     runtime and its behaviour helpers — so a stub satisfies the guard without
     pulling in React itself. -->
<script>window.React={createElement:function(){return null}};/* Markup the runtime renders later — a row rebuilt by the pin controls, a
   menu row restored from the roster — cannot be rebased by this generator,
   because it does not exist yet. Tell the kit how deep the card sits and it
   addresses assets from here itself. */window.ITalkiUIAssetBase="${depth}"</script>
<script src="${depth}_ds_bundle.js" defer></script>
<script src="${depth}_cards.js" defer></script>
<style>
  *{box-sizing:border-box}
  /* The card is a page-coloured field of framed rows, which is how italki
     React DS draws the same demos — see ds/build.mjs's .ds-card / .ds-card__row.
     A demo used to sit directly on the body, so a group's boundary was a 32px
     gap and nothing else: on a card with seven of them, where each group ends
     was a guess. The frame also retires a white-stage exception list. Thirteen
     components were forced onto a white body because their own demo would
     otherwise float on grey; now every row carries its own card surface, so no
     component needs an exception. */
  body{margin:0;padding:var(--ui-space-6,24px);background:var(--ui-color-page);font-family:var(--ui-font-family);color:var(--ui-color-text)}
  /* A demo is a page-level slice of the Catalog, so each takes a full row. */
  .ds-grid{display:flex;flex-direction:column;gap:var(--ui-space-6,24px)}
  .cell{min-width:0;border:1px solid var(--ui-color-border);border-radius:var(--ui-radius-lg,12px);background:var(--ui-color-card)}
  .cell-label{font-size:12px;line-height:16px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ui-color-secondary);margin:0;padding:var(--ui-space-4,16px) var(--ui-space-6,24px) 0}
  .cell-body{padding:var(--ui-space-4,16px) var(--ui-space-6,24px) var(--ui-space-6,24px)}
  /* An open anchored overlay is positioned absolutely, so it reserves no height
     and simply covers the cell below it. On TimePicker that hid the Open and
     Disabled demos completely, and the two menus left showing read as one
     control that had opened two lists; on DatePicker it covered 176px of the
     States demo. The Catalog reserves height on its own demo blocks for this,
     which a card loses when it re-wraps the demo in .cell — so here the open
     overlay takes part in layout instead, the same treatment the Catalog's
     combobox-flow stage already uses. A card is a spec sheet: every state has
     to be readable at once, which matters more than the overlay floating. */
  .cell .ui-time-picker.is-open .ui-time-picker__menu,
  .cell .ui-date-picker.is-open .ui-date-picker__popup{position:static;margin-top:var(--ui-space-2,8px)}
  /* Calendar and TimeSlot gate their tooltips on a class the runtime adds while
     pointing at a slot, so on a static card — which ships no handlers — they
     could never appear. Let plain :hover stand in, so the card shows the same
     thing the Catalog does when you hover a slot. */
  .ui-calendar__slot .ui-tooltip-wrap:hover > .ui-tooltip,
  .ui-time-slot .ui-tooltip-wrap:hover > .ui-tooltip,
  .ui-tooltip-wrap:hover > .ui-tooltip{opacity:1;pointer-events:auto;visibility:visible}
</style>
</head><body>
<div class="ds-grid">
${body}
</div>
</body></html>
`);

  if (isFoundation) write(`${dir}/${name}.prompt.md`, `${title} — an italki Foundation page, not a component.

${intro}

These are the values every component is built from. Use the tokens, never the
literals: \`var(--ui-color-…)\`, \`var(--ui-space-…)\`, \`var(--ui-radius-…)\`,
\`var(--ui-shadow-…)\`, all defined in \`tokens/tokens.css\`. A value that is not
on these scales is off-system even when it looks right.

The rendered card is the reference.
`);
  if (isPattern) write(`${dir}/${name}.prompt.md`, `${title} — an italki product pattern, not a component.

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

  report[isStub ? 'stubs' : 'ok'].push(`${name}${isStub ? ' — spec stub, no rendering' : ` (${blocks.length})`}`);
}

await browser.close();
server.close();

/* Slice catalog.css down to the rules these patterns reference. The Catalog's
   own :root block comes along because those rules are written against
   Catalog-local variables (--space-*, --radius-card, --border …) that the
   Foundation tokens do not carry under those names. */
{
  const catalogCSS = readFileSync(join(REPO, 'catalog.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const kept = [];
  const rootBlock = catalogCSS.match(/:root\s*\{[^}]*\}/);
  if (rootBlock) kept.push(rootBlock[0]);
  /* One nesting level is enough: catalog.css only wraps rules in @media. */
  const atRule = /@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g;
  const wants = (selector) => [...usedClasses].some((c) => selector.includes(`.${c}`));
  const plain = catalogCSS.replace(atRule, '');
  for (const rule of plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (wants(rule[1])) kept.push(`${rule[1].trim()} {${rule[2]}}`);
  }
  for (const block of catalogCSS.match(atRule) ?? []) {
    const head = block.slice(0, block.indexOf('{') + 1);
    const inner = [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((r) => wants(r[1]));
    if (inner.length) kept.push(`${head}\n${inner.map((r) => `  ${r[1].trim()} {${r[2]}}`).join('\n')}\n}`);
  }
  write('_cards.js', readFileSync(join(REPO, 'maintenance/scripts/ds-cards-behaviour.js'), 'utf8'));
  write('_cards.css',
    `/* Generated by maintenance/scripts/build-ds-patterns.mjs — do not edit.\n` +
    `   The slice of catalog.css the pattern compositions depend on: ${kept.length} rules\n` +
    `   matching ${usedClasses.size} Catalog-only classes, plus the Catalog's :root. */\n` +
    kept.join('\n') + '\n');
  report.css = `${kept.length} rules for ${usedClasses.size} classes`;
}

console.log(`✓ patterns → ${OUT}/patterns`);
for (const line of report.ok) console.log(`    ${line}`);
for (const line of report.stubs) console.log(`  · ${line}`);
if (report.css) console.log(`  _patterns.css: ${report.css}`);
for (const line of report.skipped) console.log(`  ! ${line}`);
if (report.skipped.length) process.exitCode = 1;

/* ── the card index ────────────────────────────────────────────────────────
   The pane lists cards from _ds_manifest.json, not by scanning the tree, and
   the app rebuilds that file only on its own self-check.
   Written here rather than in build-ds-project, because the foundation and
   pattern cards do not exist until this pass has captured them: counting too
   early listed fifty-six of the seventy-two. Three times now a card
   has landed in the project and stayed invisible for hours — Image, List,
   SectionIntro — and hand-patching the file does not survive either: the app's
   next pass replaces it, and `build:ds` wipes it from the output folder.

   So the builder writes it. Cards and components are computed from what this
   script just emitted, which is the part that goes stale. The token list is
   parsed from the same two stylesheets the app reads, with `kind` inferred the
   way the app's own output does it — a value with a unit is spacing, a bare
   number is other, a reference to a colour token is a colour, and a name about
   type is font. If an inference is off, the pane groups one token under the
   wrong heading until the app's next self-check corrects it; a missing card is
   the worse failure of the two. */
const manifestCards = [];
{
  const walk = (dir) => {
    for (const entry of readdirSync(join(OUT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) { walk(rel); continue; }
      if (!entry.name.endsWith('.html')) continue;
      const first = readFileSync(join(OUT, rel), 'utf8').split('\n', 1)[0];
      const marker = first.match(/@dsCard group="([^"]+)"/);
      if (marker) manifestCards.push({ path: rel, group: marker[1] });
    }
  };
  for (const root of ['components', 'patterns']) if (existsSync(join(OUT, root))) walk(root);
  manifestCards.sort((a, b) => a.group.localeCompare(b.group) || a.path.localeCompare(b.path));
}

const manifestComponents = [];
{
  const walk = (dir) => {
    for (const entry of readdirSync(join(OUT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) { walk(rel); continue; }
      if (entry.name.endsWith('.jsx')) manifestComponents.push({ name: entry.name.replace(/\.jsx$/, ''), sourcePath: rel });
    }
  };
  walk('components');
  /* Kit first: it installs the runtime the wrappers resolve at render time. */
  manifestComponents.sort((a, b) => (a.name === 'Kit' ? -1 : b.name === 'Kit' ? 1 : a.sourcePath.localeCompare(b.sourcePath)));
}

const tokenKind = (name, value) => {
  if (/shadow/.test(name)) return 'shadow';
  if (/radius/.test(name)) return 'radius';
  if (/font|line-height|family|weight|-text$/.test(name)) return 'font';
  if (/^var\(--ui-color-/.test(value)) return 'color';
  if (/gradient/.test(name)) return 'other';
  if (/^(#|rgb|hsl)/.test(value)) return 'color';
  if (/^-?[\d.]+(px|%|em|rem|vh|vw)$/.test(value)) return 'spacing';
  return 'other';
};
const manifestTokens = [];
const manifestThemes = [];
{
  /* Comments first, or their prose lands in the selector: a note above a rule
     that mentions --ui- was read as a scope and turned into a theme whose label
     was three paragraphs long. */
  const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
  const sheets = [['tokens/tokens.css', strip(readFileSync(join(OUT, 'tokens/tokens.css'), 'utf8'))],
                  ['_ds_bundle.css', strip(readFileSync(join(OUT, '_ds_bundle.css'), 'utf8'))]];
  for (const [definedIn, css] of sheets) {
    /* Each rule contributes its scope, so a token redefined under the dark
       theme or on a component block is listed with the selector that sets it. */
    for (const rule of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const selector = rule[1].trim().replace(/\s+/g, ' ');
      if (!/--ui-/.test(rule[2])) continue;
      const scope = selector === ':root' || selector === 'html' ? null : selector;
      for (const decl of rule[2].matchAll(/(--ui-[\w-]+)\s*:\s*([^;]+)/g)) {
        const name = decl[1], value = decl[2].trim();
        const entry = { name, value, kind: tokenKind(name, value), definedIn };
        if (scope) entry.scope = scope;
        manifestTokens.push(entry);
      }
      /* A theme is a selector that restates the palette, not any block that
         happens to set a custom property — .ui-avatar declaring its own size is
         a component knob, and the app lists those under tokens only. */
      const theme = scope && scope.match(/^\[data-theme="([^"]+)"\]$/);
      if (theme && !manifestThemes.some((t) => t.selector === scope)) {
        manifestThemes.push({ selector: scope, label: theme[1].replace(/\b\w/, (c) => c.toUpperCase()) });
      }
    }
  }
}

const manifestTemplates = [];
{
  const base = join(REPO, 'maintenance/templates');
  if (existsSync(base)) {
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const page = readdirSync(join(base, entry.name)).find((f) => f.endsWith('.dc.html'));
      if (!page) continue;
      const src = readFileSync(join(base, entry.name, page), 'utf8');
      const marker = src.match(/@template name="([^"]*)" description="([^"]*)"/);
      if (!marker) continue;
      manifestTemplates.push({
        name: marker[1],
        /* The app stores a truncated description; matching its length keeps a
           rebuild from looking like an edit. */
        description: marker[2].slice(0, 200),
        folder: `templates/${entry.name}`,
        entryPath: `templates/${entry.name}/${page}`,
        thumbnail: { path: `templates/${entry.name}/.thumbnail`, kind: 'captured' },
      });
    }
  }
}

writeFileSync(join(OUT, '_ds_manifest.json'), `${JSON.stringify({
  namespace: 'ItalkiUI',
  components: manifestComponents,
  startingPoints: [],
  cards: manifestCards,
  templates: manifestTemplates,
  hasThumbnailHtml: true,
  globalCssPaths: ['tokens/tokens.css', '_ds_bundle.css', 'styles.css'],
  tokens: manifestTokens,
  themes: manifestThemes,
  fonts: [],
  brandFonts: [],
  source: 'build-ds-project',
})}\n`);
console.log(`  _ds_manifest.json: ${manifestCards.length} cards · ${manifestComponents.length} components · ${manifestTokens.length} tokens`);
