import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const route of ["popup", "popconfirm", "popover"]) {
  await p.goto(`http://127.0.0.1:5199/#${route}`, { waitUntil: "load" });
  await p.waitForTimeout(700);
  const trigger = p.locator(".component-doc-block button").first();
  await trigger.click();
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll("[class]")).filter((el) => /surface/i.test(el.className) && getComputedStyle(el).position === "absolute");
    const s = candidates[0];
    return s ? { cls: String(s.className).slice(0, 40), radius: getComputedStyle(s).borderRadius } : "none open";
  });
  console.log(route, "→", JSON.stringify(r));
}
await browser.close();
