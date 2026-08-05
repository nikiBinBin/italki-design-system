import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
for (const [name, base] of [["static", "http://127.0.0.1:4173/index.html?route=drawer"], ["react", "http://127.0.0.1:5199/"]]) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1.5 });
  await p.goto(`${base}#drawer`, { waitUntil: "load" });
  await p.waitForTimeout(900);
  // open the first drawer via its trigger button
  await p.locator("main").getByRole("button", { name: /open drawer/i }).first().click();
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${name}-drawer-open.png` });
  await p.close();
}
await browser.close();
