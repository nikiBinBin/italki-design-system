import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
for (const [name, url] of [
  ["static-icons", "http://127.0.0.1:4173/index.html?route=lesson-card#lesson-card"],
  ["react-icons", "http://127.0.0.1:5199/#lesson-card"],
]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 3 });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  // measure every icon-ish element inside banners
  const info = await p.evaluate(() => {
    const els = Array.from(document.querySelectorAll("main img, main svg, main [class*='icon' i]"));
    return els.slice(0, 40).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { tag: el.tagName, cls: String(el.className.baseVal ?? el.className).slice(0, 50), src: (el.getAttribute("src") || "").split("/").pop(), w: +r.width.toFixed(1), h: +r.height.toFixed(1), fit: cs.objectFit };
    }).filter(e => e.w && e.w < 60);
  });
  console.log(name, JSON.stringify(info, null, 1));
  await p.locator("main").screenshot({ path: `${OUT}/${name}.png`, clip: undefined });
  await p.close();
}
await browser.close();
