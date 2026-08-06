# Catalog Runtime

This folder powers the shareable static Design Catalog. It is not a React package and must not be imported by product applications.

## Files

- `contracts.json`: source registry for Catalog component props, states, tokens, assets, and mappings.
- `contracts.js`: browser-readable contract generated from `contracts.json`.
- `tokens.css`: semantic token values used by the static Catalog.
- `italki-ui.js` and `italki-ui.css`: framework-neutral renderer and presentation used by `index.html`.
- `component-api.json` and `foundation-api.json`: generated lookup indexes for Catalog components and colors.

## Boundary

`index.html` consumes this folder. `react-web/` is the React Web implementation that product applications consume.

## Generated Files

Run `npm --prefix maintenance run build:contracts` to generate `contracts.js`.

Run `npm --prefix maintenance run build:api` to generate the three `*-api.json` files and their matching documentation in `docs/reference/`.
