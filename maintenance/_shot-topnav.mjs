import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
for (const [name, url] of [
  ["static-topnav", "http://127.0.0.1:4173/index.html?route=top-nav#top-nav"],
  ["react-topnav", "http://127.0.0.1:5199/#top-nav"],
]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 2 });
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1200);
  await p.locator("main").screenshot({ path: `${OUT}/${name}.png` });
  await p.close();
}
await browser.close();
