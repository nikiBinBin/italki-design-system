import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:5199/#time-slot", { waitUntil: "load" });
await p.waitForTimeout(900);
const r = await p.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button")).filter(b => (b.getAttribute("aria-label") || "").includes("booked-by-you"));
  return btns.map((b) => {
    const rect = b.getBoundingClientRect();
    const seg = b.parentElement;
    const segRect = seg.getBoundingClientRect();
    return { rect: [rect.width, rect.height], segCls: seg.className.slice(0, 40), segRect: [segRect.width, segRect.height], segOverflow: getComputedStyle(seg).overflow, visibility: getComputedStyle(b).visibility, opacity: getComputedStyle(b).opacity };
  });
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
