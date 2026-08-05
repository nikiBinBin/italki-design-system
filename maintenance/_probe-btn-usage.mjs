import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-nikiwen-Downloads-italkiDesignMD-0716/da7045cf-9031-4d01-a51d-222c3ae34006/scratchpad";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://127.0.0.1:5199/#button-variants", { waitUntil: "load" });
await p.waitForTimeout(900);
const btn = p.getByRole("button", { name: /when to use/i }).first();
await btn.click();
await p.waitForTimeout(600);
const before = await p.evaluate(() => {
  const body = document.querySelector(".ant-modal-body");
  const content = document.querySelector(".ant-modal-content");
  const wrap = document.querySelector(".ant-modal-wrap");
  const cs = body ? getComputedStyle(body) : null;
  return {
    found: !!body,
    bodyH: body?.clientHeight, bodyScrollH: body?.scrollHeight,
    overflowY: cs?.overflowY, minH: cs?.minHeight, flex: cs?.flex,
    contentH: content?.getBoundingClientRect().height,
    contentDisplay: content ? getComputedStyle(content).display : null,
    contentMaxH: content ? getComputedStyle(content).maxHeight : null,
    wrapOverflow: wrap ? getComputedStyle(wrap).overflow : null,
    rootCls: document.querySelector(".ant-modal-root")?.parentElement?.className,
  };
});
// try wheel scrolling over the body
const box = await p.locator(".ant-modal-body").boundingBox();
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await p.mouse.wheel(0, 600);
await p.waitForTimeout(400);
const after = await p.evaluate(() => document.querySelector(".ant-modal-body")?.scrollTop);
console.log(JSON.stringify({ before, scrollTopAfterWheel: after }));
await p.screenshot({ path: `${OUT}/btn-usage.png` });
await browser.close();
