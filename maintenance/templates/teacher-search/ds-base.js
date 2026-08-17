// Loads this design system into the template.
//
// The base used to be the literal '../..', resolved against the page URL. That
// holds when the page is opened at its own path and breaks the moment the host
// serves it from anywhere else — and it breaks silently: the stylesheet links
// 404 while the host's own copy of the CSS keeps the page looking correct, so
// the only visible symptom is that every component needing the bundle renders
// nothing. Resolving against this script's own URL fixed that much.
//
// It still assumed one layout. Three exist:
//
//   repo / DS project   templates/<name>/ds-base.js  → kit two levels up
//   design project      ds-base.js at the root       → kit under _ds/<kit-id>/
//
// A template copied into a design project — which is what "start from this
// template" does — therefore loaded nothing: '../..' leaves the project
// altogether, and even at the right depth the kit is not at the root there. The
// page still rendered, because the design app injects the bundle itself, so the
// only symptom was a screenful of unstyled markup and broken images. So the base
// is no longer assumed: it is the first candidate that answers for a file the
// kit is known to have.
//
// Assets resolve separately. In a design project the kit sits under _ds/ but
// Assets/ stays at the project root, so one base cannot serve both.
(() => {
  const self = document.currentScript && document.currentScript.src;
  const from = (path) => (self ? new URL(path, self).href : path);
  /* The vendored directory is named for the kit and the design-system project
     that publishes it, both of which are fixed. */
  const VENDORED = '_ds/italki-ui-kit-ds-3-0-f7eb9b7d-40fb-4766-bccc-0202f1c91fb8/';
  const KIT_BASES = [from('../../'), from('./'), from('./' + VENDORED), from('../../' + VENDORED)];
  const ASSET_BASES = [from('../../'), from('./')];

  const firstThatHas = async (bases, probe) => {
    for (const base of bases) {
      try {
        const response = await fetch(base + probe, { method: 'HEAD' });
        if (response.ok) return base;
      } catch { /* cross-origin or offline — try the next */ }
    }
    return null;
  };

  /* Published so ds-safe.js rewrites Assets/ paths against the same answer
     rather than repeating the search. */
  window.__dsAssetBase = firstThatHas(ASSET_BASES, 'Assets/Icons/cross.svg');

  (async () => {
    const base = (await firstThatHas(KIT_BASES, 'styles.css')) ?? KIT_BASES[0];
    for (const path of ['tokens/tokens.css', '_ds_bundle.css', 'styles.css']) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + path;
      document.head.appendChild(link);
    }
    /* The design app injects its own copy of the bundle; loading a second one
       would re-run the runtime and re-freeze the namespace. */
    if (window.ITalkiUI) return;
    const script = document.createElement('script');
    script.src = base + '_ds_bundle.js';
    script.onerror = () => console.error('ds-base.js: failed to load ' + script.src);
    document.head.appendChild(script);
  })();
})();
