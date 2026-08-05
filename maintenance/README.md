# Catalog Runtime Maintenance

This directory contains validation-only tooling for the local design-system Catalog. It is not required to view or distribute `index.html`.

- `scripts/` builds the browser-readable component, Foundation, and Panda API indexes, and checks tokens, props, ARIA, asset roots, production mappings, and Catalog consumption.
- `fixtures/` contains visual regression inputs.
- `tests/` and `test-results/` contain Playwright checks, snapshots, and transient output.
- `node_modules/` is local test tooling only.

Run from the design-system root:

```bash
npm --prefix maintenance run component:check -- button
npm --prefix maintenance run serve:catalog
npm --prefix maintenance run test
```

`serve:catalog` exposes the static files only on `127.0.0.1:4173`; it is for local review and browser automation, not deployment. Open `http://127.0.0.1:4173/index.html` instead of the `file://` URL when Browser Use or visual tests need to inspect the Catalog.

Runtime files remain at the root in `catalog-runtime/` because `index.html` loads them directly through relative paths.

`docs/reference/PANDA_API.md` and `catalog-runtime/panda-api.json` are the prop-level bridge from Catalog examples to the current Panda implementation. They distinguish direct Panda props from product adapters, Catalog-only fixture controls, and implementation gaps.
