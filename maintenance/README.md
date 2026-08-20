# Catalog Runtime Maintenance

This directory contains validation-only tooling for the local design-system Catalog. It is not required to view or distribute `index.html`.

- `scripts/` builds the browser-readable component and Foundation API indexes, and checks tokens, props, ARIA, asset roots, production mappings, and Catalog consumption. `build-ds-project.mjs` builds the claude.ai/design payload from the catalog runtime.
- `kit-source/intake/` is the intake system: the protocol, its slot catalog, the runnable gap scan, and the two enforcement gates. Nothing in this repository runs it — it exists to be packaged into the shareable kit by `scripts/build-agent-kit.mjs`, which is the one flavour whose reader puts questions to a requester.
- `fixtures/` contains visual regression inputs.
- `tests/` contains the Playwright checks and their snapshots.

Run from the design-system root:

```bash
npm --prefix maintenance run component:check -- button
npm --prefix maintenance run serve:catalog
npm --prefix maintenance run test:contract
```

**Dependencies are not kept in the tree.** `test:contract` (contracts, tokens,
assets, runtime, Catalog consumption, foundation lint) and
`build-ds-project.mjs` run on plain Node with nothing installed — that covers
almost every check. Only `test:visual` needs Playwright, so install it just
before you need it and remove it afterwards:

```bash
npm --prefix maintenance ci && npm --prefix maintenance run test:visual
```

`serve:catalog` exposes the static files only on `127.0.0.1:4173`; it is for local review and browser automation, not deployment. Open `http://127.0.0.1:4173/index.html` instead of the `file://` URL when Browser Use or visual tests need to inspect the Catalog.

Runtime files remain at the root in `catalog-runtime/` because `index.html` loads them directly through relative paths.

