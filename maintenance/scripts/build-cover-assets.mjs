#!/usr/bin/env node
// Generates the branded cover the Video component's demos use.
//
// A video needs a cover, and the only landscape source in the repository was a
// portrait cropped to 16:9 — a face filling the frame, which reads as a badly
// cropped photograph rather than a thumbnail. A film still would fix the look
// and create a licensing problem in a design system that ships to Pages, to
// the Design project and into generated pages. So the cover is what italki
// already owns: Primary, and the logomark.
//
//   node maintenance/scripts/build-cover-assets.mjs
//
// No gradient. Two attempts at one were rejected for the same reason and it is
// worth recording: a gradient's endpoints can both be brand while everything
// between them is not. --ui-gradient-pro runs red to blue and passes through
// magenta; red to the ink passes through a muddy plum. Neither colour exists
// in the palette, and a cover that introduces colours is the wrong thing to
// put in front of an AI reading this system for what the brand looks like.
//
// SVG rather than a bitmap: under 1KB, crisp at any card size, and read out of
// tokens.css, so the cover cannot drift from the brand.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const OUT = path.join(root, 'Assets', 'Images', 'covers');

const tokens = fs.readFileSync(path.join(root, 'catalog-runtime', 'tokens.css'), 'utf8');
const colour = (name) => {
  const hit = tokens.match(new RegExp(`--ui-color-${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!hit) throw new Error(`No --ui-color-${name} in tokens.css`);
  return hit[1];
};

/* The logomark's own path, lifted from the approved asset so the mark on the
   cover is the mark in Assets/Icons and not a redrawing of it. */
const logomark = fs.readFileSync(path.join(root, 'Assets', 'Icons', 'logo-italki-logomark-white.svg'), 'utf8');
const markPath = logomark.match(/ d="([^"]+)"/)?.[1];
if (!markPath) throw new Error('Could not read the logomark path');

const brand = colour('primary');
const onBrand = colour('on-primary');

const cover = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="italki">
  <rect width="1280" height="720" fill="${brand}"/>
  <!-- Top-left, small: the play disc owns the middle of a video cover and the
       foot is where a title scrim lands, so the mark sits clear of both. -->
  <g transform="translate(64 56) scale(2.6)" opacity="0.9">
    <path fill-rule="evenodd" clip-rule="evenodd" d="${markPath}" fill="${onBrand}"/>
  </g>
</svg>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'teacher-intro.svg'), cover);
console.log(`teacher-intro.svg → ${cover.length}B · ${brand} + logomark`);
