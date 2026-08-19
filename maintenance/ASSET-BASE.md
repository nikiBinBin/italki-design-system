# Assets resolve from the hosted site

Decided 2026-08-19. Written for whoever is holding `build-agent-kit.mjs` and
`build-ds-project.mjs`, because that is where the last piece lands.

## The decision

An icon stays a **path**. It does not become inline SVG. What changes is the
prefix the runtime puts in front of it:

```js
window.ITalkiUIAssetBase = "https://design.italkiux.com/";
```

`withBase()` in `catalog-runtime/italki-ui.js` already does this — a path that
does not start with a protocol, a slash or a dot gets the base prepended. No
component signature changes, no call site changes, `<img src>` and
`mask-image: url()` keep their shape.

## Why not inline the SVG

It was the first idea and it is the wrong size of hammer. Inlining covers what
`icon()` emits and nothing else:

- `Assets/Flags/` — 252 flags reached by `flag()` and `avatar variant="with-flag"`, still external
- `Assets/Images/` — photographs, cannot be inlined at all
- the mask glyphs — Stepper's marker, Selection's category mark, Calendar's
  timezone pin — need a URL, so they would become `data:` URIs and grow

And the cost is the whole set in every page: italki's own 365 icons are ~1.5MB
of SVG source, the full set 6.1MB, against a 392KB bundle today. The base fixes
all three asset families and costs nothing.

## Measured, not assumed (2026-08-19)

- `curl -I https://design.italkiux.com/Assets/Icons/add.svg` → `200`,
  `access-control-allow-origin: *`, `cache-control: max-age=600`
- Cross-origin `mask-image: url(https://design.italkiux.com/…)` composites
  identically to the same-origin one — probed side by side in a page on
  `http://localhost:4173`, both painted the glyph
- With the base set, `button`, `flag` and `avatar` emitted
  `https://design.italkiux.com/Assets/{Icons,Flags,Images}/…` and all three
  loaded (24px, 150px, 240px natural widths)

## Where to set it

- **The vendored `_ds/<kit>/` copy inside a design project** — this is the one
  that is actually broken today. That copy ships the bundle, tokens and README
  and no `Assets/` at all, so a generated page asks for `Assets/Icons/x.svg`
  next to itself and every image 404s. Set the base in whatever bootstraps the
  kit there.
- **The exported agent kit** — set it, and then `Assets/` does not need to ship
  at all. That is 7.4MB of the export's 9.7MB; the zip goes from 5.6MB to under
  1MB. It is the same change as making the kit an agent kit rather than a
  mirror: the recipient downloads rules, contracts and a runtime, not 1,536
  SVG files.

## Where **not** to set it

- **The repository's own Catalog** and **the DS project's component pages**.
  Both are same-origin with their assets, and the DS pages already declare
  their own depth (`window.ITalkiUIAssetBase="../../../"` at the top of each
  `<Name>.html`). Pointing those at production means local work silently reads
  from the last deploy — you would edit an icon and not see it change.
- **As a hardcoded default inside the runtime.** Keep the default empty. A page
  that needs the hosted copy says so; a page that ships its own assets says
  nothing. Anyone taking this to production must be able to point the base at
  their own copy in one line, because hotlinking a design-system site is not a
  production dependency anyone should inherit by accident.
