import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const route of ["popup", "popconfirm", "popover"]) {
  await p.goto(`http://127.0.0.1:5199/#${route}`, { waitUntil: "load" });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const s = document.querySelector("[class*='_surface_']");
    return s ? getComputedStyle(s).borderRadius : "no surface visible";
  });
  console.log(route, "→", r);
}
await browser.close();
