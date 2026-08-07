import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

/* Compares every Design card against the Catalog route it is supposed to
   reproduce, so drift is found here rather than by the person reading the
   published project.

   Four questions per card, each one a defect a screenshot would show:
     coverage  — does the card render the states the Catalog route renders?
     integrity — does anything overflow, clip, 404, or fail to paint?
     styling   — is anything landing with no styles (a class whose rules were
                 never shipped, which is how the Filter pattern collapsed)?
     identity  — is this card a copy of another one?
     hover     — do the tooltips actually reveal? The extractor once stripped
                 every bubble, leaving the Tooltip card with twelve triggers
                 and nothing behind them, and no static check saw it. */

const REPO = process.argv[2];
const STAGE = process.argv[3];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

const serve = (root, port) => new Promise((done) => {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(root, rel);
    fs.readFile(file, (err, body) => {
      /* Assets live in the repository, not in the staged project — the upload
         copies them in. Serving the stage alone reported a 404 for every icon
         on 43 of 71 cards, which reads as a real regression and is not one. */
      const send = (e2, b2) => {
        if (e2) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
        res.end(b2);
      };
      if (err) fs.readFile(path.join(REPO, rel), send); else send(null, body);
    });
  });
  server.listen(port, () => done(server));
});

/* Card path → the Catalog route that is its source of truth. */
const ROUTE = {
  Button: 'button-variants', SegmentedControl: 'segmented-control', DropdownMenu: 'dropdown-menu',
  TopNav: 'top-nav', TextInput: 'text-input', NumberStepper: 'number-stepper',
  FormField: 'form-field', DatePicker: 'date-picker', TimePicker: 'time-picker',
  TimeSlot: 'time-slot', Icon: 'icon-library',
};
/* Cards the Catalog has no page for — their content is generated from the
   contracts and the icon manifest, so there is no route to compare against.
   Integrity and duplicate checks still apply; coverage does not. */
const NO_ROUTE = new Set(['Logo', 'CheckboxGroup', 'Combobox']);
/* Routes whose page controls the card strips on purpose. */
const FURNITURE_ROUTES = new Set(['color', 'icon-library', 'sidebar', 'chip', 'tag', 'button-variants',
  'select', 'date-picker', 'form-field', 'number-stepper', 'search', 'text-input', 'textarea']);
const routeFor = (name) => ROUTE[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const measure = (root) => {
  const scope = root === 'catalog' ? document.querySelector('main') : document.body;
  if (!scope) return null;
  /* Every Catalog detail route carries page controls — the size/shape
     segmented control, the icon-library search box — that belong to the shell,
     not the component. Count only what sits inside a demo. */
  const demos = root === 'catalog'
    ? [...scope.querySelectorAll('.component-doc-content')]
    : [...scope.querySelectorAll('.cell-body')];
  const inDemos = demos.length ? demos : [scope];
  const kinds = new Set();
  for (const demo of inDemos) {
    for (const n of demo.querySelectorAll('[data-component]')) kinds.add(n.dataset.component);
  }
  let painted = 0, unstyled = 0, overflow = 0, offpage = 0;
  const pageW = document.documentElement.clientWidth;
  for (const n of scope.querySelectorAll('*')) {
    const r = n.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(n);
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
    painted++;
    if (r.right > pageW + 2 || r.left < -2) offpage++;
    /* A block-level class that computes to plain inline with no box is the
       signature of markup whose stylesheet never shipped. */
    const cls = (n.className || '').toString();
    if (cls && !cls.includes('ui-') && n.children.length > 1
        && cs.display === 'inline' && cs.padding === '0px' && cs.margin === '0px') unstyled++;
  }
  const cells = scope.querySelectorAll('.cell, .icon-tile').length;
  return { kinds: [...kinds].sort(), painted, unstyled, offpage, cells,
           text: (scope.innerText || '').replace(/\s+/g, ' ').trim().length };
};

const catalogServer = await serve(REPO, 4460);
const cardServer = await serve(STAGE, 4461);
const browser = await chromium.launch();

const cards = [];
for (const root of ['components', 'patterns']) {
  const base = path.join(STAGE, root);
  if (!fs.existsSync(base)) continue;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.html')) cards.push(path.relative(STAGE, full));
    }
  })(base);
}

