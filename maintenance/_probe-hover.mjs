import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1400 } });

async function probe(url, sel) {
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1000);
  const loc = p.locator(sel);
  const get = () => loc.evaluate((el) => { const cs = getComputedStyle(el); return cs.borderColor + " / " + cs.boxShadow; });
  const rest = await get();
  await loc.hover(); await p.waitForTimeout(250);
  const hover = await get();
  await loc.click(); await p.waitForTimeout(250);
  const focus = await get();
  await p.mouse.move(5, 5); await p.waitForTimeout(150);
  return { rest, hover, focus };
}

console.log("static default", JSON.stringify(await probe("http://127.0.0.1:4173/index.html?route=textarea#textarea", ".component-doc-block >> nth=0 >> .ui-textarea >> nth=0")));
console.log("react  default", JSON.stringify(await probe("http://127.0.0.1:5199/#textarea", ".component-doc-block >> nth=0 >> textarea >> nth=0")));

// warning + error + readonly + disabled rest/hover on react
await p.goto("http://127.0.0.1:5199/#textarea", { waitUntil: "load" });
await p.waitForTimeout(1000);
const states = await p.evaluate(() => {
  const tas = Array.from(document.querySelectorAll(".component-doc-block")[1].querySelectorAll("textarea"));
  return tas.map((t) => getComputedStyle(t).borderColor + " bg:" + getComputedStyle(t).backgroundColor);
});
console.log("react states", JSON.stringify(states));
const warn = p.locator(".component-doc-block >> nth=1 >> textarea >> nth=0");
await warn.hover(); await p.waitForTimeout(250);
console.log("react warning hover", await warn.evaluate((el) => getComputedStyle(el).borderColor));
// count-variant label focus
const countTa = p.locator(".component-doc-block >> nth=0 >> textarea >> nth=1");
await countTa.click(); await p.waitForTimeout(250);
console.log("react count label focus", await p.evaluate(() => getComputedStyle(document.querySelector("label.ant-input")).borderColor));
await browser.close();
