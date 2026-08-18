# CLAUDE.md

Read `AGENTS.md`. It is the single instruction file for every agent working in this repository, and it applies here without amendment.

The one rule that must not wait on that read: **a request to design or build a page, section, unit, overlay, flow step or enhancement starts with the intake, not with code.**

```bash
node maintenance/scripts/intake.mjs --brief "<the request, verbatim>"
```

It prints a brief, not a question block: every decision this request leaves open, each default, and whether the object has a contract. **You write the questions** — in the requester’s language, with this request’s real options. Then present the block and **stop** — do not create or modify implementation files until the answers come back. Silence is not authorization to use defaults; they may be applied only when the requester explicitly says “你来决定”, “decide for me”, or otherwise clearly authorizes the ones listed. Once authorized, state them under `Assumed` and build. `docs/INTAKE.md` is the protocol; `docs/intake.slots.json` is the catalog. Skip the intake only when the request is not a build: a question about the system, a rename, a typo, a file move.
