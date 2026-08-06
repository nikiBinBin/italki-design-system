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
  const style = seed % 4;          // 0 long · 1 bob · 2 short · 3 bun
  const id = name.replace(/[^a-z0-9]/gi, '');

  /* Shading is the same hue darkened, so a portrait never introduces a colour
     the palette does not have. */
  const shade = (hex, amount) => '#' + hex.slice(1).match(/../g)
    .map((c) => Math.max(0, Math.round(parseInt(c, 16) * amount)).toString(16).padStart(2, '0')).join('');

  const backHair = {
    0: `<path d="M22 54c0-19 10-32 26-32s26 13 26 32v30H22z"/>`,
    1: `<path d="M25 50c0-17 9-28 23-28s23 11 23 28v18c0 5-4 8-9 7-4-1-6-5-6-10H40c0 5-2 9-6 10-5 1-9-2-9-7z"/>`,
    2: '',
    3: `<circle cx="48" cy="17" r="9"/><path d="M26 52c0-18 9-30 22-30s22 12 22 30v8H26z"/>`,
  }[style];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="Illustrated avatar">
  <defs>
    <clipPath id="f${id}"><rect width="96" height="96"/></clipPath>
    <linearGradient id="b${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${backdrop}"/><stop offset="1" stop-color="${shade(backdrop, 0.94)}"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#f${id})">
    <rect width="96" height="96" fill="url(#b${id})"/>
    ${backHair ? `<g fill="${hair}">${backHair}</g>` : ''}
    <path d="M48 62c14 0 25 10 27 24l1 10H20l1-10c2-14 13-24 27-24z" fill="${shirt}"/>
    <path d="M48 62c5 0 9 1 13 3l-6 8-7 5-7-5-6-8c4-2 8-3 13-3z" fill="${shade(shirt, 0.88)}"/>
    <path d="M41 50h14v13a7 7 0 0 1-14 0z" fill="${shade(skin, 0.92)}"/>
    <ellipse cx="48" cy="40" rx="16" ry="18" fill="${skin}"/>
    <path d="M32 40c0-11 7-18 16-18s16 7 16 18c0 3-1 6-2 8 1-6 0-10-2-13-4 3-11 4-18 3-4 0-7 2-8 5-1 2-2 4-2 5-1-2-2-5-2-8z" fill="${hair}"/>
    <ellipse cx="42" cy="40" rx="1.6" ry="2.1" fill="${shade(skin, 0.35)}"/>
    <ellipse cx="54" cy="40" rx="1.6" ry="2.1" fill="${shade(skin, 0.35)}"/>
    <path d="M44 47c1.2 1.4 2.6 2.1 4 2.1s2.8-.7 4-2.1" fill="none" stroke="${shade(skin, 0.55)}" stroke-width="1.6" stroke-linecap="round"/>
  </g>
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