const findings = [];
const fingerprints = new Map();
for (const rel of cards.sort()) {
  const name = path.basename(rel, '.html');
  const route = NO_ROUTE.has(name) ? null : routeFor(name);

  const cardPage = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const broken = [];
  cardPage.on('response', (r) => { if (r.status() >= 400) broken.push(r.url().split('/').pop()); });
  const errors = [];
  cardPage.on('pageerror', (e) => errors.push(e.message));
  await cardPage.goto(`http://127.0.0.1:4461/${rel}`, { waitUntil: 'networkidle' });
  await cardPage.waitForTimeout(120);
  const card = await cardPage.evaluate(measure, 'card');

  /* Hover a few wrappers for real: a tooltip that never reveals is invisible
     to any check of the markup alone. */
  let hoverTried = 0, hoverShown = 0;
  for (const wrap of (await cardPage.$$('.ui-tooltip-wrap')).slice(0, 3)) {
    const bubble = await wrap.$('.ui-tooltip');
    if (!bubble) continue;
    /* A wrapper the kit deliberately silences is not a failure to reveal. */
    if (await wrap.evaluate((n) => n.classList.contains('is-tooltip-disabled'))) continue;
    hoverTried++;
    try {
      /* Park the pointer first: Calendar's 15-minute strips are 10px tall, so
         the bubble from the previous hover sits over the next one and the
         check would blame the card for the test's own leftovers. */
      await cardPage.mouse.move(0, 0);
      await cardPage.waitForTimeout(60);
      await wrap.hover({ timeout: 1500 });
      /* Calendar slots delay their tooltip by 350ms so scrubbing across a week
         does not strobe, and the fade runs after that. Poll instead of
         guessing a single wait, or the check reports a working tooltip as
         broken because it looked mid-transition. */
      let shown = false;
      for (let i = 0; i < 12 && !shown; i++) {
        await cardPage.waitForTimeout(80);
        shown = await bubble.evaluate((n) => {
          const cs = getComputedStyle(n);
          return Number(cs.opacity) > 0.5 && cs.visibility !== 'hidden';
        });
      }
      if (shown) hoverShown++;
    } catch { /* not hoverable at this viewport; counted as not shown */ }
  }
  await cardPage.close();

  let catalog = null;
  const catalogPage = route ? await browser.newPage({ viewport: { width: 1440, height: 1400 } }) : null;
  if (catalogPage) { await catalogPage.goto(`http://127.0.0.1:4460/index.html?route=${route}#${route}`, { waitUntil: 'load' });
  try {
    await catalogPage.waitForFunction(
      () => (document.querySelector('main')?.innerText ?? '').trim().length > 0,
      undefined, { timeout: 10000 },
    );
    await catalogPage.waitForTimeout(350);
    catalog = await catalogPage.evaluate(measure, 'catalog');
  } catch { /* route missing — reported below */ }
  await catalogPage.close(); }

  const issues = [];
  if (broken.length) issues.push(`404 ×${broken.length} (${[...new Set(broken)].slice(0, 2).join(', ')})`);
  if (errors.length) issues.push(`JS error: ${errors[0].slice(0, 50)}`);
  if (!card || card.painted === 0) issues.push('renders nothing');
  if (card?.offpage) issues.push(`${card.offpage} element(s) off-page`);
  if (card?.unstyled) issues.push(`${card.unstyled} element(s) look unstyled`);
  if (hoverTried && hoverShown < hoverTried) issues.push(`tooltip does not reveal on hover (${hoverShown}/${hoverTried})`);
  if (route && !catalog) issues.push(`no Catalog route "${route}"`);
  else if (catalog && card) {
    /* Cards deliberately drop the Catalog's page furniture — the size and
       shape switchers, the icon search field, the "When To Use" button and
       its modal. Reporting those every run would bury a real omission. */
    const FURNITURE = new Set(['segmented-control', 'search', 'modal', 'button']);
    const missing = catalog.kinds
      .filter((k) => !card.kinds.includes(k))
      .filter((k) => !(FURNITURE.has(k) && FURNITURE_ROUTES.has(route)));
    if (missing.length) issues.push(`missing component kinds: ${missing.join(', ')}`);
    /* Text is a blunt proxy, but a card at a third of its route's content is
       not showing what the route shows. */
    if (catalog.text > 200 && card.text < catalog.text * 0.45) {
      issues.push(`content thin: ${card.text} vs ${catalog.text} chars`);
    }
  }
  /* Two cards rendering the same page is invisible to every check above —
     both are full, both match their route. Icon and Logo shipped byte-identical
     because they were pointed at the same route. */
  const body = fs.readFileSync(path.join(STAGE, rel), 'utf8').replace(/^.*?<body>/s, '');
  const seen = fingerprints.get(body);
  if (seen) issues.push(`identical to ${seen}`); else fingerprints.set(body, name);

  if (issues.length) findings.push({ name, route, issues });
}

await browser.close();
catalogServer.close();
cardServer.close();

console.log(`${cards.length} cards compared against their Catalog routes\n`);
if (!findings.length) {
  console.log('no discrepancies');
} else {
  for (const f of findings) {
    console.log(`  ${f.name}  (route: ${f.route ?? 'none — generated'})`);
    for (const i of f.issues) console.log(`      · ${i}`);
  }
  console.log(`\n${findings.length} card(s) with findings`);
}
