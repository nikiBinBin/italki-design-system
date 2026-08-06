#!/usr/bin/env node
// Generates the illustrated avatars the Catalog's image-backed demos use.
//
// The photographs that used to fill these slots were removed on purpose, and
// the demos fell back to Assets/Icons/user.svg — a 24px glyph that object-fit
// stretches edge to edge, so the Avatar card read as a broken icon rather than
// an avatar. Pointing at a hosted avatar service is not an option either: the
// Catalog is a static GitHub Pages site, the Design cards are static HTML with
// no scripting, and the visual regression suite runs offline, so a remote URL
// fails in all three.
//
// So the portraits are drawn here: deterministic SVG built from the Foundation
// palette, about 1KB each, no third-party licence and no real person's
// likeness. Same seed always yields the same face, so a demo does not change
// identity between builds.
//
//   node maintenance/scripts/build-avatar-assets.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const OUT = path.join(root, 'Assets', 'Images', 'avatars');

/* Every colour is a Foundation token's value, resolved here because an SVG
   file cannot reference a CSS custom property. */
const tokens = fs.readFileSync(path.join(root, 'catalog-runtime', 'tokens.css'), 'utf8');
const token = (name) => {
  const hit = tokens.match(new RegExp(`--ui-color-${name}:\\s*(#[0-9A-Fa-f]{3,8})`));
  if (!hit) throw new Error(`No --ui-color-${name} in tokens.css`);
  return hit[1];
};

const BACKDROPS = ['accessory-2', 'accessory-1', 'accessory-3', 'accessory-4', 'info-surface', 'success-surface'].map(token);
/* Skin and hair are outside the Foundation — it has no illustration ramp — so
   they are stated here, as the one place the palette is authored. */
const SKIN = ['#F2C9A8', '#E0A87E', '#C68B60', '#96603D', '#6E432A', '#F7D9C4'];
const HAIR = ['#2E2A28', '#4A3728', '#7A4B2A', '#1F1B1A', '#5C5350', '#8C6239'];
const SHIRT = ['primary', 'info', 'available', 'warning', 'primary-hover', 'success'].map(token);

/* A small deterministic hash, so "teacher-rachel" always gets the same face. */
const seedOf = (name) => {
  let h = 2166136261;
  for (const ch of name) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return Math.abs(h);
};
const pick = (list, seed, salt) => list[(Math.floor(seed / salt)) % list.length];

/* viewBox 0 0 96 96, drawn to fill the frame: the avatar clips it to a circle,
   and object-fit: cover then has a square to work with instead of a glyph. */
function portrait(name) {
  const seed = seedOf(name);
  const backdrop = pick(BACKDROPS, seed, 1);
  const skin = pick(SKIN, seed, 7);
  const hair = pick(HAIR, seed, 31);
  const shirt = pick(SHIRT, seed, 131);
  const long = seed % 2 === 0;
  const fringe = seed % 3 === 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="Illustrated avatar">
  <rect width="96" height="96" fill="${backdrop}"/>
  ${long ? `<path d="M24 52c0-16 8-28 24-28s24 12 24 28v26H24z" fill="${hair}"/>` : ''}
  <path d="M30 78c0-11 8-18 18-18s18 7 18 18v18H30z" fill="${shirt}"/>
  <rect x="41" y="47" width="14" height="14" rx="7" fill="${skin}"/>
  <ellipse cx="48" cy="38" rx="15" ry="17" fill="${skin}"/>
  <path d="M33 36c0-10 6-16 15-16s15 6 15 16c0-4-3-6-6-7-3 3-9 4-15 4-4 0-7 1-9 3z" fill="${hair}"/>
  ${fringe ? `<path d="M33 36c3-4 9-6 15-6s12 2 15 6c0-10-6-16-15-16s-15 6-15 16z" fill="${hair}"/>` : ''}
</svg>
`;
}

/* The names the Catalog and the fixtures reference. */
const NAMES = [
  'teacher-bob', 'teacher-rachel', 'teacher-james',
  'teacher-lucia', 'teacher-maya', 'lesson-card-sunshine',
];

fs.mkdirSync(OUT, { recursive: true });
let bytes = 0;
for (const name of NAMES) {
  const svg = portrait(name);
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  bytes += svg.length;
}
console.log(`${NAMES.length} avatars → Assets/Images/avatars (${Math.round(bytes / NAMES.length)}B each)`);
