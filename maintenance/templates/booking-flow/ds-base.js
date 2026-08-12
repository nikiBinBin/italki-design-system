// Loads this design system into the template.
//
// The base used to be the literal '../..', resolved against the page URL. That
// holds when the page is opened at its own path and breaks the moment the host
// serves it from anywhere else — and it breaks silently: the stylesheet links
// 404 while the host's own copy of the CSS keeps the page looking correct, so
// the only visible symptom is that every component needing the bundle renders
// nothing. Locate the folder from this script's own URL instead, which is true
// wherever the page is served from.
(() => {
  const self = document.currentScript && document.currentScript.src;
  const base = self ? new URL('../../', self).href : '../../';
  for (const p of ["tokens/tokens.css", "_ds_bundle.css", "styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '_ds_bundle.js';
  s.onerror = () => {
    console.error('ds-base.js: failed to load ' + s.src);
    /* Last resort: the project root on this origin. Better a second request
       than a page whose components are all missing. */
    const retry = document.createElement('script');
    retry.src = new URL('/_ds_bundle.js', location.href).href;
    retry.onerror = () => console.error('ds-base.js: also failed to load ' + retry.src);
    document.head.appendChild(retry);
  };
  document.head.appendChild(s);
})();
