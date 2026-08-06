#!/usr/bin/env node
// Rewrites font-size / line-height / font-weight literals to Foundation tokens.
//
// The typography tokens landed after the stylesheets were written, so 916
// declarations still carried the literal even though a token for it now
// exists. Tokens nothing references are not a Foundation — they are a second
// place for the same number to drift from.
//
// Only values with an exact token are rewritten. Unitless ratios (the price
// tier's 1.2) and `inherit` keep their literal because no token expresses
// them. calc() operands are untouched for free: each pattern matches only a
// literal sitting directly after the property, so a derivation keeps its
// arithmetic visible, which is what lint-foundation.mjs audits.
//
//   node maintenance/scripts/migrate-type-tokens.mjs [--check]
//
// --check reports what would change and exits non-zero if anything would,
// which is how the build can tell that a new literal has crept in.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const check = process.argv.includes('--check');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const TARGETS = ['catalog-runtime/italki-ui.css', 'catalog.css'];

/* The token tables, parsed from the Foundation rather than restated. */
const tokens = read('catalog-runtime/tokens.css');
const pxTokens = (prefix) => new Map(
  [...tokens.matchAll(new RegExp(`(--ui-${prefix}-[a-z0-9]+):\\s*([0-9]+)px`, 'g'))]
    .map((m) => [Number(m[2]), m[1]]),
);
const weightTokens = new Map(
  [...tokens.matchAll(/(--ui-font-weight-[a-z]+):\s*([0-9]+)/g)].map((m) => [Number(m[2]), m[1]]),
);
const sizeTokens = pxTokens('font-size');
const heightTokens = pxTokens('line-height');

if (!sizeTokens.size || !heightTokens.size || !weightTokens.size) {
  throw new Error('No typography tokens found in tokens.css');
}

const RULES = [
  ['font-size', /(font-size:\s*)(\d+)px(?![\w-])/g, sizeTokens],
  ['line-height', /(line-height:\s*)(\d+)px(?![\w-])/g, heightTokens],
  ['font-weight', /(font-weight:\s*)(\d+)(?![\w.-])/g, weightTokens],
];

let changed = 0;
const missing = new Map();

for (const file of TARGETS) {
  const before = read(file);
  let after = before;
  for (const [, pattern, table] of RULES) {
    after = after.replace(pattern, (whole, head, value) => {
      const token = table.get(Number(value));
      if (!token) {
        missing.set(`${whole.trim()}`, (missing.get(whole.trim()) ?? 0) + 1);
        return whole;
      }
      changed++;
      return `${head}var(${token})`;
    });
  }
  if (after !== before && !check) fs.writeFileSync(path.join(root, file), after);
}

if (missing.size) {
  console.log('Values with no token (left as literals):');
  for (const [value, count] of [...missing].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${value}  ×${count}`);
  }
}

if (check) {
  console.log(changed ? `${changed} literal(s) could use a token` : 'No typography literals left');
  process.exitCode = changed ? 1 : 0;
} else {
  console.log(`Rewrote ${changed} typography literal(s) to tokens`);
}
