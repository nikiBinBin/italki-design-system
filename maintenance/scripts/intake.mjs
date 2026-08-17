#!/usr/bin/env node
// Request intake — read a prompt, print the decisions it leaves open.
//
// The design system already says an execution request must begin with a
// structured intake (EXECUTION.md §2). What it did not say is how an agent gets
// one out of a person who typed a single sentence. A fixed questionnaire is the
// wrong answer: most of it is already in the prompt, and an agent that asks
// anyway reads as a form to fill in rather than as someone who read what you
// wrote.
//
// So the questions are computed. docs/intake.slots.json lists every decision
// this system needs before it can execute, each with the signals that mean the
// prompt already settled it and the default to take when nobody answers. This
// script matches a prompt against that catalog and prints only the gaps, most
// consequential first. Same prompt in, same questions out — which is why an
// agent that cannot reason about the catalog can still run the intake.
//
//   node maintenance/scripts/intake.mjs "a lesson detail page"
//   node maintenance/scripts/intake.mjs --json "..."      machine-readable
//   node maintenance/scripts/intake.mjs --defaults "..."  skip asking, list the assumptions
//   node maintenance/scripts/intake.mjs --catalog         the whole slot catalog
//   node maintenance/scripts/intake.mjs --selftest        the detection cases below
//
// Reads stdin when no prompt argument is given, so it composes with a pipe.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(fileURLToPath(import.meta.url), '../../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };

/* The catalog is looked for rather than fixed, because this script travels: in
   the repository it sits two directories under the root, and in a vendored copy
   of the kit it sits beside its own catalog with no repository around it. A
   consumer project that has neither layout can point at one with INTAKE_SLOTS. */
const SELF = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = [
  process.env.INTAKE_SLOTS,
  join(HERE, 'docs/intake.slots.json'),
  join(SELF, 'intake.slots.json'),
  join(SELF, 'guidelines/intake.slots.json'),
].find((p) => p && existsSync(p));
if (!CATALOG_PATH) {
  console.error('intake.slots.json not found. Looked beside this script, in ./guidelines, and in ../../docs.\nSet INTAKE_SLOTS=<path> to point at it.');
  process.exit(2);
}
const CATALOG = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));

// ── matching ──────────────────────────────────────────────────────────────
/* Patterns are authored in the catalog, not here: adding a decision the system
   needs is a JSON edit, and stays readable to an agent that only reads files. */
const firstHit = (prompt, patterns) => {
  for (const src of patterns ?? []) {
    const hit = prompt.match(new RegExp(src, 'i'));
    if (hit) return hit[0].trim();
  }
  return null;
};

const applies = (slot, prompt) =>
  slot.applies === 'always' ? true : Boolean(firstHit(prompt, slot.applies?.any));

const scan = (prompt, { max = CATALOG.maxQuestions } = {}) => {
  const settled = [];
  const gaps = [];
  const skipped = [];

  for (const slot of CATALOG.slots) {
    if (!applies(slot, prompt)) { skipped.push(slot.id); continue; }
    const evidence = firstHit(prompt, slot.answered?.any);
    if (evidence) settled.push({ id: slot.id, slot, evidence });
    else gaps.push(slot);
  }

  /* Impact first, catalog order as the tie-break — the catalog is authored in
     the order a page is actually decided, so ties break toward the earlier
     decision rather than toward whichever slot was added last. */
  gaps.sort((a, b) => b.impact - a.impact || CATALOG.slots.indexOf(a) - CATALOG.slots.indexOf(b));

  return {
    settled,
    ask: gaps.slice(0, max),
    /* Below the cap, not resolved: they take their defaults like anything else,
       but they are reported so a long silence is visible rather than implied. */
    deferred: gaps.slice(max),
    notApplicable: skipped,
  };
};

// ── rendering ─────────────────────────────────────────────────────────────
const zh = (prompt) => /[一-鿿]/.test(prompt);
const pick = (slot, field, lang) => (lang === 'zh' && slot[`${field}_zh`]) || slot[field];

