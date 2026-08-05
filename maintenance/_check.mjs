import { chromium } from "playwright";
const STATIC = "http://127.0.0.1:4173/index.html";
const REACT = "http://127.0.0.1:5199/";
const sel = ".component-doc-block .component-doc-header h2, .component-doc-block > header > h2";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
async function info(base, route) {
  const p = await ctx.newPage();
  try {
    await p.goto(`${base}?route=${route}#${route}`, { waitUntil: "load" });
    await p.waitForFunction(() => (document.querySelector("main")?.innerText ?? "").trim().length > 0, undefined, { timeout: 15000 });
    await p.waitForTimeout(200);
    return await p.evaluate((s) => ({
      titles: [...document.querySelectorAll(s)].map((h) => h.textContent.trim()),
      text: (document.querySelector("main")?.innerText ?? "").replace(/\s+/g, " ").trim().length,
      orders: [...document.querySelectorAll("[data-catalog-order]")].map((e) => Number(e.dataset.catalogOrder)),
    }), sel);
  } finally { await p.close(); }
}
for (const route of process.argv.slice(2)) {
  const s = await info(STATIC, route);
  const r = await info(REACT, route);
  const match = JSON.stringify(s.titles) === JSON.stringify(r.titles);
  const ordered = r.orders.length > 0 && JSON.stringify(r.orders) === JSON.stringify([...r.orders].sort((a, b) => a - b));
  console.log(`#${route}: titles=${match ? "OK" : `FAIL s=${s.titles} r=${r.titles}`} ordered=${ordered} text s=${s.text} r=${r.text}`);
}
await browser.close();
