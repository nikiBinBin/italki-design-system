#!/usr/bin/env node
// Build the hand-over kit: everything an agent needs to build italki product UI
// in someone else's project, and nothing else.
//
// maintenance/ds-project/ is the payload for claude.ai/design, and it is shaped
// for that surface: preview cards, per-component React re-exports, a card
// manifest, a thumbnail. An agent working in an unrelated repository needs none
// of that and does need one thing the design payload leaves out — the icons.
// Assets/ is uploaded to the design project separately, so a folder copied out
// of there renders every icon as a broken image.
//
// So this assembles a third thing from the same source of truth: the runtime,
// the contracts, the rules, a runnable intake, and the assets the runtime
// actually resolves.
//
//   node maintenance/scripts/build-agent-kit.mjs
//   node maintenance/scripts/build-agent-kit.mjs --out ~/Desktop/italki-ui-kit
//
// The design payload is rebuilt into a scratch directory first, every time, so
// the kit cannot be assembled from a stale one. That failure — a generator
// reading something nobody rebuilt — is the shape of most of what went wrong in
// this repository on 2026-08-17.

import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(fileURLToPath(import.meta.url), '../../..');
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
/* Beside the repository, never inside it. This folder is a copy of the design
   system shaped for somebody else's project — it is not part of this one, and a
   build output sitting in the tree is a thing that gets committed by accident,
   edited instead of its source, or handed over stale. --out moves it anywhere. */
const OUT = resolve(flag('out', join(HERE, '../italki-ui-kit')));

// ── 1. rebuild the design payload into scratch ────────────────────────────
const scratch = mkdtempSync(join(tmpdir(), 'italki-kit-'));
execFileSync('node', [join(HERE, 'maintenance/scripts/build-ds-project.mjs'), '--out', scratch], { stdio: 'inherit' });

// ── 2. take the parts a consuming project uses ────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/* Whole files, copied as they are. The two underscore names are kept rather
   than tidied because README.md and styles.css name them, and a kit whose own
   documentation points at files that are not there is worse than an ugly
   filename. */
const FILES = [
  'AGENTS.md',        // the entry point every editor agent looks for
  'README.md',        // prop vocabulary, slot table, tokens, asset rules
  'intake.mjs',       // the gap scan, runnable with no dependencies
  'styles.css',       // @imports the two below
  '_ds_bundle.css',
  '_ds_bundle.js',    // window.ItalkiUI — React wrappers and .raw string renderers
  'tokens/tokens.css',
];
for (const f of FILES) {
  const from = join(scratch, f);
  if (!existsSync(from)) throw new Error(`the design payload has no ${f} — the kit would ship incomplete`);
  mkdirSync(dirname(join(OUT, f)), { recursive: true });
  cpSync(from, join(OUT, f));
}

// guidelines/ entire: the four documents, INTAKE.md, and the slot catalog.
cpSync(join(scratch, 'guidelines'), join(OUT, 'guidelines'), { recursive: true });

/* Contracts and variant notes only. The .jsx files are per-component re-exports
   of window.ItalkiUI.X, which the bundle already installs, and the .html files
   are preview cards for the design pane's gallery — together 1.9MB of things a
   consuming project reads once and never imports. The .d.ts is the prop
   contract the runtime asserts against, and it is the file to read before
   composing. */
let kept = 0;
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.(d\.ts|prompt\.md)$/.test(entry.name)) continue;
    const rel = relative(scratch, full);
    mkdirSync(dirname(join(OUT, rel)), { recursive: true });
    cpSync(full, join(OUT, rel));
    kept++;
  }
};
walk(join(scratch, 'components'));

/* All three approved asset roots. Icons and Flags are vocabulary — components
   name them and the manifest decides which exist. Images are content, and were
   left out of the first build of this kit on the grounds that no rule
   references them: true, and beside the point. An agent asked for a teacher
   card with nothing to put in the avatar renders initials, and the intake's own
   default asks for content that looks like italki. Shipping the reference
   photography is what makes that possible; --no-images drops it for a handover
   that has to stay small. */
const ASSET_DIRS = argv.includes('--no-images') ? ['Icons', 'Flags'] : ['Icons', 'Flags', 'Images'];
for (const dir of ASSET_DIRS) {
  cpSync(join(HERE, 'Assets', dir), join(OUT, 'Assets', dir), {
    recursive: true,
    filter: (src) => !src.endsWith('.DS_Store'),
  });
}

// ── 3. the Catalog, so the reference is readable without a network ────────
/* README.md and AGENTS.md point at design.italkiux.com for "what does this
   component look like", which is a dependency on that site being up and on the
   reader being online — and on it still describing the revision they were
   handed. The Catalog is three files plus the runtime it already loads by
   relative path, so it travels. It is the same source these contracts were
   generated from, so it cannot describe a different version of them. */
for (const f of ['index.html', 'catalog.css']) cpSync(join(HERE, f), join(OUT, f));
cpSync(join(HERE, 'catalog-runtime'), join(OUT, 'catalog-runtime'), {
  recursive: true,
  filter: (src) => !src.endsWith('.DS_Store'),
});

// ── 4. a page that proves the kit loads ───────────────────────────────────
/* Opened in a browser, this is the whole acceptance test for "did I wire the
   kit in correctly": if the button is red and the icon is not a broken image,
   the stylesheet, the bundle and the asset paths are all resolving. */
