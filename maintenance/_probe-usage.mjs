import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:5199/#color", { waitUntil: "load" });
await p.waitForTimeout(900);
await p.getByRole("button", { name: /when to use/i }).first().click();
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const content = document.querySelector(".ant-modal-content");
  const body = document.querySelector(".ant-modal-body");
  return {
    contentH: content?.getBoundingClientRect().height,
    viewportH: innerHeight,
    bodyScrollable: body ? body.scrollHeight > body.clientHeight : null,
    bodyOverflowY: body ? getComputedStyle(body).overflowY : null,
  };
});
console.log(JSON.stringify(r));
await p.screenshot({ path: `${OUT}/usage-modal.png` });
await browser.close();
