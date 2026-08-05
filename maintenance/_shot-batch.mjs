import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
const routes = process.argv.slice(2);
for (const route of routes) {
  for (const [side, base] of [["static", `http://127.0.0.1:4173/index.html?route=${route}`], ["react", "http://127.0.0.1:5199/"]]) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1800 }, deviceScaleFactor: 1.5 });
    await p.goto(`${base}#${route}`, { waitUntil: "load" });
    await p.waitForTimeout(1000);
    await p.locator("main").screenshot({ path: `${OUT}/${side}-${route}.png` });
    await p.close();
  }
}
await browser.close();
