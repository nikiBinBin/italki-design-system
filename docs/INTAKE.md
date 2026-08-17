# INTAKE.md

## 0. How To Use This Document

### 0.1 Intended Readers

This document is written for any agent — Claude, a coding assistant in an editor, a CI job, or a custom loop — that is about to build something with this design system, and for the people reviewing what it built.

### 0.2 What This Document Covers

`EXECUTION.md §2` says an execution request must begin with a structured intake. This document defines how an agent obtains one from a person who typed a single sentence: which decisions this system needs, how to tell whether a prompt already settled one, which of the remaining gaps are worth a question, and what to do with the answers.

### 0.3 Rule Priority

For what to ask before building, this document is authoritative. It defers the intake's field vocabulary and everything after the answers to `EXECUTION.md`, product direction to `DESIGN.md`, component contracts to `COMPONENTS.md`, and product composition to `PATTERNS.md`.

This document never decides what to build. It decides what is not yet known.

## 1. The Rule

Before an agent produces a page, section, unit, overlay, flow step, or enhancement with this design system, it runs the intake against the request and reports the result. It does this once per request, not once per turn.

The intake is a gap scan, not a questionnaire. A question is asked only when the prompt leaves the decision open **and** the decision applies to this request. A prompt that already answers everything produces no questions and the work starts immediately.

Three rules bound it:

- **Never block — after the questions have been sent.** Every slot carries a default, and a requester who ignores the block gets a complete deliverable built on stated assumptions rather than a stalled turn. This is not permission to skip the asking: a default may only be taken for a question that was put to the requester and went unanswered, or that they explicitly waived. An agent that reads "never block" as "assume and proceed" has inverted the rule, and the first thing it will get wrong is whose view the page is for.
- **Never ask twice.** A decision the prompt settled is echoed back as settled, not re-asked. The echo is how a wrong reading gets corrected cheaply.
- **Never exceed the cap.** At most `maxQuestions` (currently five) are asked. Lower-impact gaps take their defaults and are reported in one line.

## 2. The Slot Catalog

`docs/intake.slots.json` is the source of truth. Each slot is one decision this system cannot execute without, and carries:

| Field | Meaning |
| --- | --- |
| `applies` | `always`, or the signals that make this decision relevant to the request at all |
| `answered` | the signals that mean the prompt already settled it |
| `impact` | 1–5; ranks the gaps when there are more than the cap allows |
| `question` / `question_zh` | what to ask, in the requester's language |
| `options` | the closed set, when the decision has one |
| `default` / `default_zh` | what is taken when nobody answers |
| `why` / `why_zh` | what the answer changes |
| `feeds` | the rule downstream that consumes it |

`applies` is what makes the scan dynamic. `status-set` is not asked about a settings section, because a settings section has no lifecycle; `unchanged-scope` is not asked about a new page, because there is nothing yet to preserve; `commitment` is not asked until money is in the request.

Add a slot when a delivery has gone wrong for want of an answer nobody thought to ask for. Do not add a slot for something the documents already decide — the intake collects product facts, not design opinions.

## 3. Running The Scan

### 3.1 The Scan Is The Floor; The Questions Are Yours

```bash
node maintenance/scripts/intake.mjs --brief "<the request, verbatim>"
```

This prints a brief, not a question block. It names every decision this request leaves open, the default each one takes, what consumes it, and whether the object has a documented contract. Then you write the questions.

Write them as this request's problem. A catalog slot asks "whose view is this"; on a profile page the real question is whether someone is evaluating this person or looking at their own page, and only the agent reading the request knows which framing fits. Draw the options from the object's contract in `PATTERNS.md` when it has one. Use the requester's language.

You may rewrite any question, replace the catalog's options with the ones this request actually has, merge two decisions into one where they are one decision here, and add up to two questions the catalog does not cover.

You may not drop an open decision without asking it or stating its default, invent a default other than the one the catalog gives, or ask about something the request already settled — echo those instead, so a misreading is corrected before it costs anything.

