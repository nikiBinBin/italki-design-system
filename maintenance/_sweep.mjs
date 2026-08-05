import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad/sweep";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1200 } });

// enumerate routes from the static sidebar
const probe = await ctx.newPage();
await probe.goto("http://127.0.0.1:4173/index.html#components", { waitUntil: "load" });
const routes = await probe.locator('.sidebar-navigation a[href^="#"]').evaluateAll((links) => [
  ...new Set(links.map((l) => l.getAttribute("href").slice(1)).filter(Boolean)),
]);
await probe.close();

const shoot = async (base, route, file) => {
  const p = await ctx.newPage();
  try {
    await p.goto(`${base}?route=${route}#${route}`, { waitUntil: "load" });
    await p.waitForFunction(() => (document.querySelector("main")?.innerText ?? "").trim().length > 0, undefined, { timeout: 12000 });
    await p.waitForTimeout(600);
    const main = p.locator("main");
    const box = await main.boundingBox();
    await main.screenshot({ path: file });
    return box?.height ?? 0;
  } catch (e) {
    return -1;
  } finally {
    await p.close();
  }
};

const results = [];
for (const route of routes) {
  const sFile = `${OUT}/s-${route}.png`;
  const rFile = `${OUT}/r-${route}.png`;
  const sh = await shoot("http://127.0.0.1:4173/index.html", route, sFile);
  const rh = await shoot("http://127.0.0.1:5199/", route, rFile);
  if (sh < 0 || rh < 0) {
    results.push({ route, error: true });
    continue;
  }
  results.push({ route, sh, rh });
}

// pixel-diff pairs in-browser via canvas
const differ = await ctx.newPage();
await differ.goto("about:blank");
for (const r of results) {
  if (r.error) continue;
  const s = readFileSync(`${OUT}/s-${r.route}.png`).toString("base64");
  const rr = readFileSync(`${OUT}/r-${r.route}.png`).toString("base64");
  r.diff = await differ.evaluate(async ([a, b]) => {
    const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + b64; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const cap = 2400; const H = Math.min(h, cap);
    const cv = (img) => { const c = new OffscreenCanvas(w, H); const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, H).data; };
    const da = cv(ia), db = cv(ib);
    let bad = 0, total = w * H;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 48) bad++;
    }
    return { pct: +(100 * bad / total).toFixed(2), w, h: H, heightDelta: Math.abs(ia.height - ib.height) };
  }, [s, rr]);
}
await browser.close();

results.sort((x, y) => (y.diff?.pct ?? 999) - (x.diff?.pct ?? 999));
writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 1));
for (const r of results) {
  if (r.error) console.log(`${r.route}: ERROR`);
  else console.log(`${r.route}: ${r.diff.pct}% diff, heightΔ ${r.diff.heightDelta}px (s ${r.sh} / r ${r.rh})`);
}
