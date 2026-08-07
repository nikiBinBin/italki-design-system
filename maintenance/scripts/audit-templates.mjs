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

  console.log(`  ${template.name.padEnd(16)} sidebar ${state.width}px${state.collapsed ? ' collapsed' : ''} · ${state.navRows} rows · top nav ${state.topNavFilled ? 'filled' : 'EMPTY'}`);
  await page.close();
}

await browser.close();
server.close();
console.log(findings.length ? `\n${findings.length} finding(s):` : '\nno findings');
findings.forEach((f) => console.log('  ' + f));
process.exitCode = findings.length ? 1 : 0;
