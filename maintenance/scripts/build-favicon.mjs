#!/usr/bin/env node
// Generates the browser-tab icon from the approved logomark.
//
//   node maintenance/scripts/build-favicon.mjs
//
// Three files, because a tab icon is asked for in three ways:
//
//   favicon.svg          — what every current browser actually uses. Crisp at
//                          any size, and it is the logomark's own path, so the
//                          tab cannot drift from Assets/Icons.
//   favicon-32.png       — the fallback for anything that ignores an SVG icon.
//   apple-touch-icon.png — the home-screen tile. iOS composites onto black,
//                          so this one cannot be transparent; it is the brand
//                          tile with the white mark, the treatment the video
//                          cover already established.
//
// The mark is 32x40. A favicon is scaled to fit a square, so it is padded to a
// square here rather than letterboxed by the browser: the mark keeps its
// proportions and gets the full height of the tab.
//
// The tab icon is left transparent on purpose. The mark's body is white and
// its outline is Primary, so it reads as the outlined mark on a light tab bar
// and as the filled mark on a dark one — a red tile would only be right if the
// icon were the tile, which is what the touch icon is for.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const ICONS = path.join(root, 'Assets', 'Icons');

const tokens = fs.readFileSync(path.join(root, 'catalog-runtime', 'tokens.css'), 'utf8');
const colour = (name) => {
  const hit = tokens.match(new RegExp(`--ui-color-${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!hit) throw new Error(`No --ui-color-${name} in tokens.css`);
  return hit[1];
};
const brand = colour('primary');
const onBrand = colour('on-primary');

/* Lifted from the approved assets so the tab shows the mark in Assets/Icons
   and not a redrawing of it. */
const inner = fs
  .readFileSync(path.join(ICONS, 'logo-italki-logomark.svg'), 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim();
const white = fs.readFileSync(path.join(ICONS, 'logo-italki-logomark-white.svg'), 'utf8');
const markPath = white.match(/ d="([^"]+)"/)?.[1];
if (!markPath) throw new Error('Could not read the logomark path');

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" role="img" aria-label="italki">
  <g transform="translate(4 0)">
${inner.split('\n').map((line) => `    ${line.trim()}`).join('\n')}
  </g>
</svg>
`;
fs.writeFileSync(path.join(ICONS, 'favicon.svg'), favicon);

/* The tile: 180 is the size iOS asks for, and the mark sits at 60% of it so it
   is not crowded by the rounding iOS applies. */
const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="italki">
  <rect width="180" height="180" fill="${brand}"/>
  <g transform="translate(46 36) scale(2.7)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="${markPath}" fill="${onBrand}"/>
  </g>
</svg>
`;

const browser = await chromium.launch();
const shoot = async (svg, size, out, transparent) => {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await page.screenshot({ path: path.join(ICONS, out), omitBackground: transparent });
  await page.close();
  console.log(`${out} → ${size}x${size}`);
};
await shoot(favicon, 32, 'favicon-32.png', true);
await shoot(touch, 180, 'apple-touch-icon.png', false);
await browser.close();

console.log(`favicon.svg → ${favicon.length}B · logomark, transparent`);
