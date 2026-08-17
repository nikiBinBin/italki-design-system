# AGENTS.md

Instructions for any agent working in this repository or building product UI with this design system. Vendor-neutral by design: nothing here depends on which assistant is reading it.

## Before you build: run the intake

A request to design or build something does not start with code. It starts with the gap scan in `docs/INTAKE.md`:

```bash
node maintenance/scripts/intake.mjs "<the request, verbatim>"
```

Send the block it prints, wait for whatever the requester chooses to answer, then proceed. Rules that matter more than the mechanism:

- Ask only what the request left open. The scan already discards decisions the request settled and decisions that do not apply to it.
- Never block. Every question carries a default; silence means the default is taken and named.
- State `Confirmed / Answered / Assumed` before building, and keep `Assumed` in the delivery record.

No Node available, or a surface where you cannot run a command? Read `docs/intake.slots.json` and perform the same scan by hand — `docs/INTAKE.md §3.2` has the four steps.

Skip the intake only when the request is not a build: a question about the system, a rename, a typo, a file move.

## Then read, in this order

1. `docs/DESIGN.md` — product direction and the non-negotiable rules.
2. `docs/COMPONENTS.md` — foundations, content style, component contracts.
3. `docs/PATTERNS.md` — italki product compositions and object relationships.
4. `docs/EXECUTION.md` — how a request becomes a page: hierarchy, states, responsive behaviour, validation.

Each document names what it owns. On conflict, the owning document wins — `EXECUTION.md §1.5`.

## Non-negotiables when writing UI

- **Compose from the catalog.** `catalog-runtime/italki-ui.js` renders every component; `index.html` shows every documented state. Do not hand-write a dialog, popover, drawer or panel — the layering, focus handling and dismiss behaviour are in the component and not in your markup.
- **Props are asserted at runtime.** `catalog-runtime/contracts.js` throws on a prop a component does not accept. The prop list in a component's contract is exhaustive, not indicative; do not carry prop names over from another design system.
- **Tokens, never hex.** Style your own containers with the custom properties in `catalog-runtime/tokens.css`. `--ui-color-primary` fills surfaces and is never a text colour; a clickable word is `Link` or `Button variant="link"`.
- **One `variant="red"` action per page or task step.** It is the booking/conversion action.
- **Assets resolve against the runtime**: `Assets/Icons/<name>.svg`, `Assets/Flags/<iso-2>.svg`, no leading slash and no `../` prefix.
- **Never expose component names or internal rule names in a product screen.**

## Repository rules

- **Never `git checkout` or `git restore` a path here.** This working tree is normally dirty with uncommitted work that is not yours, and often not written by an agent at all. To undo something you just added, edit it back out; to set your own work aside, `git stash push -p` the hunks that are yours. On 2026-08-17 a `git checkout maintenance/scripts/build-ds-project.mjs` — run to revert one inlined block — took 334 unrelated uncommitted lines with it. They were in no commit, no stash and no dangling object, and are still gone; `maintenance/PROMPT-NOTES-LOST.md` is the account. Assume another session is editing the same files right now.
- The JSON indexes in `catalog-runtime/` are generated. Rebuild them with `npm --prefix maintenance run build:api`; never hand-edit them.
- `index.html` and `catalog.css` stay at the repository root — the deployed site loads them from there.
- `test-results/` and `maintenance/test-results/` are local artifacts, not source.

## Checks

```bash
npm --prefix maintenance run test:contract     # contracts, tokens, assets, runtime, consumption
npm --prefix maintenance run intake -- --selftest
npm --prefix maintenance run serve:catalog     # http://127.0.0.1:4173/index.html
```

`test:contract` and the intake run on plain Node with nothing installed. Only `test:visual` needs Playwright — install it just before you need it and remove it afterwards.
