#!/usr/bin/env node
/* Two questions the existing checks do not ask.

   lint:foundation reads the system stylesheets, and audit:ds compares each card
   against its Catalog route. Neither looks at the places a page is actually
   written: inline style attributes, a template's own stylesheet, and markup
   hand-rolled in the shape of a component that already exists. Both templates
   and the Catalog's card sources are full of both, and neither shows up as a
   failure anywhere — the page looks right, so nothing objects.

   What it reports:

   1. A literal where a token exists. Colours are the clear case: a hex in a
      style attribute is a value that will not follow the Foundation when the
      Foundation moves. Spacing, radius and type are reported only when the
      value is off-scale, because an on-scale literal is a missed token, not a
      broken one — worth knowing, not worth stopping for.

   2. Markup wearing a component's classes. `<span class="ui-avatar …">` written
      by hand renders correctly today and silently stops tracking the component
      the moment the component changes. The component list is read from the
      contract, so this cannot drift from what the kit actually ships.

     npm --prefix maintenance run audit:adherence
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(fileURLToPath(import.meta.url), '../../..');
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

// ── the Foundation, parsed rather than restated ───────────────────────────
const tokens = read('catalog-runtime/tokens.css');
const scale = (prefix) => new Set(
  [...tokens.matchAll(new RegExp(`--ui-${prefix}-[\\w-]+:\\s*([\\d.]+)px`, 'g'))].map((m) => m[1]),
);
const SPACE = scale('space');
const RADIUS = scale('radius');
const TYPE = new Set([...tokens.matchAll(/--ui-font-size-[\w-]+:\s*([\d.]+)px/g)].map((m) => m[1]));
const COLOUR_TOKENS = [...tokens.matchAll(/--ui-color-([\w-]+):\s*([^;]+);/g)]
  .map(([, name, value]) => ({ name, value: value.trim().toLowerCase() }));

/* A hex that a token already names is a different finding from one nobody has:
   the first has an obvious replacement, the second is a colour outside the
   palette. Both are reported; only the first can be fixed mechanically. */
const tokenForColour = (hex) => COLOUR_TOKENS.find((t) => t.value === hex.toLowerCase())?.name ?? null;

// ── the components, read from the contract ────────────────────────────────
const contracts = JSON.parse(read('catalog-runtime/contracts.json'));
const COMPONENT_KEYS = Object.keys(contracts.components);
/* The kit's block class is `ui-` plus the contract key. Longest first, so
   `ui-time-slot` is not reported as `ui-time`. */
const BLOCKS = COMPONENT_KEYS
  .map((key) => ({ key, cls: 'ui-' + key }))
  .sort((a, b) => b.cls.length - a.cls.length);

// ── inputs ────────────────────────────────────────────────────────────────
const templates = fs.readdirSync(path.join(REPO, 'maintenance/templates'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .flatMap((e) => fs.readdirSync(path.join(REPO, 'maintenance/templates', e.name))
    .filter((f) => f.endsWith('.dc.html') || f.endsWith('.css'))
    .map((f) => `maintenance/templates/${e.name}/${f}`));
const SOURCES = [...templates, 'index.html'];

const findings = [];
const add = (file, line, kind, detail) => findings.push({ file, line, kind, detail });

for (const rel of SOURCES) {
  const text = read(rel);
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    const at = i + 1;

    /* Colours, but only where a colour is being applied. The Foundation's own
       cards are tables of literal hex — that is their subject matter, not a
       hardcoded value — and an earlier pass reported all eighty of them. What
       matters is a hex inside a declaration: that one stops following the
       Foundation the day the Foundation moves. */
    for (const m of line.matchAll(/(color|background|background-color|border|border-\w+|box-shadow|fill|stroke|outline)\s*:\s*([^;"'`]*#[0-9a-fA-F]{3,8}[^;"'`]*)/g)) {
      for (const hex of m[2].matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (m[2].slice(0, hex.index).includes('var(--ui-')) continue;
        const named = tokenForColour(hex[0]);
        add(rel, at, 'colour', named
          ? `${m[1]}: ${hex[0]} — this is --ui-color-${named}`
          : `${m[1]}: ${hex[0]} — not in the palette`);
      }
    }
    for (const m of line.matchAll(/\brgb\(\s*\d+[\s,]/g)) {
      /* rgb(… / …%) is the shadow/scrim idiom the system itself uses. */
      if (/rgb\([^)]*\/\s*[\d.]+%/.test(line.slice(m.index))) continue;
      add(rel, at, 'colour', `${line.slice(m.index, m.index + 24).trim()}… — literal rgb()`);
    }

    // Off-scale geometry, inside style attributes and CSS declarations alike.
    for (const m of line.matchAll(/(padding|margin|gap|top|left|right|bottom)(-\w+)?:\s*([^;"']+)/g)) {
      for (const px of m[3].matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)px/g)) {
        if (m[3].includes('calc(') || SPACE.has(px[1]) || px[1] === '1') continue;
        add(rel, at, 'spacing', `${m[1]}${m[2] ?? ''}: ${px[1]}px — off the spacing scale`);
      }
    }
    for (const m of line.matchAll(/border-radius:\s*([^;"']+)/g)) {
      for (const px of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) {
        if (RADIUS.has(px[1])) continue;
        add(rel, at, 'radius', `border-radius: ${px[1]}px — off the radius scale`);
      }
    }
    for (const m of line.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) {
      if (TYPE.has(m[1])) continue;
      add(rel, at, 'type', `font-size: ${m[1]}px — off the type scale`);
    }

    /* Markup in a component's shape. Only class attributes count: the same
       string inside a comment or a selector is not a mount. */
    for (const attr of line.matchAll(/class="([^"]*)"/g)) {
      const classes = attr[1].split(/\s+/);
      const hit = BLOCKS.find((b) => classes.includes(b.cls));
      if (hit) add(rel, at, 'hand-written', `${hit.cls} — the ${hit.key} component renders this`);
    }
  });
}

// ── report ────────────────────────────────────────────────────────────────
const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}
const LABEL = {
  colour: '硬编码颜色', spacing: '间距不在尺度上', radius: '圆角不在尺度上',
  type: '字号不在尺度上', 'hand-written': '手写了组件的标记',
};

console.log(`检查了 ${SOURCES.length} 个文件\n`);
for (const [file, rows] of byFile) {
  const byKind = new Map();
  for (const r of rows) {
    if (!byKind.has(r.kind)) byKind.set(r.kind, []);
    byKind.get(r.kind).push(r);
  }
  console.log(`${file}  —  ${rows.length} 处`);
  for (const [kind, group] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${LABEL[kind]} ×${group.length}`);
    const seen = new Set();
    for (const r of group) {
      if (seen.has(r.detail)) continue;
      seen.add(r.detail);
      if (seen.size > 6) { console.log(`    …还有 ${group.length - 6} 处`); break; }
      console.log(`    ${String(r.line).padStart(5)}  ${r.detail}`);
    }
  }
  console.log('');
}
console.log(findings.length ? `合计 ${findings.length} 处` : '没有发现');
