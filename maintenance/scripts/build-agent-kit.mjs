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

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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
execFileSync('node', [join(HERE, 'maintenance/scripts/build-ds-project.mjs'), '--out', scratch, '--flavour', 'kit'], { stdio: 'inherit' });

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

/* skills/ — the review pass, adapted from Anthropic's design plugin so its
   consistency and token sections cite this kit's contracts instead of generic
   good practice. They ship here and install.mjs places them where the host
   agent looks; a skill directory inside a vendored subfolder is never found. */
cpSync(join(HERE, 'maintenance/agent-skills'), join(OUT, 'skills'), { recursive: true });

/* AGENTS.md is only picked up as instructions when it sits at the root of the
   agent's working directory. Hand this folder to an agent working somewhere
   else and it is just a file — the agent opens README.md for the API and never
   reads the rules. Two observed consequences, both from the same cause: a page
   built without running the intake, and a screenful of broken icons.

   So the two things that cannot be missed are prepended to README.md, which is
   the file that does get opened. */
const readmePath = join(OUT, 'README.md');
writeFileSync(readmePath, `# italki UI Kit

> **Run this once, in the project that will use the kit:**
>
> \`\`\`bash
> node italki-ui-kit/enforcement/install.mjs --pages src/app
> \`\`\`
>
> It writes the root pointer that makes \`AGENTS.md\` load in every session, turns
> on the intake gate, and installs the review skills. \`--pages\` is the directory
> whose immediate subdirectories are the things a requester asks for.
>
> Skip it and \`AGENTS.md\` is only picked up when this folder *is* the working
> directory root; otherwise paste *"follow AGENTS.md in the kit folder"* into every
> request. The two things an agent gets wrong without those rules are below.

## 1. A design request starts with the intake, not with components

\`\`\`bash
node intake.mjs "<the request, verbatim>"
\`\`\`

It prints the few decisions the request left open — at most five, each with a
default — and nothing else. Send that block, take whatever is answered, then
build, stating \`Confirmed / Answered / Assumed\`. Skipping it is how a page gets
built for the wrong role, in the wrong viewport, covering one state out of six.

## 2. Every icon broken means the asset base was not found

The runtime emits \`Assets/Icons/x.svg\` and resolves it against **the bundle's
own URL**, worked out from the \`<script src>\` that loaded it. Inline the bundle
into a single-file page and there is no URL to read, so the paths fall back to
page-relative — and \`Assets/\` is in this folder, not beside your page.

Set the base yourself, before anything renders. This always works:

\`\`\`html
<script>window.ITalkiUIAssetBase = "/italki-ui-kit/";</script>  <!-- wherever this folder sits -->
<script src="/italki-ui-kit/_ds_bundle.js"></script>
\`\`\`

Or keep \`Assets/\` next to the page. Either is fine; guessing is not.

\`open example.html\` from a local server is the check: two buttons, a tag, an
avatar with a flag. If those icons render, your wiring is right.

---

${readFileSync(readmePath, 'utf8').replace(/^# italki UI Kit\n/, '').trimStart()}`);

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

// ── 3. the enforcement, or the rules are only a suggestion again ──────────
/* The kit shipped INTAKE.md and intake.mjs and nothing that makes either
   binding, while intake.mjs's own messages named maintenance/templates/ — a
   directory no consuming project has. A reviewer checking whether the gate was
   real found the rules clearer and the gate absent, which was the correct
   reading of what was in the folder.
   Both gates travel now, reading intake.config.json for where this project
   keeps its pages and its records. */
mkdirSync(join(OUT, 'enforcement'), { recursive: true });
for (const f of ['check-intake.mjs', 'intake-gate.mjs']) {
  cpSync(join(HERE, 'maintenance/scripts', f), join(OUT, 'enforcement', f));
}
writeFileSync(join(OUT, 'enforcement/intake.config.example.json'), `{
  "pages": "src/app",
  "records": "docs/intakes",
  "intake": "italki-ui-kit/intake.mjs"
}
`);

