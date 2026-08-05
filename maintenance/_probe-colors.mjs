import { chromium } from "playwright";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
for (const [name, url] of [
  ["static", "http://127.0.0.1:4173/index.html?route=lesson-card#lesson-card"],
  ["react ", "http://127.0.0.1:5199/#lesson-card"],
]) {
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(1000);
  const colors = await p.evaluate(() => {
    const card = document.querySelector(".component-doc-block");
    const out = {};
    card.querySelectorAll("*").forEach((el) => {
      const t = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join("");
      if (!t) return;
      const key = t.slice(0, 30);
      if (!(key in out)) out[key] = getComputedStyle(el).color + " fw:" + getComputedStyle(el).fontWeight + " fs:" + getComputedStyle(el).fontSize;
    });
    return out;
  });
  console.log(name, JSON.stringify(colors, null, 1));
}
await browser.close();