That division is the whole design. The scan cannot write a good question; it can guarantee that no decision is silently skipped, including the one you would not have thought of. The model cannot guarantee coverage; it is the only thing that can ask well.

### 3.1A When There Is No Model

`intake.mjs` without `--brief` prints a serviceable question block straight from the catalog — generic wording, generic options. It is the fallback for a pipeline with no model in it, and it is worse than what a model writes. `--json` returns the same result as data, `--defaults` skips asking and prints the assumption block, `--catalog` prints every slot, `--selftest` runs the detection cases.

### 3.2 Without It

An agent that cannot run a script reads `docs/intake.slots.json` and performs the same four steps by hand:

1. Discard every slot whose `applies` signals are absent from the request.
2. For each remaining slot, decide whether the request settles it. Quote the words that settle it.
3. Sort the unsettled slots by `impact`, then by catalog order. Ask the first five.
4. Report the rest as taking their defaults.

### 3.3 When Judgement And The Scan Disagree

The scan matches text; it does not understand it. A request to "add a refund notice" contains the word `refund` and will read `primary-action` as settled when the actual primary action is something else. An agent that can tell the difference corrects the reading and says so. It may also add up to two questions of its own for something specific to this request that no slot covers — but it does not drop a question the scan raised without answering it from the request.

## 4. What The Requester Sees

One block. Settled items first, so a misreading is visible before it costs anything; then the open questions, each with its options, its default and one line on what it changes; then a free-text invitation and the escape hatch.

```md
## Request intake — 3 open decisions

**Read as already settled — correct me if any of these is wrong:**

- What are we building — “page”
- Primary action — “reschedule”

**Open. Answer what you care about; skip the rest and I take the default noted.**

1. Whose view is this — the student's, the teacher's, both (switchable), or a logged-out visitor's?
   - Options: student · teacher · both, switchable · logged-out visitor
   - If you skip: student
   - Why it matters: … (EXECUTION.md §3.1 Task Interpretation)

…

2 lower-impact decisions also went unanswered and will take the default: …

Anything specific about content, copy or constraints I should honour?

Say “Decide for me” and I apply every default above and start now.
```

Ask in the language the request was written in. Do not renumber, reorder or expand the block into a form.

## 5. What Happens To The Answers

The answers, the settled items and the defaults become the intake `EXECUTION.md §2.5` describes, and the agent proceeds from `EXECUTION.md §3` as usual. Before building, it states the result in one block:

```md
Confirmed: what the request said, quoted
Answered: what the requester chose just now
Assumed: every default taken, named as a default
```

`Assumed` is not optional and is not a summary. It is the list of decisions the requester never made, kept visible so any of them can be reversed with one sentence — and it is the same list that `EXECUTION.md §15.2` expects in the delivery record.

If the requester takes the escape hatch, there is no `Answered` section and every unsettled slot appears under `Assumed`.

## 6. Where This Runs

| Surface | How the intake reaches it |
| --- | --- |
| Claude Code, in this repository | `CLAUDE.md` → `AGENTS.md` → this document |
| Any agent reading `AGENTS.md` (Codex, Cursor, Zed, Aider, Gemini CLI, Jules) | `AGENTS.md` → this document |
| GitHub Copilot | `.github/copilot-instructions.md` → `AGENTS.md` |
| claude.ai/design, and any vendored copy of the kit | `maintenance/scripts/build-ds-project.mjs` copies this document and the catalog into `guidelines/` |
| A pipeline with no agent in it | `intake.mjs --json`, consumed directly |

An agent with no instruction file support still works if the operator pastes the output of `intake.mjs` into the conversation. The catalog is the portable part; every row above is only a way of getting an agent to read it.

## 7. Related Documents

- Execution rules, intake fields, and the response structure: `EXECUTION.md`
- Product direction and decision principles: `DESIGN.md`
- Visual foundations and component contracts: `COMPONENTS.md`
- Product composition and object relationships: `PATTERNS.md`