/* Three files have to exist in the consuming project before any of this is
   live: the config, the hook registration, and a CI step. Shipping three
   examples and a paragraph explaining where each goes produced exactly what it
   deserved — a reviewer finding the implementation present and the enforcement
   off. One command writes all three, and says what it wrote. */
writeFileSync(join(OUT, 'enforcement/install.mjs'), `#!/usr/bin/env node
// Wire this kit into the project this is run from.
//
//   node italki-ui-kit/enforcement/install.mjs --pages src/app
//
// Writes the root instruction pointer that makes the kit's AGENTS.md load at all,
// intake.config.json, the PreToolUse hook, a GitHub Actions step, and the review
// skills. Existing files are merged, never replaced; anything already correct is
// left alone and reported as such. --skip-skills leaves the skills out.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(\`--\${n}\`); return i < 0 ? d : argv[i + 1]; };
const ROOT = resolve(flag('root', process.cwd()));
const KIT = relative(ROOT, resolve(fileURLToPath(import.meta.url), '../..')) || '.';
const pages = flag('pages', null);
const records = flag('records', 'docs/intakes');
const done = [];

if (!pages) {
  console.error(\`--pages is required: the directory whose immediate subdirectories are the
things a requester asks for. In a Next.js app that is usually src/app; in this
design system's own repository it is maintenance/templates.

  node \${KIT}/enforcement/install.mjs --pages src/app\`);
  process.exit(2);
}

/* 1. the pointer, without which none of the rest is ever read.

   An agent loads CLAUDE.md and AGENTS.md from the root of its working
   directory. Vendored, this kit's AGENTS.md sits one level down and is just a
   file: the agent opens README.md for the API and never learns that a request
   starts with the intake or that tokens are mandatory. Prepending the warning to
   README.md asked the requester to paste a line into every request, which is not
   a mechanism. Twelve lines at the root is. */
const POINTER = [
  '## Building product UI in this project',
  '',
  'Read \`' + KIT + '/AGENTS.md\`. It is the single instruction file for building',
  'product UI here, and it applies without amendment.',
  '',
  'The one rule that must not wait on that read: **a request to design or build a',
  'page, section, unit, overlay, flow step or enhancement starts with the intake,',
  'not with code.**',
  '',
  '    node ' + KIT + '/intake.mjs "<the request, verbatim>"',
  '',
  'It prints a brief, not a question block: every decision the request leaves',
  'open, each with a default. You write the questions, in the requester\\'s own',
  'language, with this request\\'s real options. Then present the block and',
  '**stop** — do not create or modify implementation files until the answers come',
  'back. Silence is not authorization to use defaults; they may be applied only',
  'when the requester explicitly says "你来决定", "decide for me", or otherwise',
  'clearly authorizes the ones listed. Once authorized, state',
  '\`Confirmed / Answered / Assumed\` before the first component goes down.',
  '',
  'Skip the intake only when the request is not a build: a question about the kit,',
  'a rename, a typo, a file move.',
  '',
].join('\\n');

for (const name of ['CLAUDE.md', 'AGENTS.md']) {
  const at = join(ROOT, name);
  if (!existsSync(at)) {
    writeFileSync(at, '# ' + name.replace('.md', '') + '\\n\\n' + POINTER);
    done.push([name, 'written — the kit\\'s rules now load in every session']);
  } else if (readFileSync(at, 'utf8').includes(KIT + '/AGENTS.md')) {
    done.push([name, 'already points at the kit — left as it is']);
  } else {
    writeFileSync(at, readFileSync(at, 'utf8').replace(/\\s*$/, '') + '\\n\\n' + POINTER);
    done.push([name, 'pointer appended, your own content kept above it']);
  }
}

// 2. the config both gates read
const cfgPath = join(ROOT, 'intake.config.json');
const cfg = { pages, records, intake: join(KIT, 'intake.mjs') };
if (existsSync(cfgPath) && readFileSync(cfgPath, 'utf8').includes('"pages"')) {
  done.push(['intake.config.json', 'already there — left as it is']);
} else {
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\\n');
  done.push(['intake.config.json', \`pages=\${pages} records=\${records}\`]);
}

// 3. the write gate, for Claude Code
const settingsPath = join(ROOT, '.claude/settings.json');
const hook = {
  matcher: 'Write|Edit|NotebookEdit',
  hooks: [{ type: 'command', command: \`node \${join(KIT, 'enforcement/intake-gate.mjs')}\`, timeout: 10, statusMessage: 'Checking the intake record' }],
};
let settings = {};
if (existsSync(settingsPath)) {
  try { settings = JSON.parse(readFileSync(settingsPath, 'utf8')); }
  catch { console.error(\`.claude/settings.json will not parse — fix it first, nothing was written there.\`); process.exit(1); }
}
settings.hooks ??= {};
settings.hooks.PreToolUse ??= [];
const already = settings.hooks.PreToolUse.some((e) => JSON.stringify(e).includes('intake-gate.mjs'));
if (already) {
  done.push(['.claude/settings.json', 'the hook is already registered']);
} else {
  settings.hooks.PreToolUse.push(hook);
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\\n');
  done.push(['.claude/settings.json', 'PreToolUse hook added, existing settings kept']);
}

// 4. the commit check, for every agent and every person
const wfPath = join(ROOT, '.github/workflows/intake.yml');
if (existsSync(wfPath)) {
  done.push(['.github/workflows/intake.yml', 'already there — left as it is']);
} else {
  mkdirSync(dirname(wfPath), { recursive: true });
  writeFileSync(wfPath, \`name: intake
on: [pull_request]
jobs:
  records:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node \${join(KIT, 'enforcement/check-intake.mjs')} --since origin/\\\${{ github.base_ref }}
\`);
  done.push(['.github/workflows/intake.yml', 'runs the check on every pull request']);
}

/* 5. the review skills. A skills directory inside the vendored kit is never
   discovered — an agent reads .claude/skills at the root of its working
   directory and nowhere else — so they are copied out, with {KIT} resolved to
   wherever this kit actually sits. A file already present is left alone: it is
   more likely someone's edit than a stale copy. */
const skillsFrom = resolve(ROOT, KIT, 'skills');
if (argv.includes('--skip-skills')) {
  done.push(['.claude/skills/', 'skipped (--skip-skills)']);
} else if (!existsSync(skillsFrom)) {
  done.push(['.claude/skills/', 'this kit ships none — nothing to install']);
} else {
  const to = join(ROOT, '.claude/skills');
  let wrote = 0, kept = 0;
  const place = (rel) => {
    const dest = join(to, rel);
    if (existsSync(dest)) { kept++; return; }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, readFileSync(join(skillsFrom, rel), 'utf8').split('{KIT}').join(KIT));
    wrote++;
  };
  for (const e of readdirSync(skillsFrom, { withFileTypes: true })) {
    place(e.isDirectory() ? join(e.name, 'SKILL.md') : e.name);
  }
  done.push(['.claude/skills/', \`\${wrote} installed\` + (kept ? \`, \${kept} already there and left alone\` : '')]);
}

console.log(\`italki UI Kit wired into \${ROOT}\\n\`);
for (const [f, what] of done) console.log(\`  \${f.padEnd(32)} \${what}\`);
console.log(\`
The first line is the one that matters: without a pointer at the root, this kit's
AGENTS.md is a file nobody opens, and an agent will build without the intake and
without the tokens. Everything below it only enforces what that line loads.

Claude Code reads .claude/settings.json at startup — restart it, or open /hooks
once, before the write gate is live in an already-running session.

Check it works: try writing into \${pages}/anything/ and it should refuse.\`);
`);
writeFileSync(join(OUT, 'enforcement/settings.example.json'), `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node italki-ui-kit/enforcement/intake-gate.mjs",
            "timeout": 10,
            "statusMessage": "Checking the intake record"
          }
        ]
      }
    ]
  }
}
`);
writeFileSync(join(OUT, 'enforcement/README.md'), `# Enforcement

\`../guidelines/INTAKE.md\` says a page starts with the intake. Nothing in a
document makes that true. These two make it true, and they are the reason the
rule survives an agent that did not read the document — which is the normal
case, not the exceptional one.

## Install both, and the pointer they depend on

\`\`\`bash
node italki-ui-kit/enforcement/install.mjs --pages src/app
\`\`\`

That is the whole setup. It writes the root \`CLAUDE.md\` / \`AGENTS.md\` pointer
without which the rules are never loaded, \`intake.config.json\`, the hook, a CI
step, and the review skills. Every file is merged, never replaced, and what it did
is printed. Re-running it is safe.

\`pages\` is the directory whose immediate subdirectories are the things a
requester asks for. \`records\` is where the intake record for each one is kept
(default \`docs/intakes\`). Environment variables \`INTAKE_PAGES\` and
\`INTAKE_RECORDS\` override both. The sections below are what it wires, for when
you would rather do it by hand.

## The write gate — Claude Code only

\`\`\`bash
cp enforcement/settings.example.json .claude/settings.json   # merge if you have one
\`\`\`

A \`PreToolUse\` hook refuses a write under \`pages/<name>/\` until a record names
that page and its answers are filled in. Claude Code is the only agent with an
equivalent hook; Codex and Cursor have none, which is why the second one exists.

## The commit check — every agent

\`\`\`bash
node italki-ui-kit/enforcement/check-intake.mjs            # committed vs origin/main
node italki-ui-kit/enforcement/check-intake.mjs --working  # include uncommitted
\`\`\`

Non-zero exit when a changed page has no record, or has one with the generated
TODO still where the answers belong. Put it in CI and in your test script. It
reads the diff, not who produced it, so it covers Claude, Codex, Cursor and a
person equally.

## What neither can do

Catch a record whose TODO was deleted by an agent that never asked. Nothing
short of watching the conversation can. The record is a claim; these two make
the claim mandatory and legible, and a reviewer can read \`## Answered\` and see
whether anyone was actually asked.
`);

