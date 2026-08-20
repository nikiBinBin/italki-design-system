# Intake records

One file per page this system builds, written before the page and kept beside it.

**Nothing in this repository enforces that any more, and nothing here writes
one.** On 2026-08-20 the intake moved to `maintenance/kit-source/intake/` and
became the packaged kit's alone: an agent working here is handed a request and
builds it, so it has nobody to put questions to. The write gate is gone from
`.claude/settings.json` and `check-intake.mjs` left `test:contract`.

Both gates still ship, and in a project that installed the kit they do exactly
what the rest of this file describes — `check-intake.mjs` fails a change under
the project's pages directory that arrives without a record naming it, and the
`PreToolUse` hook refuses the write before it lands. Read the rest as the
contract those gates enforce **there**.

The records already in this directory stay. They are why the pages beside them
look the way they do, and that does not expire with the tooling.

## Why a file rather than a rule in AGENTS.md

Because two agents were handed this system and neither ran the intake. AGENTS.md
is only loaded as instructions when it sits at the root of the agent's working
directory, so an agent given the kit as a folder never reads it; and the rule it
would have read said "never block", which the other one took as permission to
assume rather than ask. Prose cannot make an agent ask. A check on the commit
can, and it is the same check for every agent.

## Writing one

```bash
node maintenance/kit-source/intake/intake.mjs --record teacher-profile "<the request, verbatim>"
```

That writes `docs/intakes/<date>-<target>.md` with `Confirmed` and `Assumed`
already filled in — what the request settled, and what each unanswered decision
will default to. It leaves a TODO where the answers go.

Then send the question block the intake printed, and write what comes back under
`Answered`. Deleting the TODO without having asked is the one failure this
cannot detect; everything else it does.

If the requester says "decide for me", write that under `Answered`. That is an
answer, and it is the record of one.

## What a record is for

Six months on, the question about a page is never "what does it do" — the page
answers that. It is "why is it like this": why the student's view and not the
teacher's, why these four statuses, why no empty state. `Assumed` is the section
that earns the file: it lists the decisions nobody made, which are the ones that
will be wrong.
