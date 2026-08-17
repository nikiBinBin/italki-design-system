#!/usr/bin/env node
// Every built page must arrive with the intake that decided it.
//
// AGENTS.md tells an agent to run the intake first. Two agents were handed this
// system and neither did — Codex because AGENTS.md is only loaded as
// instructions when it sits at the root of the working directory, and one of
// ours because "never block" read like permission to assume. Prose cannot make
// an agent ask. A check on the commit can.
//
// What it is not: a lint on how the page is written, and not a gate on the
// design system's own maintenance. Changing the runtime, the contracts, the
// documents or this tooling is not building a page for a requester, and
// requiring an intake for it would train everyone to write empty ones. It fires
// on maintenance/templates/<name>/ — the pages this system builds — and nothing
// else.
//
//   node maintenance/scripts/check-intake.mjs                 committed vs origin/main
//   node maintenance/scripts/check-intake.mjs --since HEAD~3
//   node maintenance/scripts/check-intake.mjs --working       include uncommitted work
//
// Committed history is the default on purpose: work in progress is allowed to
// be half-done, and half of it belongs to whoever else has this tree open.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };

/* The project this file is enforcing for. Never "this file three directories
   up" — that is the repository root only because the script lives in
   maintenance/scripts/, and vendored into a kit's enforcement/ the same
   arithmetic lands in the user's Downloads folder. Resolution, in order: the
   nearest ancestor of the working directory holding an intake.config.json;
   else the repository this script belongs to, if it is laid out like one;
   else the working directory. */
const PROJECT = (() => {
  for (let dir = process.cwd(); ; dir = resolve(dir, '..')) {
    if (existsSync(join(dir, 'intake.config.json'))) return dir;
    if (dir === resolve(dir, '..')) break;
  }
  const own = resolve(fileURLToPath(import.meta.url), '../../..');
  if (existsSync(join(own, 'docs', 'intake.slots.json'))) return own;
  return process.cwd();
})();
const CONFIG = (() => {
  const defaults = { pages: 'maintenance/templates', records: 'docs/intakes', intake: 'maintenance/scripts/intake.mjs' };
  const file = join(PROJECT, 'intake.config.json');
  if (!existsSync(file)) return defaults;
  try { return { ...defaults, ...JSON.parse(readFileSync(file, 'utf8')) }; } catch { return defaults; }
})();
const PAGES = (process.env.INTAKE_PAGES || CONFIG.pages).replace(/\/$/, '');
const RECORDS = process.env.INTAKE_RECORDS || CONFIG.records;
const INTAKE = process.env.INTAKE_SCRIPT || CONFIG.intake;

const git = (...args) => {
  try { return execFileSync('git', args, { cwd: PROJECT }).toString().trim(); }
  catch { return ''; }
};

/* origin/main when it is there, the previous commit when it is not — a fresh
   clone with no remote should still be checkable rather than silently pass. */
const since = flag('since', git('rev-parse', '--verify', '--quiet', 'origin/main') ? 'origin/main' : 'HEAD~1');
const ranges = [git('diff', '--name-only', `${since}...HEAD`)];
/* Untracked files too. A brand-new page is untracked by definition, and it is
   the case this check exists for — `git diff` alone would have looked at a
   fresh src/app/checkout/ and reported nothing to check. */
if (argv.includes('--working')) {
  ranges.push(git('diff', '--name-only', 'HEAD'), git('diff', '--name-only', '--cached'),
    git('ls-files', '--others', '--exclude-standard'));
}

const changed = [...new Set(ranges.join('\n').split('\n').filter(Boolean))];
const PAGE = new RegExp(`^${PAGES.replace(/\/$/, '')}/([^/]+)/`);
const targets = [...new Set(changed.map((f) => f.match(PAGE)?.[1]).filter(Boolean))];

if (!targets.length) {
  console.log(`intake records: nothing to check (no page changed since ${since})`);
  process.exit(0);
}

// ── the records on hand ───────────────────────────────────────────────────
const dir = join(PROJECT, RECORDS);
const records = existsSync(dir)
  ? readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md')
      .map((f) => ({ file: f, body: readFileSync(join(dir, f), 'utf8') }))
  : [];

const problems = [];
for (const target of targets) {
  const hit = records.filter((r) => new RegExp(`^target:\\s*${target}\\s*$`, 'm').test(r.body));
  if (!hit.length) {
    problems.push([target, `no record in ${RECORDS}/ names it`,
      `node ${INTAKE} --record ${target} "<the request, verbatim>"`]);
    continue;
  }
  /* A record can exist and still prove nothing. The generator leaves a TODO
     where the requester's answers go; an agent that produced the file without
     ever sending the questions leaves it untouched, which is the case this
     check is actually here to catch. */
  const answered = hit.filter((r) => !r.body.includes('<!-- TODO:'));
  if (!answered.length) {
    problems.push([target, `${hit[0].file} still has the unfilled TODO where the answers go`,
      `send the question block, then write what came back under ## Answered`]);
    continue;
  }
  const missing = ['## Confirmed', '## Answered', '## Assumed'].filter((h) => !answered.some((r) => r.body.includes(h)));
  if (missing.length) problems.push([target, `${answered[0].file} is missing ${missing.join(', ')}`, `keep all three sections; Assumed is the one nobody may drop`]);
}

// ── report ────────────────────────────────────────────────────────────────
if (!problems.length) {
  console.log(`intake records: ${targets.length} page${targets.length === 1 ? '' : 's'} changed, each with a record — ${targets.join(', ')}`);
  process.exit(0);
}

console.error(`\nintake records missing for ${problems.length} of ${targets.length} changed page(s).\n`);
console.error('A page is built from a request, and the request is a decision record: whose view,');
console.error('which states, what must be visible, what was assumed because nobody said.\n');
for (const [target, why, fix] of problems) {
  console.error(`  ${target}`);
  console.error(`    ${why}`);
  console.error(`    → ${fix}\n`);
}
console.error(`Checked against ${since}. ${RECORDS}/README.md explains the record.\n`);
process.exit(1);