writeFileSync(join(OUT, 'example.html'), `<!doctype html>
<meta charset="utf-8">
<title>italki UI Kit — does it load?</title>
<link rel="stylesheet" href="./styles.css">
<body style="margin:0;padding:var(--ui-space-8,40px);background:var(--ui-color-bg,#faf9f7);font-family:var(--ui-font-family)">
<div id="app"></div>
<script src="./_ds_bundle.js"></script>
<script>
  /* .raw is the same component set returning HTML strings — no React needed. */
  var ui = window.ItalkiUI.raw;
  document.getElementById('app').innerHTML =
    ui.sectionIntro({ title: 'italki UI Kit', description: 'If this row is styled and the icon renders, the kit is wired in.' }) +
    '<div style="display:flex;gap:var(--ui-space-3);align-items:center;margin-top:var(--ui-space-6)">' +
      /* Icon props are asserted against the approved asset roots before any
         name lookup happens, so they take the path — 'calendar' alone throws. */
      ui.button({ label: 'Book trial', variant: 'red', leadingIcon: 'Assets/Icons/calendar.svg' }) +
      ui.button({ label: 'Message', variant: 'secondary' }) +
      ui.tag({ label: 'Professional Teacher', tone: 'info', leadingIcon: 'Assets/Icons/teacher-professional.svg' }) +
    '</div>' +
    /* The third asset root. "image" takes a path like the icons do; "flag" is
       the exception — an ISO 3166-1 alpha-2 code, not a file. */
    '<div style="margin-top:var(--ui-space-6)">' +
      ui.avatar({ image: 'Assets/Images/avatars/teacher-lucia.png', size: 96, name: 'Lucia', flag: 'es', variant: 'with-flag' }) +
    '</div>';
</script>
</body>
`);

// ── 5. stamp what this copy is ────────────────────────────────────────────
/* A kit is read months after it was handed over, in a repository that has no
   connection to this one. Without this file the only way to answer "is what I
   have current" is to ask the person who sent it, and they will not remember
   either. `dirty` matters as much as the commit: a kit built over uncommitted
   edits corresponds to no revision anyone else can check out. */
const git = (...args) => { try { return execFileSync('git', args, { cwd: HERE }).toString().trim(); } catch { return ''; } };
const commit = git('rev-parse', '--short', 'HEAD') || 'unknown';
/* Only the paths this kit is actually assembled from. A template or a test
   being mid-edit says nothing about whether this copy matches its revision,
   and a stamp that cries dirty over unrelated work is a stamp people learn to
   ignore. */
const SOURCES = ['catalog-runtime', 'docs', 'Assets', 'maintenance/prompt-notes',
  'maintenance/catalog-cards.json', 'maintenance/fixtures', 'maintenance/scripts'];
const dirty = git('status', '--porcelain', '--', ...SOURCES) !== '';
const built = new Date().toISOString().slice(0, 10);
const componentCount = readdirSync(join(OUT, 'components'), { recursive: true }).filter((f) => String(f).endsWith('.d.ts')).length;
const iconCount = execFileSync('find', [join(OUT, 'Assets/Icons'), '-name', '*.svg']).toString().trim().split('\n').length;

writeFileSync(join(OUT, 'VERSION'), `italki UI Kit
built       ${built}
commit      ${commit}${dirty ? '  (+ uncommitted changes — this copy matches no revision)' : ''}
source      github.com/nikiBinBin/italki-design-system
catalog     index.html — open it from a local server, not file://
            (the hosted copy is https://design.italkiux.com/, which tracks
             the source and may be ahead of this folder)

components  ${componentCount}
icons       ${iconCount}
guidelines  ${readdirSync(join(OUT, 'guidelines')).length} files, including INTAKE.md and its slot catalog
assets      ${ASSET_DIRS.join(', ')} under Assets/

Assets/Icons and Assets/Flags are vocabulary: a component names one and the
runtime resolves it, so a name that is not there throws. Assets/Images is
reference photography — the avatars and covers the Catalog uses to show a
teacher card as it really reads. Use them to compose and review; replace them
with the product's own imagery before anything ships.

Rebuild a current copy from the source repository:
  node maintenance/scripts/build-agent-kit.mjs --zip

Everything in this folder is generated. Edit the design system, not this.
`);

// ── 6. package, when asked ────────────────────────────────────────────────
if (argv.includes('--zip')) {
  const zip = `${OUT}-${built}.zip`;
  rmSync(zip, { force: true });
  execFileSync('find', [OUT, '-name', '.DS_Store', '-delete']);
  execFileSync('zip', ['-rq', zip, relative(dirname(OUT), OUT), '-x', '*.DS_Store'], { cwd: dirname(OUT) });
  console.log(`✓ ${zip}  (${execFileSync('du', ['-sh', zip]).toString().split('\t')[0].trim()})`);
}

// ── 7. report, and refuse to look healthy while incomplete ────────────────
rmSync(scratch, { recursive: true, force: true });
const size = (p) => execFileSync('du', ['-sh', p]).toString().split('\t')[0].trim();
const icons = readdirSync(join(OUT, 'Assets/Icons')).filter((f) => f.endsWith('.svg')).length;
if (kept < 100) throw new Error(`only ${kept} contract files reached the kit; expected two per component`);
console.log(`✓ ${OUT}  (${size(OUT)})`);
console.log(`  contracts: ${kept} files · icons: ${icons} at the root + subdirectories`);
console.log(`  open example.html in a browser to confirm it loads`);
