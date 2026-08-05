import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await p.goto("http://127.0.0.1:5199/#filter", { waitUntil: "load" });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const modal = document.querySelector(".ant-modal");
  const chip = document.querySelector(".filter-pattern__chip-row button");
  return {
    modalParentChain: (() => { let n = modal; const out = []; while (n && n !== document.documentElement) { out.push(n.tagName + "." + String(n.className).split(" ")[0]); n = n.parentElement; } return out.slice(-6); })(),
    varOnBody: getComputedStyle(document.body).getPropertyValue("--italki-ds-bg-content"),
    varOnChip: chip ? getComputedStyle(chip).getPropertyValue("--italki-ds-bg-content") : null,
    varOnAntApp: getComputedStyle(document.querySelector(".ant-app")).getPropertyValue("--italki-ds-bg-content"),
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
