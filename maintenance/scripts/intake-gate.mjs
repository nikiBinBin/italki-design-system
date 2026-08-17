#!/usr/bin/env node
// PreToolUse gate: no writing a page before the intake that decided it exists.
//
// check-intake.mjs is the same rule at the other end, and the two are not
// redundant. A check on the commit stops a page being delivered without its
// record; it does not stop the page being written first, which is where the
// wrong decisions get made and where they get expensive to unmake. This runs
// before the write lands.
//
// It only knows about Claude Code — Codex and Cursor have no equivalent hook.
// For those the gate has to live in whatever hands them the task; AGENTS.md
// says so, and check-intake.mjs catches what gets through either way.
//
// Reads the PreToolUse payload on stdin, answers with a permission decision.
// Deny is worded as an instruction rather than a refusal, because the agent
// reading it is the one who has to fix it, and "run this, then send the block"
// is actionable where "denied" is not.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(fileURLToPath(import.meta.url), '../../..');
const allow = () => process.exit(0);

let payload = '';
try {
  payload = readFileSync(0, 'utf8');
} catch { allow(); }

let input;
try { input = JSON.parse(payload); } catch { allow(); }

/* Write, Edit and NotebookEdit each name the file differently across versions;
   take whichever is there rather than assuming one. A payload with no path at
   all is not this gate's business. */
const file = input?.tool_input?.file_path ?? input?.tool_input?.path ?? input?.tool_input?.notebook_path;
if (!file) allow();

const rel = relative(HERE, resolve(String(file)));
const target = rel.match(/^maintenance\/templates\/([^/]+)\//)?.[1];
if (!target) allow();

/* README.md in that directory documents the templates rather than being one. */
if (/^maintenance\/templates\/[^/]+\/?$/.test(rel)) allow();

const dir = resolve(HERE, 'docs/intakes');
const records = existsSync(dir)
  ? readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md')
      .map((f) => ({ file: f, body: readFileSync(resolve(dir, f), 'utf8') }))
  : [];

const named = records.filter((r) => new RegExp(`^target:\\s*${target}\\s*$`, 'm').test(r.body));
const usable = named.filter((r) => !r.body.includes('<!-- TODO:'));

if (usable.length) allow();

const reason = named.length
  ? `docs/intakes/${named[0].file} exists for ${target}, but the TODO where the requester's answers go is still in it. `
    + `Send the question block, write what comes back under ## Answered, delete the TODO — then this write goes through.`
  : `No intake record names ${target}. A page is built from a request, and the request is a decision record.\n\n`
    + `  node maintenance/scripts/intake.mjs --record ${target} "<the request, verbatim>"\n\n`
    + `That writes docs/intakes/<date>-${target}.md with Confirmed and Assumed already filled in. `
    + `Send the questions it prints, put the answers under ## Answered, then write the page.`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
}));
process.exit(0);
