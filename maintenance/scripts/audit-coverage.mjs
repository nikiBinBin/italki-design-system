#!/usr/bin/env node
/* Does everything the design system claims to have actually reach the project?

   Three components landed in the Catalog and stayed invisible in the pane for
   hours each — the Image foundation, List, Section intro. Every time the shape
   was the same: the renderer, the contract and the Catalog route all existed,
   and one registration line did not. Nothing failed. The Catalog looked right,
   the build said nothing, and the gap only surfaced when someone went looking
   for a component and could not find it.

   This asks the question that catches all three, and it asks it of the artefacts
   rather than of anyone's memory:

     · every contract key is registered as a component, or exempted here
     · every registered component produced a card and a wrapper
     · every Catalog route has a card, allowing for the builder's own aliases
     · every Foundation route is registered with the card builder
     · the manifest and the tree agree in both directions

     npm --prefix maintenance run audit:coverage
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(fileURLToPath(import.meta.url), '../../..');
const OUT = path.join(REPO, 'maintenance/ds-project');
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

/* Documented absences. A key belongs here only with a reason, because the whole
   point of the audit is that an unexplained absence fails. */
const EXEMPT = new Map([
  ['checkbox-group', 'documented on the Checkbox card; the component ships, the card was merged'],
  ['combobox', 'documented on the Select card; the component ships, the card was merged'],
]);

const findings = [];
const note = (what) => findings.push(what);

// ── what the kit declares ─────────────────────────────────────────────────
const contracts = Object.keys(JSON.parse(read('catalog-runtime/contracts.json')).components);

// ── what the builder registers ────────────────────────────────────────────
const projectSrc = read('maintenance/scripts/build-ds-project.mjs');
const componentsBlock = projectSrc.slice(
  projectSrc.indexOf('const COMPONENTS = ['),
  projectSrc.indexOf('\n];', projectSrc.indexOf('const COMPONENTS = [')),
);
const registered = [...componentsBlock.matchAll(/\[\s*'([A-Za-z]+)',\s*'(\w+)',\s*'([\w-]+)',\s*'([\w-]+)'\s*\]/g)]
  .map((m) => ({ name: m[1], fn: m[2], key: m[3], slug: m[4] }));
const registeredKeys = new Set(registered.map((r) => r.key));

for (const key of contracts) {
  if (registeredKeys.has(key) || EXEMPT.has(key)) continue;
  note(`contract "${key}" is not registered in build-ds-project — no card, no wrapper`);
}

// ── what the build actually produced ──────────────────────────────────────
const walk = (dir, ext) => {
  const out = [];
  const step = (d) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) step(full);
      else if (entry.name.endsWith(ext)) out.push(path.relative(OUT, full));
    }
  };
  step(path.join(OUT, dir));
  return out;
};
const cardFiles = [...walk('components', '.html'), ...walk('patterns', '.html')];
const wrapperNames = new Set(walk('components', '.jsx').map((f) => path.basename(f, '.jsx')));
const cardNames = new Set(cardFiles.map((f) => path.basename(f, '.html')));

if (!cardFiles.length) {
  note('no cards found under maintenance/ds-project — run npm run build:ds first');
} else {
  for (const r of registered) {
    if (!cardNames.has(r.name) && !EXEMPT.has(r.key)) note(`${r.name} is registered but produced no card`);
    if (!wrapperNames.has(r.name)) note(`${r.name} is registered but produced no wrapper`);
  }
}

// ── every Catalog route reaches a card ────────────────────────────────────
/* Two routes are documented under another card's name; the card builder maps
   them, so they are not gaps. */