// ── 4. the Catalog, so the reference is readable without a network ────────
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

// ── 5. a page that proves the kit loads ───────────────────────────────────
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

// ── 6. stamp what this copy is ────────────────────────────────────────────
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
  'maintenance/catalog-cards.json', 'maintenance/fixtures', 'maintenance/scripts',
  'maintenance/agent-skills'];
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
skills      ${readdirSync(join(OUT, 'skills'), { withFileTypes: true }).filter((e) => e.isDirectory()).length} review skills — installed into the host by enforcement/install.mjs
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

// ── 7. package, when asked ────────────────────────────────────────────────
if (argv.includes('--zip')) {
  const zip = `${OUT}-${built}.zip`;
  rmSync(zip, { force: true });
  execFileSync('find', [OUT, '-name', '.DS_Store', '-delete']);
  execFileSync('zip', ['-rq', zip, relative(dirname(OUT), OUT), '-x', '*.DS_Store'], { cwd: dirname(OUT) });
  console.log(`✓ ${zip}  (${execFileSync('du', ['-sh', zip]).toString().split('\t')[0].trim()})`);
}

// ── 8. report, and refuse to look healthy while incomplete ────────────────
rmSync(scratch, { recursive: true, force: true });
const size = (p) => execFileSync('du', ['-sh', p]).toString().split('\t')[0].trim();
const icons = readdirSync(join(OUT, 'Assets/Icons')).filter((f) => f.endsWith('.svg')).length;
if (kept < 100) throw new Error(`only ${kept} contract files reached the kit; expected two per component`);
console.log(`✓ ${OUT}  (${size(OUT)})`);
console.log(`  contracts: ${kept} files · icons: ${icons} at the root + subdirectories`);
console.log(`  open example.html in a browser to confirm it loads`);
