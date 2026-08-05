import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:5199/#time-slot", { waitUntil: "load" });
await p.waitForTimeout(900);
const r = await p.evaluate(() => {
  const rows = document.querySelectorAll("[class*='timeRow']");
  const out = [];
  rows.forEach((row) => {
    const label = row.querySelector("[class*='timeLabel']")?.textContent;
    const cells = Array.from(row.querySelectorAll("button")).map((b) => ({
      cls: b.className.replace(/_1\w+/g, "").slice(0, 80),
      bg: getComputedStyle(b).backgroundImage.slice(0, 60) || getComputedStyle(b).backgroundColor,
      aria: b.getAttribute("aria-label")?.slice(0, 40),
    }));
    out.push({ label, n: cells.length, cells: cells.slice(0, 6) });
  });
  return out;
});
console.log(JSON.stringify(r, null, 1).slice(0, 3000));
await browser.close();