const ROUTE_ALIAS = new Map([['icon library', 'Icon'], ['button variants', 'Button']]);
const catalog = read('index.html');
const groupsStart = catalog.indexOf('const groups = [');
const groupsEnd = catalog.indexOf('const navigationComponents', groupsStart);
const routes = [];
for (const m of catalog.slice(groupsStart, groupsEnd).matchAll(/title:\s*"([^"]+)"[\s\S]{0,400}?parse\("([^"]*)"\)/g)) {
  if (m[1] === 'Principles') continue;
  for (const entry of m[2].split(';')) {
    const label = entry.split('|')[0].trim();
    if (label) routes.push({ group: m[1], label });
  }
}
const nav = catalog.match(/const navigationComponents = parse\("([^"]*)"\)/);
if (nav) for (const entry of nav[1].split(';')) {
  const label = entry.split('|')[0].trim();
  if (label) routes.push({ group: 'Navigation', label });
}
const flatten = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const cardKeys = new Set([...cardNames].map(flatten));
for (const route of routes) {
  const alias = ROUTE_ALIAS.get(route.label.toLowerCase());
  if (alias) { if (!cardNames.has(alias)) note(`route "${route.label}" maps to ${alias}, which has no card`); continue; }
  if (cardKeys.has(flatten(route.label))) continue;
  if (EXEMPT.has(flatten(route.label).replace(/group$/, '-group'))) continue;
  note(`Catalog route "${route.group}/${route.label}" has no card`);
}

// ── Foundation routes are registered with the card builder ────────────────
const cardsSrc = read('maintenance/scripts/build-ds-cards.mjs');
const foundationsBlock = cardsSrc.slice(
  cardsSrc.indexOf('const FOUNDATIONS = ['),
  cardsSrc.indexOf('\n];', cardsSrc.indexOf('const FOUNDATIONS = [')),
);
const foundationRoutes = new Set([...foundationsBlock.matchAll(/\[\s*'([\w-]+)'/g)].map((m) => m[1]));
/* Only as a diagnosis, not a second failure. Icon library reaches its card
   through the component path rather than this list, so a missing entry only
   matters when the route has no card at all — which is what the Image
   foundation looked like. */
for (const route of routes.filter((r) => r.group === 'Foundation')) {
  const alias = ROUTE_ALIAS.get(route.label.toLowerCase());
  if (alias ? cardNames.has(alias) : cardKeys.has(flatten(route.label))) continue;
  const slug = route.label.toLowerCase().replace(/\s+/g, '-');
  if (!foundationRoutes.has(slug)) note(`Foundation route "${route.label}" has no card and is not in build-ds-cards FOUNDATIONS — that list is why`);
}

// ── the manifest and the tree agree ───────────────────────────────────────
const manifestPath = path.join(OUT, '_ds_manifest.json');
if (!fs.existsSync(manifestPath)) {
  note('_ds_manifest.json was not written — the pane lists cards from it, so nothing new appears without it');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const listed = new Set(manifest.cards.map((c) => c.path));
  for (const file of cardFiles) if (!listed.has(file)) note(`${file} is a card but is missing from the manifest`);
  for (const entry of manifest.cards) if (!cardFiles.includes(entry.path)) note(`manifest lists ${entry.path}, which does not exist — the pane renders "file not found"`);
  const wrappers = new Set(walk('components', '.jsx'));
  for (const c of manifest.components) if (!wrappers.has(c.sourcePath)) note(`manifest lists component ${c.name} at ${c.sourcePath}, which does not exist`);
}

// ── report ────────────────────────────────────────────────────────────────
console.log(`契约 ${contracts.length} 个 · 登记 ${registered.length} 个 · 卡片 ${cardFiles.length} 张 · 包装器 ${wrapperNames.size} 个 · Catalog 路由 ${routes.length} 个`);
if (EXEMPT.size) {
  console.log(`\n已登记豁免 ${EXEMPT.size} 项:`);
  for (const [key, why] of EXEMPT) console.log(`  ${key} — ${why}`);
}
if (findings.length) {
  console.log(`\n覆盖缺口 ${findings.length} 处:`);
  for (const f of findings) console.log(`  ${f}`);
  process.exit(1);
}
console.log('\n没有覆盖缺口：每个契约都有卡片和包装器，每个路由都到得了卡片，manifest 与产物两边对齐');
