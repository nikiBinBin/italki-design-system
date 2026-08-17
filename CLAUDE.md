# CLAUDE.md

Read `AGENTS.md`. It is the single instruction file for every agent working in this repository, and it applies here without amendment.

The one rule that must not wait on that read: **a request to design or build a page, section, unit, overlay, flow step or enhancement starts with the intake, not with code.**

```bash
node maintenance/scripts/intake.mjs "<the request, verbatim>"
```

Send the block it prints, take whatever the requester chooses to answer, then build. Every question carries a default, so silence is an answer — state the defaults you took under `Assumed` and keep building. `docs/INTAKE.md` is the protocol; `docs/intake.slots.json` is the catalog. Skip the intake only when the request is not a build: a question about the system, a rename, a typo, a file move.
