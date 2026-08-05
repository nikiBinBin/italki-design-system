import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1.5 });
await p.goto("http://127.0.0.1:5199/#calendar", { waitUntil: "load" });
await p.waitForTimeout(900);
const trigger = p.getByRole("button", { name: /check availability/i }).first();
await trigger.click();
await p.waitForTimeout(600);
const state = await p.evaluate(() => ({
  rows: document.querySelectorAll("[class*='teacherRow']").length,
  dates: Array.from(document.querySelectorAll("[class*='teacherDate'] strong")).map(e => e.textContent).join(","),
  ringed: Array.from(document.querySelectorAll("[class*='teacherCell']")).some(c => getComputedStyle(c).boxShadow !== "none"),
  gridBg: getComputedStyle(document.querySelector("[class*='teacherGrid']")).backgroundColor,
}));
await p.screenshot({ path: `${OUT}/teacher-week1.png` });
await p.getByRole("navigation", { name: "Date navigation" }).getByLabel("Next week").click();
await p.waitForTimeout(400);
state.week2 = await p.evaluate(() => Array.from(document.querySelectorAll("[class*='teacherDate'] strong")).map(e => e.textContent).join(","));
await p.screenshot({ path: `${OUT}/teacher-week2.png` });
console.log(JSON.stringify(state));
await browser.close();
