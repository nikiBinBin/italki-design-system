import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
await p.goto("http://127.0.0.1:5199/#textarea", { waitUntil: "load" });
await p.waitForTimeout(1000);
const sel = ".component-doc-block >> nth=0 >> [class*='_root_'] >> nth=0";
const loc = p.locator(sel);
const get = () => loc.evaluate((el) => { const cs = getComputedStyle(el); return cs.borderColor + " " + cs.borderWidth + " / " + cs.boxShadow; });
console.log("rest ", await get());
await loc.hover(); await p.waitForTimeout(250);
console.log("hover", await get());
await loc.click(); await p.waitForTimeout(250);
console.log("focus", await get());
await p.mouse.move(5,5); await p.waitForTimeout(200);
const states = await p.evaluate(() => Array.from(document.querySelectorAll(".component-doc-block")[1].querySelectorAll("[class*='_root_']")).map(el => { const cs = getComputedStyle(el); return cs.borderColor + " bg:" + cs.backgroundColor; }));
console.log("states", JSON.stringify(states));
// grip inset check: textarea right edge vs root right edge
const inset = await p.evaluate(() => {
  const root = document.querySelector("[class*='_root_']");
  const ta = root.querySelector("textarea");
  const rr = root.getBoundingClientRect(), tr = ta.getBoundingClientRect();
  return { right: rr.right - tr.right, bottom: rr.bottom - tr.bottom };
});
console.log("textarea inset from root:", JSON.stringify(inset));
// count position
const count = await p.evaluate(() => {
  const c = document.querySelector(".ant-input-textarea-count");
  const root = c.closest("[class*='_root_']");
  return { fromRight: root.getBoundingClientRect().right - c.getBoundingClientRect().right, h: c.getBoundingClientRect().height };
});
console.log("count:", JSON.stringify(count));
await browser.close();
