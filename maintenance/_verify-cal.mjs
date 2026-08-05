import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await p.goto("http://127.0.0.1:5199/#calendar", { waitUntil: "load" });
await p.waitForTimeout(1000);
// header zoom (timezone + today + arrows)
const header = p.locator("[class*='availabilityControls']").first();
await header.screenshot({ path: `${OUT}/react-cal-header.png` });
// hover an available slot and measure filter
const avail = p.locator("button[aria-label*='available']").first();
const pre = await avail.evaluate((el) => getComputedStyle(el).filter);
await avail.hover();
await p.waitForTimeout(250);
const post = await avail.evaluate((el) => getComputedStyle(el).filter);
console.log(JSON.stringify({ hoverFilter: { pre, post } }));
// top-nav dropdown
await p.goto("http://127.0.0.1:5199/#top-nav", { waitUntil: "load" });
await p.waitForTimeout(800);
await p.locator("header button[aria-haspopup='menu']").first().click();
await p.waitForTimeout(400);
const menuBox = await p.locator("[role='menu']").first().boundingBox();
const frameBox = await p.locator(".top-nav-frame").first().boundingBox();
console.log(JSON.stringify({ menuLeft: menuBox?.x, frameLeft: frameBox?.x, clipped: menuBox && frameBox ? menuBox.x < frameBox.x : null }));
await p.screenshot({ path: `${OUT}/react-topnav-menu.png`, clip: { x: frameBox.x, y: frameBox.y - 20, width: 480, height: 320 } });
await browser.close();
