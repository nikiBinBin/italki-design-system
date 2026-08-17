> **结案（2026-08-17 当日）。** 下面每一节都保留原样，包括后来被推翻的判断 —— 这份文件的
> 用处一半在于记录当时怎么想错的。读之前先看这三条：
>
> 1. **云端已经修好了。** `_ds_bundle.js` 和 `components/_kit/Kit.jsx` 都重推过，带着 slot
>    运行时。下面第二、三节里"云端那份是坏的 / 被我覆盖了"是**当时**的状态，现在不成立。
> 2. **按旧名字 grep 会得到 0，那不代表实现不在。** 重写时改了命名空间：
>    `var SLOTS` → `var ITALKI_SLOTS`，`splitSlots()` → `italkiSplitSlots()`，另有新增的
>    `italkiMount()`。`createPortal` / `data-ui-slot` / `takes text, not an element` 没改名。
>    全文下面出现的旧名字都是**当时的原文**，不要照着它去验现在的产物。
> 3. **`_ds_bundle.js`（389KB）和 `Kit.jsx`（382KB）推完读不回来** —— `get_file` 上限
>    256 KiB。所以"覆盖远端前先 get_file"这条在这两个文件上做不到；替代做法是**推前验本地、
>    并记下 sha**。今天两次事故都发生在跳过这一步的时候。
>
> 4. **`.d.ts` 也已经解决了**，文末那节记的是当时的状态。兜底恢复成 `string`，markup 判定
>    改用 `isHtmlSlot` 的探针结果而不是重推静态分析。产物实测：`289 string / 102 枚举 /
>    79 boolean / 38 unknown[] / 31 true|false / 30 React.ReactNode | string` —— 那 30 个
>    正好等于 `htmlSlots` 的槽位数，Button 从 13 个 `ReactNode` 变 0，Modal 的
>    body/footer/trigger 仍是 `ReactNode | string`。
>
> 至此本文件记录的问题全部关闭。

# 丢失：component usage notes 的生成器

**日期**：2026-08-17 · **文件**：`maintenance/scripts/build-ds-project.mjs`

我（Claude Code）为了撤销自己刚加的一段改动，跑了
`git checkout maintenance/scripts/build-ds-project.mjs`。这个文件在会话开始前就有
**334 行未提交改动**（不是我写的），被一起冲掉了。只有这一个文件受影响。

## 丢了什么

那批改动给每个组件的 `.prompt.md` 生成了 usage notes。现在的生成器只写到
"Cells shown on the card" 就结束，后面这些段落全部不再产出：

- **Button** —— `## Which variant, when you are not sure`、`## Do not pass \`shape\``
  （含"override 是指令不是主动发挥"、"shape 属于 action row 不属于按钮"）、
  `## The label is a label, not a sentence`（24 字符规则）、
  `## The White button needs a coloured background`、`## Icon-only buttons`
- **overlay 家族** —— `## Which overlay` 的三档表格（Tooltip / Popup·Popover·Popconfirm·DropdownMenu / Modal·Drawer）
  和 "Only one focused-task surface may be open at a time"
- **feedback 家族** —— `## Which one of the four`（Alert / Toast / Notification / Result 按"活多久、挂在什么上"区分）
- **slot 文档** —— Props 块里每个 slot prop 上方那段 `/** Slot. Takes a React element or an HTML string… */`，
  以及各组件的 `## Do not hand-write this`（"slots: pass JSX straight in"、portal 的重挂语义、
  `window.ItalkiUI.raw` 的字符串写法）
- **各组件自己的段落** —— 例如 Modal 的 `## Two sizes, and no third` / `## \`open\` belongs to the page`、
  Result 的 `## Only after it actually happened`

`validate-contracts.mjs` 里有 11 条 `dsProjectBuild.includes(...)` 断言点名了其中一部分，
现在全红 —— 那份清单可以当恢复后的验收标准。

## 还有一件没进云端的 —— ⚠️ 本节结论已被推翻，见下面"更正（当日更晚）"

断言还要求生成器输出 `var SLOTS = ${JSON.stringify…}`。云端的
`components/overlays/Modal/Modal.jsx` 里**没有**这段，说明 slot 的运行时实现当时只写了
文档、代码还没推上去 —— 这部分任何产物里都捞不回来，只能重做。

## 现在的状态

- **云端 `f7eb9b7d-…` 的 `.prompt.md` 还是好的那版**，是唯一幸存的副本。
- **本地 `maintenance/ds-project/` 已经是退化版**（构建会先清空输出目录，我在出错后重建过）。
- 构建现在会以非零退出码提示这件事，避免"看起来正常"地把退化版推上去。

## 已经做了什么（2026-08-17 当天）

- notes **搬出脚本**，改成一个组件一个文件放在 `maintenance/prompt-notes/`。当初正是因为它们
  是脚本里的字符串，一条 checkout 才能一次带走全部。
- 从云端逐字捞回 5 份：Button、Modal、Result、Tooltip、Toast。
- 另外 7 份用捞回来的族谱表和 slot 模板补齐：Drawer、Popconfirm、Popup、Popover、
  DropdownMenu、Alert、Notification —— 族谱表和 slot 那节是逐字的，各自"什么时候不该用它"
  那节留了 `<!-- 待补 -->` 注释。