const T = {
  en: {
    head: (n) => `## Request intake — ${n} open decision${n === 1 ? '' : 's'}`,
    none: '## Request intake — nothing open\n\nThe prompt settles every decision this system needs. Proceeding.',
    settled: 'Read as already settled — correct me if any of these is wrong:',
    open: 'Open. Answer what you care about; skip the rest and I take the default noted.',
    options: 'Options',
    fallback: 'If you skip',
    why: 'Why it matters',
    deferred: (n) => `${n} lower-impact decision${n === 1 ? '' : 's'} also went unanswered and will take the default: `,
    escape: (label) => `Say “${label}” and I apply every default above and start now.`,
    fromPrompt: 'from the prompt',
    assumed: '## Proceeding on these assumptions',
    assumedTail: 'Each line is a default from the intake catalog, not something the prompt said. Correct any of them and I rebuild that decision only.',
  },
  zh: {
    head: (n) => `## 需求澄清 — ${n} 项待定`,
    none: '## 需求澄清 — 没有待定项\n\n提示词已经覆盖本系统需要的全部决策，直接开始。',
    settled: '以下按已确定处理，如有出入请指出：',
    open: '以下待定。想说的就说，跳过的按标注的默认值处理。',
    options: '可选',
    fallback: '跳过则',
    why: '为什么重要',
    deferred: (n) => `另有 ${n} 项影响较小的决策也未回答，将取默认值：`,
    escape: (label) => `回一句「${label}」，我就按上面全部默认值开始。`,
    fromPrompt: '提示词已说明',
    assumed: '## 将按以下假设执行',
    assumedTail: '每一行都是澄清目录里的默认值，不是提示词说过的内容。任何一条不对，我只重做那一项决策。',
  },
};

const renderQuestions = (result, lang) => {
  const t = T[lang];
  if (!result.ask.length && !result.deferred.length) return t.none;

  const out = [t.head(result.ask.length), ''];

  if (result.settled.length) {
    out.push(`**${t.settled}**`, '');
    for (const s of result.settled) out.push(`- ${pick(s.slot, 'title', lang)} — “${s.evidence}”`);
    out.push('');
  }

  out.push(`**${t.open}**`, '');
  result.ask.forEach((slot, i) => {
    out.push(`${i + 1}. ${pick(slot, 'question', lang)}`);
    if (slot.options?.length) out.push(`   - ${t.options}: ${slot.options.join(' · ')}`);
    out.push(`   - ${t.fallback}: ${pick(slot, 'default', lang)}`);
    out.push(`   - ${t.why}: ${pick(slot, 'why', lang)} (${slot.feeds})`);
    out.push('');
  });

  if (result.deferred.length) {
    out.push(t.deferred(result.deferred.length) + result.deferred.map((s) => `${pick(s, 'title', lang)} → ${pick(s, 'default', lang)}`).join('; '), '');
  }

  out.push(pick(CATALOG.freeform, 'question', lang), '');
  out.push(t.escape(pick(CATALOG.escape, 'label', lang)));
  return out.join('\n');
};

const renderDefaults = (result, lang) => {
  const t = T[lang];
  const unresolved = [...result.ask, ...result.deferred];
  const out = [t.assumed, ''];
  for (const s of result.settled) out.push(`- **${pick(s.slot, 'title', lang)}** — ${t.fromPrompt}: “${s.evidence}”`);
  for (const s of unresolved) out.push(`- **${pick(s, 'title', lang)}** — ${pick(s, 'default', lang)}`);
  out.push('', t.assumedTail);
  return out.join('\n');
};

const renderCatalog = () => {
  const out = ['# Intake slot catalog', '', `${CATALOG.slots.length} decisions · at most ${CATALOG.maxQuestions} asked per request`, '',
    '| Slot | Impact | Asked when | Default |', '|---|---|---|---|'];
  for (const s of CATALOG.slots) {
    const when = s.applies === 'always' ? 'every request' : 'the request touches it';
    out.push(`| \`${s.id}\` — ${s.title} | ${s.impact} | ${when}, unless the prompt settles it | ${s.default} |`);
  }
  return out.join('\n');
};

// ── self-test ─────────────────────────────────────────────────────────────
/* These are detection cases, not examples: each one asserts that a real prompt
   shape reaches the right verdict, so a pattern edit that quietly starts asking
   about something the prompt clearly said fails here instead of in front of a
   requester. */
