import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 2000 } });
await p.goto("http://127.0.0.1:5199/#filter", { waitUntil: "load" });
await p.waitForTimeout(1000);
const r = await p.evaluate(() => {
  const row = document.querySelector(".filter-pattern__chip-row");
  const chipEl = row?.querySelector("button");
  const chipCS = chipEl ? getComputedStyle(chipEl) : null;
  const slider = document.querySelector(".filter-pattern__price-range");
  const sliderHTML = slider ? slider.innerHTML.slice(0, 300) : null;
  const sliderInputs = slider ? slider.querySelectorAll("input[type=range]").length : 0;
  const control = slider?.querySelector("[class*='control']");
  const controlCS = control ? getComputedStyle(control) : null;
  const sel = document.querySelector(".filter-pattern__time-grid [class*='_root_'], .filter-pattern__time-grid label, .filter-pattern__time-grid > div > *");
  const selCS = sel ? getComputedStyle(sel) : null;
  return {
    chipTag: chipEl?.tagName, chipCls: chipEl?.className.slice(0, 60),
    chipBg: chipCS?.backgroundColor, chipRadius: chipCS?.borderRadius, chipH: chipEl?.getBoundingClientRect().height,
    sliderInputs, controlH: control?.getBoundingClientRect().height, controlBg: controlCS?.background.slice(0, 80),
    sliderHTML: sliderHTML,
    selTag: sel?.tagName, selCls: String(sel?.className).slice(0, 60), selBorder: selCS?.border, selRadius: selCS?.borderRadius,
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
