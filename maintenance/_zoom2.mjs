import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
// lesson-card first banner icons close-up, both sides
for (const [name, url] of [
  ["static-lesson-zoom", "http://127.0.0.1:4173/index.html?route=lesson-card#lesson-card"],
  ["react-lesson-zoom", "http://127.0.0.1:5199/#lesson-card"],
]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 4 });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1000);
  const box = await p.locator(".component-doc-block >> nth=0").boundingBox();
  await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: box.x, y: box.y + 60, width: 260, height: 120 } });
  await p.close();
}
// textarea variants close-up (corner grip + count)
for (const [name, url] of [
  ["static-ta-zoom", "http://127.0.0.1:4173/index.html?route=textarea#textarea"],
  ["react-ta-zoom", "http://127.0.0.1:5199/#textarea"],
]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 3 });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1000);
  await p.locator(".component-doc-block >> nth=0").screenshot({ path: `${OUT}/${name}.png` });
  await p.close();
}
await browser.close();
