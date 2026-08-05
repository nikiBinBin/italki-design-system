import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
for (const [name, url] of [
  ["static-states", "http://127.0.0.1:4173/index.html?route=textarea#textarea"],
  ["react-states", "http://127.0.0.1:5199/#textarea"],
]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  await p.locator(".component-doc-block").nth(1).screenshot({ path: `${OUT}/${name}.png` });
  await p.close();
}
await browser.close();
