import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await p.goto("http://127.0.0.1:5199/#card", { waitUntil: "load" });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const first = document.querySelector(".component-doc-block [class*='_card_'], .component-doc-block article");
  if (!first) return "no card el";
  const cs = getComputedStyle(first);
  return { cls: String(first.className).slice(0, 60), w: first.getBoundingClientRect().width, radius: cs.borderRadius, shadow: cs.boxShadow.slice(0, 40), hasHeader: !!first.querySelector("header"), tag: first.tagName };
});
console.log(JSON.stringify(r, null, 1));
// principles button
await p.goto("http://127.0.0.1:5199/#design-principles", { waitUntil: "load" });
await p.waitForTimeout(700);
console.log("download btn:", await p.evaluate(() => document.querySelector(".total a, .total button")?.textContent ?? "none"));
await browser.close();
