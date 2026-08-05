import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto("http://127.0.0.1:5199/#dropdown-menu", { waitUntil: "load" });
await p.waitForTimeout(700);
await p.locator(".component-doc-block button").first().click();
await p.waitForTimeout(400);
const r = await p.evaluate(() => {
  const menu = document.querySelector("[role='menu']");
  if (!menu) return "no menu";
  let n = menu;
  const clips = [];
  while (n && n !== document.body) {
    const cs = getComputedStyle(n);
    if (cs.overflow !== "visible" || cs.overflowX !== "visible" || cs.overflowY !== "visible")
      clips.push({ cls: String(n.className).slice(0, 50), o: cs.overflow, ox: cs.overflowX, oy: cs.overflowY });
    n = n.parentElement;
  }
  return { menuRect: menu.getBoundingClientRect().height, clips };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
