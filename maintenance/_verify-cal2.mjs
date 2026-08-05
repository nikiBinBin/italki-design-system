import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 3 });
await p.goto("http://127.0.0.1:5199/#time-slot", { waitUntil: "load" });
await p.waitForTimeout(900);
// stripes continuity: zoom the TUE column (booked-by-others striped) 09:00 block
const block = await p.locator(".component-doc-block").first().boundingBox();
await p.screenshot({ path: `${OUT}/cal-stripes.png`, clip: { x: block.x + 250, y: block.y + 40, width: 320, height: 220 } });

// tooltip stacking on the full calendar route
await p.goto("http://127.0.0.1:5199/#calendar", { waitUntil: "load" });
await p.waitForTimeout(900);
// hover a booked slot that has a tooltip (booked-by-you with teacher)
const target = p.locator("[data-slot-state='booked-by-you'], [class*='bookedByYou']").first();
await target.hover();
await p.waitForTimeout(600);
const tip = await p.evaluate(() => {
  const t = document.querySelector("[role='tooltip']");
  if (!t) return "no tooltip";
  const r = t.getBoundingClientRect();
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  return { text: t.textContent.slice(0, 40), covered: !t.contains(top) && top !== t, topEl: top ? String(top.className).slice(0, 40) : null };
});
console.log(JSON.stringify(tip));
const cal = await p.locator("main").boundingBox();
await p.screenshot({ path: `${OUT}/cal-tooltip.png`, clip: { x: cal.x, y: cal.y, width: 900, height: 500 } });
await browser.close();