const CASES = [
  {
    prompt: 'Design a lesson detail page',
    settled: ['object-kind'],
    asks: ['actor', 'primary-action', 'status-set'],
  },
  {
    prompt: 'As a student on mobile, I want to reschedule an upcoming lesson from my lessons list, so that I can keep my package. Show the teacher, the new time options and the 24-hour cancellation policy. Don\'t change the lessons list itself.',
    settled: ['actor', 'viewport', 'primary-action', 'status-set', 'must-have-data', 'commitment', 'entry-context', 'unchanged-scope'],
    asks: ['object-kind'],
    notAsks: ['actor', 'viewport', 'primary-action', 'status-set', 'must-have-data', 'commitment'],
  },
  {
    prompt: '帮我做一个老师视角的课程详情页，移动端',
    settled: ['actor', 'object-kind', 'viewport'],
    asks: ['primary-action', 'status-set'],
    notAsks: ['actor', 'object-kind', 'viewport'],
    lang: 'zh',
  },
  {
    /* No object with a lifecycle and no money in the request, so neither the
       status set nor the commitment rules are anybody's question here. */
    prompt: 'A settings section where a teacher edits their intro video, desktop only',
    notApplicable: ['status-set', 'commitment'],
  },
  {
    /* A modification, stated in Chinese and without an English verb in it: the
       fence around the existing page has to be asked for in both languages or
       it is only ever asked for in one. */
    prompt: '把老师主页的价格区块改成课程包，桌面端',
    settled: ['object-kind', 'viewport'],
    asks: ['unchanged-scope'],
    notAsks: ['viewport'],
  },
];

const selftest = () => {
  let failed = 0;
  for (const c of CASES) {
    const r = scan(c.prompt);
    const asked = r.ask.map((s) => s.id);
    const settled = r.settled.map((s) => s.id);
    const problems = [];
    for (const id of c.settled ?? []) if (!settled.includes(id)) problems.push(`expected settled: ${id}`);
    for (const id of c.asks ?? []) if (!asked.includes(id)) problems.push(`expected asked: ${id}`);
    for (const id of c.notAsks ?? []) if (asked.includes(id)) problems.push(`should not ask: ${id}`);
    for (const id of c.notApplicable ?? []) if (!r.notApplicable.includes(id)) problems.push(`expected not applicable: ${id}`);
    if (c.lang && (zh(c.prompt) ? 'zh' : 'en') !== c.lang) problems.push(`expected language: ${c.lang}`);
    if (problems.length) {
      failed++;
      console.error(`FAIL  ${c.prompt.slice(0, 60)}…`);
      for (const p of problems) console.error(`      ${p}`);
      console.error(`      asked: ${asked.join(', ') || '(none)'}`);
    } else {
      console.log(`ok    ${c.prompt.slice(0, 60)}${c.prompt.length > 60 ? '…' : ''} → ${asked.join(', ') || '(nothing open)'}`);
    }
  }
  if (failed) { console.error(`\n${failed} of ${CASES.length} intake cases failed`); process.exit(1); }
  console.log(`\n${CASES.length} intake cases passed`);
};

// ── entry ─────────────────────────────────────────────────────────────────
const readPrompt = () => {
  const file = flag('file', null);
  if (file) return readFileSync(resolve(file), 'utf8');
  const positional = argv.filter((a, i) => !a.startsWith('--') && !['file', 'max', 'lang'].includes((argv[i - 1] ?? '').replace(/^--/, '')));
  if (positional.length) return positional.join(' ');
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
};

if (has('selftest')) { selftest(); }
else if (has('catalog')) { console.log(renderCatalog()); }
else {
  const prompt = readPrompt().trim();
  if (!prompt) {
    console.error('Give the request as an argument, --file <path>, or on stdin.\n  node maintenance/scripts/intake.mjs "a lesson detail page"');
    process.exit(2);
  }
  const lang = flag('lang', 'auto') === 'auto' ? (zh(prompt) ? 'zh' : 'en') : flag('lang', 'en');
  const result = scan(prompt, { max: Number(flag('max', CATALOG.maxQuestions)) });

  if (has('json')) {
    const strip = (s) => ({ id: s.id, title: s.title, title_zh: s.title_zh, question: s.question, question_zh: s.question_zh, options: s.options, default: s.default, default_zh: s.default_zh, why: s.why, why_zh: s.why_zh, feeds: s.feeds, impact: s.impact });
    console.log(JSON.stringify({
      version: CATALOG.version,
      lang,
      settled: result.settled.map((s) => ({ id: s.id, title: s.slot.title, title_zh: s.slot.title_zh, evidence: s.evidence })),
      ask: result.ask.map(strip),
      deferred: result.deferred.map(strip),
      notApplicable: result.notApplicable,
      assumptions: Object.fromEntries([...result.ask, ...result.deferred].map((s) => [s.id, s.default])),
      freeform: CATALOG.freeform,
      escape: CATALOG.escape,
    }, null, 2));
  } else if (has('defaults')) {
    console.log(renderDefaults(result, lang));
  } else {
    console.log(renderQuestions(result, lang));
  }
}