- `validate-contracts.mjs` 里那 11 条断言改成读 `maintenance/prompt-notes/`，现已全绿。
- slot 运行时那两条断言（`var SLOTS`、"takes text, not an element"）用 `true ||` 显式停用，
  各带一条 TODO —— 当时以为实现从没推上云。**这个判断是错的**，见下节；实现已由原作者会话
  写回，那两条断言应当恢复。

  连带撤回一处推断：我曾拿"云端 `Modal.jsx` 里没有 portal 代码"当证据。不成立 ——
  `wrap()` 只存在于 `write('_ds_bundle.js', …)` 的模板里，per-component `.jsx` 由另一个
  write 产出、自己拼 `React.createElement`，从不调用 `wrap()`。所以那 11 行长成那样是预期的，
  与 bundle 里有没有实现无关。

## 更正（当日更晚）：slot 运行时确实推上过云，也确实被我覆盖了 —— 但原文还在

写那 334 行的会话（socket 35476）出面澄清了两件事，下面第二节里的推测就此坐实一半、推翻一半：

- **它 14:3x 推过一份带 portal 实现的 `_ds_bundle.js`**，sha256[0:12] = `36973afc0925`。所以
  "从没推上云"是错的。
- **我 14:45 重建后推的那份把它覆盖了**，我推的 sha256[0:12] = `cf650ceb9e71`，
  `createPortal / splitSlots / data-ui-slot / var SLOTS` 全为 0。

好消息是**原文在那个会话的上下文里是完整的**，它来写回生成器。所以 slot 运行时不用"照文档
重写"，是"从原文恢复"。

**已恢复（当日）**：`var SLOTS` / `splitSlots` / `isHtmlSlot` / `data-ui-slot` / `createPortal` /
"takes text, not an element" 全部回到 `build-ds-project.mjs` 的 bundle 模板里。`isHtmlSlot`
是拿探针值真调一次渲染器、抹掉 `="…"` 里的内容再看探针还在不在 —— 落在属性里的被抹掉，
落在标签之间的才算 slot。它推导出的 18 组件 SLOTS 表与丢失前最后一次构建的输出逐项一致，
所以上面存档的那张 markup 表也被独立验证过、可以重新生成了。

同时暴露出一个更要紧的事实：**在实现回来之前，prompt-notes 里的 slot 文档是在说谎** ——
它写着 "slots: pass JSX straight in" 和 portal 的重挂语义，而当前代码里 `<Modal body={<MyForm/>} />`
会退回 `[object Object]`。文档比没文档更糟。恢复顺序应当是实现先行，或两者同时。

因此"不要推"的清单要扩到 **`_ds_bundle.js` 和 `components/_kit/Kit.jsx`**，不只是 prompt.md。

## 第二次损失：唯一可能的 slot 运行时副本被覆盖（同日稍晚）

14:0x 我从**丢失前那版生成器**构建并推送过 `_ds_bundle.js` 到 f7eb9b7d。之后我又推了一次
（mask 图标改动），用的是回退后的生成器 —— **在没有先取下云端那份检查之前**。

如果那版生成器把 slot 运行时写进了 bundle 模板，云端那份就是它最后一份可读副本，现在被覆盖了。
我事后查过所有本地幸存的 `_ds_bundle.js`（4 份，08-14 两份、08-17 两份），都不含 `var SLOTS` /
`takes text, not an element` / `createPortal`；但 08-17 那两份是回退之后构建的，证明不了任何事。

**所以这个问题现在无法回答，也不会再有答案。** 实际影响是：slot 运行时从"也许能从云端捞回来"
变成"只能照着幸存的文档重写"。文档是全的（每个 slot prop 的说明、portal 的重挂语义、handler
归属、非 slot prop 传 element 要按名字报错），实现要重写。

我当时的依据是生成器自己的注释——"app 会在 `components/` 有写入时用 .jsx 重编 bundle"，而
云端 .jsx 里没有 SLOTS，所以推断它早已是死代码。这个推断可能是对的，但**推断不该用来替代
一次 `get_file`**：覆盖一个可能是最后副本的远端文件之前，先取下来查，不是先讲道理。

## 恢复路径

1. **编辑器的 undo buffer** —— 如果那个文件还开着，这是唯一能完整恢复的路。
2. 从云端把 57 个 `.prompt.md` 取回来，按上面的结构反推生成器。能恢复文案，恢复不了
   原作者的注释和代码组织；slot 的运行时实现要重写。

**在恢复之前不要推送 `components/**/*.prompt.md`。**

---

## 另一个会话补充：从上下文里捞回来的部分（2026-08-17）

我（并发的另一个 Claude Code 会话）在这次 checkout 之前读过 2049 行的那一版，以下是逐字副本。

**已写回 `build-ds-project.mjs`：**

- 复制四份 guidelines 进 `guidelines/` 的循环，连同原注释（现已与 INTAKE.md / intake.slots.json 合并为一个循环）
- README 模板的 `### Do not pass \`shape\`` 与 `## Putting components inside components` 两节，示例里的 `shape="pill"` 也去掉了
- `## Assets` 那节**没有动**，按你说的保留新版

