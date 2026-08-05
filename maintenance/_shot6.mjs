import { chromium } from "playwright";
const browser = await chromium.launch();
const SCRATCH = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/d75aea70-d08d-4df0-9e8e-2805614e7765/scratchpad";
for (const [name, url] of [
  ["alert-static", "http://127.0.0.1:4173/index.html?route=alert#alert"],
  ["alert-react", "http://127.0.0.1:5199/?route=alert#alert"],
]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${SCRATCH}/${name}.png`, clip: { x: 300, y: 80, width: 1140, height: 1100 } });
  await p.close();
}
console.log("done");
await browser.close();
