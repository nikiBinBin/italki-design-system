import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1800 } });
const route = process.argv[2];
const texts = {};
for (const [name, base] of [["s", "http://127.0.0.1:4173/index.html"], ["r", "http://127.0.0.1:5199/"]]) {
  await p.goto(`${base}?route=${route}#${route}`, { waitUntil: "load" });
  await p.waitForFunction(() => (document.querySelector("main")?.innerText ?? "").trim().length > 0, undefined, { timeout: 15000 });
  await p.waitForTimeout(200);
  texts[name] = await p.evaluate(() => (document.querySelector("main")?.innerText ?? "").replace(/\s+/g, " ").trim());
}
// 找第一个分歧点
let i = 0;
while (i < Math.min(texts.s.length, texts.r.length) && texts.s[i] === texts.r[i]) i++;
console.log("first divergence at", i);
console.log("static :", texts.s.slice(Math.max(0, i - 40), i + 120));
console.log("react  :", texts.r.slice(Math.max(0, i - 40), i + 120));
await browser.close();