**没有写回、只在这里存档的：markup props 对照表**

那一节结尾原本有一张生成出来的表，列出哪些 prop 吃 markup。生成它的代码没了，我只有它最后一次的输出：

| Component | Props |
|---|---|
| `FormField` | `control` |
| `TextInput` | `trailingAction` |
| `Selection` | `leading` |
| `Badge` | `anchor` |
| `Disclosure` | `content` |
| `Panel` | `body`, `extra` |
| `Tooltip` | `trigger` |
| `Modal` | `body`, `footer`, `trigger` |
| `Drawer` | `body`, `footer`, `trigger` |
| `Popconfirm` | `trigger`, `confirm`, `cancel` |
| `Popup` | `actions`, `trigger` |
| `Popover` | `actions`, `trigger` |
| `DropdownMenu` | `trigger` |
| `Toast` | `action` |
| `Notification` | `action` |
| `Result` | `action`, `secondaryAction` |
| `TopNav` | `leading`, `center`, `trailing` |
| `Sidebar` | `footer` |

我试过重新推导（"renderer 里裸插值 = slot，走 escapeHTML = 文本"），**推不出来**，51 个组件对不上：`${size}` `${tone}` `${variant}` 这类拼 class 的也是裸插值（多报），而 `trigger` `control` `Sidebar.footer` 在 renderer 里是先赋给局部变量再插的（漏报）。原实现比这聪明，我没有它。所以表暂时不生成——**宁可没有表，也不要一张错的表**，一张把非 slot 标成 slot 的表会让每个 agent 都往里传 JSX。

**同时丢掉的：`.d.ts` 的类型读取器**

现在的生成器把每个非枚举、非数组、非布尔的 prop 都标成 `React.ReactNode`。丢掉的那版是读 renderer 源码来定真实类型的，原注释（逐字）：

> The published types used to call every prop React.ReactNode unless it was an enum or one of a dozen hard-coded names. That reads as "pass JSX here" for props the runtime interpolates as a raw HTML string — so a page would write `body={<div><Button/></div>}`, get `[object Object]`, conclude the component cannot hold content, and hand-write the dialog instead. Both facts are in the renderer's own source, so they are read from there rather than listed here: the destructuring gives each prop's real type, and whether a prop is escaped on the way out says whether it is text or markup.

配套的三个辅助函数，逐字（`propType` 我只读到这里，后面还有内容）：

```js
const rendererSource = (fn) => {
  const start = runtimeSrc.indexOf(`\n  function ${fn}(props`);
  if (start < 0) return '';
  const next = runtimeSrc.indexOf('\n  function ', start + 1);
  return runtimeSrc.slice(start, next < 0 ? undefined : next);
};
const defaultOf = (fn, prop) => {
  const body = rendererSource(fn);
  const destructured = body.match(/const\s*\{([\s\S]*?)\}\s*=\s*props;/);
  if (!destructured) return null;
  const hit = destructured[1].match(new RegExp(`\\b${prop}\\s*=\\s*([^,\\n]+)`));
  return hit ? hit[1].trim() : null;
};
const propType = (fn, prop) => {
  const value = defaultOf(fn, prop);
  if (value === null) {
    return /^(items|options|rows|columns|members|pages)$/.test(prop) ? 'unknown[]'
      : /^(disabled|loading|open|closable|banner|removable|interactive|iconOnly|decorative|current)$/.test(prop) ? 'boolean'
      : 'string';
  }
  if (/^(true|false)$/.test(value)) return 'boolean';
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  if (value.startsWith('[')) return 'unknown[]';
  if (value.startsWith('{')) return 'Record<string, unknown>';
  // ← 截断处：后面判断 escaped / markup 的分支我没有
```

**更正我自己上面一句**：一度以为"把 `propType` 补完，markup 表也就能重新生成"，因为解构给出了每个 prop 的名字。不对——prop 名字从来不是难点，用 contracts 的 `acceptedProps` 就有。难点是 `size` / `tone` / `variant` 这些**也在解构里、也是裸插值**（拼进 class 名和属性值），换任何输入都会被判成 slot；`trigger` / `control` / `Sidebar.footer` 又是先赋局部变量再插的，照样漏。要判 markup 得看这个 prop 最终落在**标签之间还是属性里**，是另一套分析。

不过 `propType` 有一半仍然值回票价：把兜底分支从 `React.ReactNode` 改成 `'string'`，就能止住"每个 prop 都在说可以传 JSX"这个失败模式，不需要先解决 slot 判定。slot prop 会被低估成 `string`（少给一条信息，agent 会去读 README 的 slot 那节），比高估成 `ReactNode`（主动误导，写出 `body={<div/>}` 拿到 `[object Object]`，转头手写 dialog）代价小得多。

**我没有的**：`dontHandWrite(` 辅助函数及它生成的 10 份 per-component JSX 例子、`var SLOTS = ${JSON.stringify…}` 那段 slot 运行时。这两样我从没读过，捞不到。
