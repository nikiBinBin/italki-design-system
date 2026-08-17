#!/usr/bin/env node
/* Renders each template the way the app does — real browser, real bundle, React
   supplied by the host — and asks the questions that a static read cannot:
   did the shell mount, does it stay put when the page scrolls, does anything
   the contract rejected end up on screen as red text, and does clicking the
   things a person clicks actually do something.

   It exists because none of that was answerable without uploading and asking
   someone to refresh. Every failure below was found that slow way at least
   once.

     npm --prefix maintenance run audit:templates
*/
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { templateHost, templatePages, repoRoot, syncNote } from './template-host.mjs';

const require = createRequire(import.meta.url);
const { server, TEMPLATES } = templateHost(path.resolve(process.argv[2] ?? repoRoot()));
const REACT = path.dirname(require.resolve('react/package.json'));
const REACT_DOM = path.dirname(require.resolve('react-dom/package.json'));

await new Promise((r) => server.listen(4600, r));
console.log(syncNote(TEMPLATES));

const browser = await chromium.launch();
const findings = [];
const templates = templatePages(TEMPLATES);

for (const template of templates) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message.slice(0, 120)));
  /* The app puts React on the page before the template runs; so does this. */
  await page.addInitScript({ path: path.join(REACT, 'umd/react.production.min.js') });
  await page.addInitScript({ path: path.join(REACT_DOM, 'umd/react-dom.production.min.js') });
  await page.goto(`http://127.0.0.1:4600${template.url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  const say = (text) => findings.push(`${template.name}: ${text}`);
  const state = await page.evaluate(() => {
    const sidebar = document.querySelector('.ui-sidebar');
    const topNav = document.querySelector('.ui-top-nav');
    const rect = (el) => el && el.getBoundingClientRect();
    return {
      sidebar: !!sidebar,
      collapsed: sidebar ? sidebar.classList.contains('is-collapsed') : null,
      width: sidebar ? Math.round(rect(sidebar).width) : 0,
      navRows: document.querySelectorAll('.ui-sidebar__nav-row').length,
      topNav: !!topNav,
      topNavFilled: topNav ? topNav.textContent.trim().length > 0 : false,
      /* nav and sections share an inset; a mismatch is the "blank strip" fault. */
      /* A hidden element is not a reference point: the collapsed rail hides its
         sections, and comparing against a zero-width box reports a fault that
         is not there. */
      navLeft: (() => { const n = sidebar?.querySelector('.ui-sidebar__nav'); const r = rect(n);
        return r && r.width > 0 ? Math.round(r.left - rect(sidebar).left) : null; })(),
      sectionLeft: (() => { const n = sidebar?.querySelector('.ui-sidebar__section'); const r = rect(n);
        return r && r.width > 0 ? Math.round(r.left - rect(sidebar).left) : null; })(),
      brokenImages: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')).slice(0, 4),
      /* A prop the contract rejected is rendered as the error, in place. */
      contractErrors: [...document.querySelectorAll('div')].map((n) => n.textContent)
        .filter((t) => t && t.length < 160 && /does not accept|Unapproved asset|Unknown icon|is not a function|require/.test(t)).slice(0, 3),
      kitMissing: !!document.getElementById('ds-kit-missing'),
    };
  });

  if (!state.sidebar) say('no sidebar rendered');
  if (!state.topNav) say('no top nav rendered');
  if (state.topNav && !state.topNavFilled) say('top nav rendered empty');
  if (state.sidebar && state.navRows === 0) say('sidebar has no navigation rows');
  if (state.navLeft !== null && state.sectionLeft !== null && state.navLeft !== state.sectionLeft) {
    say(`nav and sections are not aligned (${state.navLeft} vs ${state.sectionLeft})`);
  }
  if (state.brokenImages.length) say(`broken images: ${state.brokenImages.join(', ')}`);
  if (state.contractErrors.length) say(`contract errors on screen: ${state.contractErrors.join(' | ')}`);
  if (state.kitMissing) say('the kit-missing banner is showing');
  if (errors.length) say(`page errors: ${errors[0]}`);

  /* The helmet is not run once — the runtime re-executes it on a re-render, and
     the flag that stops the dispatcher binding twice lives on the window, so it
     outlives any single execution. Defining SafeUI therefore has to be
     unconditional: it is a namespace the next render needs to exist, not a
     side effect to perform once. Guarding the whole file with that one flag
     meant a second pass returned before defining it, and every x-import
     resolved to nothing — no sidebar, no top nav, no calendar, which is exactly
     the set of things that come through that namespace.
     Asserted the way it actually breaks: flag set, namespace gone. */
  const rerun = await page.evaluate(async (url) => {
    const src = await fetch(url).then((r) => r.text());
    window.__dsSafeBound = true;
    delete window.SafeUI;
    new Function(src)();
    return { safeUI: typeof window.SafeUI, sidebar: typeof window.SafeUI?.Sidebar };
  }, `http://127.0.0.1:4600${template.url.replace(/[^/]+$/, 'ds-safe.js')}`);
  if (rerun.safeUI !== 'object') say('re-running ds-safe.js does not restore SafeUI');
  else if (rerun.sidebar !== 'function') say('re-running ds-safe.js does not restore SafeUI.Sidebar');

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(250);
  const pinned = await page.evaluate(() => ({
    sidebar: document.querySelector('.ui-sidebar') ? Math.round(document.querySelector('.ui-sidebar').getBoundingClientRect().top) : null,
    topNav: document.querySelector('.ui-top-nav') ? Math.round(document.querySelector('.ui-top-nav').getBoundingClientRect().top) : null,
  }));
  if (pinned.sidebar !== null && Math.abs(pinned.sidebar) > 2) say(`sidebar scrolled away (top ${pinned.sidebar})`);
  if (pinned.topNav !== null && Math.abs(pinned.topNav) > 2) say(`top nav scrolled away (top ${pinned.topNav})`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  /* The controls a person reaches for first. Collapse is hidden while
     collapsed — the brand expands it — so ask for whichever is showing. */
  const wasCollapsed = await page.evaluate(() => document.querySelector('.ui-sidebar')?.classList.contains('is-collapsed'));
  const toggle = wasCollapsed ? '[data-demo="ui-sidebar-brand"]' : '[data-demo="ui-sidebar-collapse"]';
  await page.click(toggle, { force: true }).catch(() => say('the collapse toggle could not be clicked'));
  await page.waitForTimeout(300);
  const nowCollapsed = await page.evaluate(() => document.querySelector('.ui-sidebar')?.classList.contains('is-collapsed'));
  if (nowCollapsed === wasCollapsed) say('the collapse toggle did nothing');

  await page.click(toggle === '[data-demo="ui-sidebar-brand"]' ? '[data-demo="ui-sidebar-collapse"]' : '[data-demo="ui-sidebar-brand"]', { force: true }).catch(() => {});
  await page.waitForTimeout(300);
  await page.click('[data-demo="ui-sidebar-more"]', { force: true }).catch(() => say('More could not be clicked'));
  await page.waitForTimeout(300);
  const moreOpen = await page.evaluate(() => document.querySelector('.ui-sidebar__more')?.classList.contains('is-open'));
  if (!moreOpen) say('More did not open');

  /* Everything the filter drawer renders has to be bound to something.

     The drawer composes from the kit, so its controls arrive as data-demo hooks
     with no onClick — and for the ones the kit had no helper for, nothing bound
     them: 30 chips, 28 category chips, 6 parent checkboxes and both price
     handles rendered perfectly and could not be touched. Nothing failed, the
     shell audit passed, and the drawer looked complete. The behaviour is a kit
     helper now and both dispatchers bind it; this is what keeps them honest.

     Declared exemptions are hooks that genuinely need no click handler. */
  const DRAWER_NOT_CLICK = new Set([
    'ui-slider', 'ui-slider-range', // inputs too — synced on `input`
    'filter-apply',        // the page's own decision: this template closes the drawer
  ]);
  if (await page.$('[data-demo="ui-top-nav-filter"]')) {
    await page.click('[data-demo="ui-top-nav-filter"]').catch(() => say('the Filter control could not be clicked'));
    await page.waitForTimeout(500);
    const drawer = await page.evaluate(() => {
      const stage = document.querySelector('#teacher-filter-modal');
      if (!stage || !stage.classList.contains('is-open')) return null;
      const hooks = {};
      for (const node of stage.querySelectorAll('[data-demo]')) hooks[node.dataset.demo] = (hooks[node.dataset.demo] ?? 0) + 1;
      const chip = stage.querySelector('[data-demo="ds-chip"]');
      /* Asked of the thing itself, not of the table: click a chip and see. */
      const before = chip?.classList.contains('is-selected');
      chip?.click();
      return { hooks, chipMoved: chip ? chip.classList.contains('is-selected') !== before : null };
    });
    if (!drawer) say('the filter drawer did not open');
    else {
      const bound = new Set([...(await page.evaluate(async (url) => {
        const source = await fetch(url).then((r) => r.text());
        return [...source.matchAll(/"([a-z0-9-]+)":\s*\(c\)/g)].map((m) => m[1]);
      }, `http://127.0.0.1:4600${template.url.replace(/[^/]+$/, 'ds-safe.js')}`))]);
      for (const [hook, count] of Object.entries(drawer.hooks)) {
        if (bound.has(hook) || DRAWER_NOT_CLICK.has(hook)) continue;
        say(`the filter drawer renders ${count} × "${hook}" and nothing binds it`);
      }
      if (drawer.chipMoved === false) say('clicking a filter chip does not select it');

      /* The nav's cue has to mean "filters are applied", not "the panel was
         opened" — it used to flip on every press of the control, with a count
         that came from a prop nobody updated. And Reset had no hook at all, so
         it rendered and did nothing. Both are asked of the rendered page: one
         chip selected reads 1 and lights the dot, Reset returns it to 0 and
         empties the panel. */
      const cue = await page.evaluate(async () => {
        /* The cue fades in over 180ms, so a computed opacity read on the same
           tick as the class lands is still the start of the transition. */
        const settle = () => new Promise((done) => setTimeout(done, 260));
        await settle();
        const nav = document.querySelector('[data-demo="ui-top-nav-filter"]');
        const panel = document.querySelector('#teacher-filter-modal');
        const read = () => ({
          count: Number(nav.dataset.filterCount || 0),
          lit: getComputedStyle(nav.querySelector('i')).opacity === '1',
          copy: nav.querySelector('span').textContent,
        });
        const afterOneChip = read();
        const reset = panel.querySelector('[data-demo="filter-reset"]');
        reset?.click();
        await settle();
        return { afterOneChip, hasReset: !!reset, afterReset: read(),
                 leftSelected: panel.querySelectorAll('[data-demo="ds-chip"].is-selected, [data-filter-category-child].is-selected').length };
      });
      if (cue.afterOneChip.count !== 1 || !cue.afterOneChip.lit) {
        say(`one selected filter should read 1 and light the cue — got ${cue.afterOneChip.count} and ${cue.afterOneChip.lit ? 'lit' : 'unlit'} ("${cue.afterOneChip.copy}")`);
      }
      if (!cue.hasReset) say('the filter drawer has no Reset control');
      else if (cue.afterReset.count !== 0 || cue.afterReset.lit || cue.leftSelected) {
        say(`Reset left ${cue.leftSelected} selection(s) and the cue at ${cue.afterReset.count}`);
      }
    }
    await page.click('[data-demo="ui-modal-close"]').catch(() => {});
    await page.waitForTimeout(300);
  }

  /* Shape belongs to the action row, not to the button. `default` resolves by
     size — 32 is a pill, 40 and 48 are rounded — so a single override, or a
     single mixed size, leaves one button on the system's answer and its
     neighbour on someone's: a pill CTA beside a rounded secondary, both legal
     on their own, in the same bar. Nothing in the contract can catch that,
     because nothing is wrong with either button; it is only visible once two of
     them are standing next to each other, which is what this asks. */
  const shapeSplits = await page.evaluate(() => {
    const shapeOf = (b) => b.classList.contains('ui-button--pill') ? 'pill'
      : b.classList.contains('ui-button--rounded') ? 'rounded' : 'default';
    const sizeOf = (b) => ['32', '40', '48'].find((s) => b.classList.contains(`ui-button--${s}`)) ?? '?';
    const onScreen = [...document.querySelectorAll('.ui-button')]
      .filter((b) => b.getBoundingClientRect().width > 0);
    /* The row is the nearest ancestor holding more than one button. */
    const rows = new Map();
    for (const button of onScreen) {
      let parent = button.parentElement;
      while (parent && parent !== document.body) {
        if (parent.querySelectorAll('.ui-button').length > 1) break;
        parent = parent.parentElement;
      }
      if (!parent || parent === document.body) continue;
      if (!rows.has(parent)) rows.set(parent, []);
      rows.get(parent).push(button);
    }
    const findings = [];
    for (const [row, list] of rows) {
      if (list.length < 2) continue;
      /* Side by side, not stacked: a column of buttons is not an action row. */
      const tops = new Set(list.map((b) => Math.round(b.getBoundingClientRect().top / 8)));
      if (tops.size > 1) continue;
      if (new Set(list.map(shapeOf)).size < 2) continue;
      findings.push({
        row: (row.className || row.tagName).toString().trim().split(/\s+/)[0],
        buttons: list.map((b) => `${(b.textContent || '').trim().slice(0, 22) || '(icon)'} ${sizeOf(b)}/${shapeOf(b)}`),
      });
    }
    return findings;
  });
  for (const split of shapeSplits) {
    say(`one action row, two shapes — ${split.buttons.join(' vs ')} (in .${split.row}). Shape is the row's, not the button's`);
  }

  /* Two faults that only show up once the window is narrower than whoever
     wrote the page was: the page scrolls sideways, and the app frame stops
     covering the content it is supposed to cover.

     Both were found by eye. The sideways scroll came from one min-width:1280px
     on the outer wrapper, which also made the 1180px and 900px breakpoints in
     the pattern stylesheets unreachable — they had never once run. The
     stacking fault was the top nav's language menu appearing underneath the
     profile's pinned tab bar, because the bar and the nav both sat at z-index
     30 and the bar came later in the markup.

     Asking at 1024 rather than at 1440 is the whole point: at 1440 both pass. */
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.waitForTimeout(400);
  const narrow = await page.evaluate(() => {
    const doc = document.documentElement;
    const widest = () => {
      let worst = null;
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.right <= doc.clientWidth + 1) continue;
        if (!worst || r.right > worst.right) worst = { right: Math.round(r.right), el };
      }
      if (!worst) return null;
      const s = getComputedStyle(worst.el);
      return `${worst.el.tagName.toLowerCase()}${worst.el.id ? '#' + worst.el.id : ''}` +
        `${worst.el.className ? '.' + worst.el.className.toString().trim().split(/\s+/).join('.') : ''}` +
        ` (min-width ${s.minWidth}, reaches ${worst.right}px)`;
    };
    return { overflow: doc.scrollWidth - doc.clientWidth, widest: widest() };
  });
  if (narrow.overflow > 0) say(`scrolls sideways by ${narrow.overflow}px at 1024 — widest box ${narrow.widest}`);

  /* The shell is only above the page if it is above the page's own pinned
     bars, so the question has to be asked with one of those bars pinned. */
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(300);
  await page.click('.ui-top-nav-context__trigger', { force: true }).catch(() => say('the top nav context trigger could not be clicked'));
  await page.waitForTimeout(300);
  const covered = await page.evaluate(() => {
    const menu = document.querySelector('.ui-top-nav-context__menu');
    if (!menu) return null;
    const m = menu.getBoundingClientRect();
    if (m.width === 0) return null;
    /* Sample down the menu: whatever the page pins, the menu must be the thing
       a click lands on everywhere it is drawn. */
    for (const t of [0.1, 0.35, 0.6, 0.85]) {
      const hit = document.elementFromPoint(m.left + m.width / 2, m.top + m.height * t);
      if (hit && !hit.closest('.ui-top-nav-context__menu')) {
        return `${hit.tagName.toLowerCase()}${hit.className ? '.' + hit.className.toString().trim().split(/\s+/)[0] : ''}` +
          ` covers the top nav menu (z-index ${getComputedStyle(hit.closest('[style*="z-index"], [id]') || hit).zIndex})`;
      }
    }
    return null;
  });
  if (covered) say(covered);

  console.log(`  ${template.name.padEnd(16)} sidebar ${state.width}px${state.collapsed ? ' collapsed' : ''} · ${state.navRows} rows · top nav ${state.topNavFilled ? 'filled' : 'EMPTY'}`);
  await page.close();
}

await browser.close();
server.close();
console.log(findings.length ? `\n${findings.length} finding(s):` : '\nno findings');
findings.forEach((f) => console.log('  ' + f));
process.exitCode = findings.length ? 1 : 0;
