# 需要项目所有者删除的文件

**项目**：italki UI Kit DS 3.0 — `f7eb9b7d-40fb-4766-bccc-0202f1c91fb8`

我（Claude Code）对这个项目**只能写、不能删**：调用删除接口返回
`403 permission_denied: bulk delete requires project ownership when called
without a turn fence; this project is owned by another user`。所以下面这些文件我
只能"中和"（覆盖成不带 `@dsCard` / `@template` 标记的空壳，让面板不再收录），
真正的删除需要你以所有者身份操作。

核对日期：2026-08-13。清单来自把云端 `list_files` 和本地
`maintenance/ds-project/`（`build-ds-project.mjs` 的产物）逐条比对。

---

**2026-08-17 状态**：A 组和 C 组你都已经删完了（云端 `list_files` 核对过：没有
`Combobox.html`，没有 `templates/booking-flow/`，`uploads/` 和 `screenshots/` 也清了）。
B 组的 9 个 pattern 目录仍在，待定。

删了之后 Combobox 的卡片还在面板上显示 "file not found" —— 因为它是早年用
`register_assets` 显式注册的，注册记录在服务端，删文件删不掉。已用
`unregister_assets` 移除。`CheckboxGroup` 是同一批注册的，文件还在所以正常显示，
但构建也已经不产出它了。下面 A 组的清单保留作记录。

**2026-08-20 状态**：

- `CheckboxGroup.html` 已由所有者删除。它正是上一段预告过的那种情况 ——
  文件删掉，服务端注册还在，面板上就变成一张 `file not found` 的卡。已用
  `unregister_assets` 移除（返回 `unregistered: 1`，确认注册确实存在）。
  **规律**：删这一批早年 `register_assets` 注册过的卡片，删文件和取消注册
  是两步，缺一步就留一张坏卡。目前已知同批的还有 Combobox（已处理）。
- B 组的九个 pattern 目录**现在是构建产出的**，不再是历史遗留 —— 见
  `build-template-cards.mjs`。那一节已过时。
- 下面 D 表「不要删」里的 `templates/teacher-profile/`、`templates/teacher-search/`
  已经被删除（外壳拆成 `logged-in-shell` / `logged-out-shell`，manifest 也只登记
  这两个）。`templates/app-shell/` 是同期遗留，仍在云端但已不在 manifest 里。
- `_catalog.css` 仍列在 D 表。2026-08-20 复核：`styles.css` 只 import
  `tokens/tokens.css` 和 `_ds_bundle.css`，卡片各自 link `styles.css` + `_cards.css`，
  仓库和产物里都搜不到对它的引用。判断是已断链，但因为删了也没有收益，保留原状。

---

## A. 确定要删（已中和的空壳，留着只是占位）

| 路径 | 为什么 |
|---|---|
| `components/forms-inputs/Combobox/Combobox.html` | Combobox 卡片你早前要求下架。构建脚本已不再产出这个 `.html`（同目录的 `.d.ts` / `.jsx` / `.prompt.md` 仍在产出，是给消费方的类型和源码，**不要删**）。云端这份是旧上传，我已覆盖成无标记空壳。 |
| `templates/booking-flow/BookingFlow.dc.html` | 独立的 booking flow，按你要求下架，保留 `BookingOnProfile.dc.html`。已覆盖成无标记空壳，壳内注明了原因。 |

删掉这两个路径后，面板的卡片索引和模板索引就完全等于构建产物。

## B. 构建已不再产出，但云端还留着（需你确认是否还要）

这九个 pattern 卡片是更早的上传；现在的 `build-ds-project.mjs` 不产出 `patterns/`
（React 项目那边才有 patterns 分组）。它们仍在 `_ds_manifest.json` 的 `cards` 里以
"Patterns" 分组显示，所以**面板上看得到**。如果它们还有用就留着；如果只是历史遗留，
连 `.html` 和 `.prompt.md` 一起删：

- `patterns/BookingCommitment/`
- `patterns/Filter/`
- `patterns/LessonCard/`
- `patterns/MiraModule/`
- `patterns/PaymentCheckout/`
- `patterns/TeacherCard/`
- `patterns/TeacherDetail/`
- `patterns/TeacherDiscovery/`
- `patterns/WorkspaceShell/`

## C. 与构建无关、但可以顺手清的杂项

不是我产出的，也不影响面板，纯粹占空间：

- `screenshots/avatar-check.png`、`screenshots/tooltip-check.png` —— 早前排查用的截图
- `uploads/pasted-1785828144422-0.png`、`uploads/pasted-1785987930900-0.png`、`uploads/pasted-1786002738435-0.png` —— 粘贴上传的图
- `uploads/latest/` 下的 `catalog.css` / `component-api.json` / `contracts.json` / `italki-ui.css` / `tokens.css` —— 手工上传的旧副本；现在这些内容由 `_ds_bundle.css` / `_ds_bundle.js` / `tokens/tokens.css` 提供，两份并存容易看错版本

## D. 不要删

以下是面板或构建依赖的，删了会坏：

- `_ds_bundle.css`、`_ds_bundle.js`、`_ds_manifest.json`、`_cards.js`、`_catalog.css`、`styles.css`、`tokens/tokens.css`
- `components/**` 除 A 表那一条以外的全部
- `templates/teacher-profile/`、`templates/teacher-search/`
  及各自目录下的 `support.js` / `ds-base.js` / `ds-safe.js`（`ds-base.js` 负责把
  kit 从项目根加载进模板，缺了模板里所有组件都不渲染）

**2026-08-14 更正**：`templates/booking-flow/BookingOnProfile.dc.html` 从"不要删"
移到 A 表。它是 booking flow 搬进 teacher-profile 之前的那一版，云端还留着并在面板
上显示，内容已经落后好几轮（18px 步骤标题、还有已经移除的"Your lesson times"块），
和现在这份并排看很容易认错版本。整个 `templates/booking-flow/` 目录都可以删。
- `_vendor/react.production.min.js`、`_vendor/react-dom.production.min.js`（卡片挂载用）
- `guidelines/`、`README.md`、`thumbnail.html`、`_thumbnail.webp`

---

如果以后要我自己能删：把这个项目的所有权转给我登录的账号，或者你在自己名下新建一个
设计系统项目让我推送——React 那个项目（`abe344fa-…`）就是你名下的，删除在那边是通的。

---

## 给所有者的 prompt（直接粘贴）

把下面整段发给项目所有者（或在所有者账号下的 Claude Code 会话里粘贴）。它是自带上下文
的，不需要读这份文件。

```text
请在 Claude Design 项目「italki UI Kit (DS 3.0)」
（projectId f7eb9b7d-40fb-4766-bccc-0202f1c91fb8）里删除下面这些文件。
它们是历史上传，现在的构建脚本已经不产出，但仍在设计面板的卡片索引里显示，
和当前版本并排容易认错。删除需要项目所有权，所以只能由你执行。

先删这两个（已被覆盖成不带标记的空壳，留着只是占位）：
- components/forms-inputs/Combobox/Combobox.html
  （Combobox 卡片已下架；同目录的 .d.ts / .jsx / .prompt.md 是给消费方的类型和源码，不要删）
- templates/booking-flow/  整个目录
  （booking flow 已经搬进 templates/teacher-profile/TeacherProfile.dc.html，
   这里留的是搬迁前那一版，内容落后好几轮）

再删这些杂项（不影响面板，纯占空间）：
- screenshots/avatar-check.png
- screenshots/tooltip-check.png
- uploads/pasted-1785828144422-0.png
- uploads/pasted-1785987930900-0.png
- uploads/pasted-1786002738435-0.png
- uploads/latest/catalog.css
- uploads/latest/component-api.json
- uploads/latest/contracts.json
- uploads/latest/italki-ui.css
- uploads/latest/tokens.css
  （uploads/latest 是手工上传的旧副本；这些内容现在由项目根的
   _ds_bundle.css / _ds_bundle.js / tokens/tokens.css 提供，两份并存会看错版本。
   已确认模板加载的是 _ds_bundle.css，不是这一份。）

以下这些先不要删，等确认：
- patterns/ 下的九个目录（BookingCommitment、Filter、LessonCard、MiraModule、
  PaymentCheckout、TeacherCard、TeacherDetail、TeacherDiscovery、WorkspaceShell）。
  现在的构建不产出 patterns/，但这些卡片仍在面板上，而且还在被用来做设计评审
  （Filter 和 TeacherCard 最近都看过）。要删之前请先跟设计确认。

不要删：_ds_bundle.css、_ds_bundle.js、_ds_manifest.json、_cards.js、_catalog.css、
styles.css、tokens/tokens.css、_vendor/、guidelines/、README.md、thumbnail.html、
_thumbnail.webp，以及 components/** 和 templates/teacher-profile|teacher-search 的其余全部
（各模板目录下的 ds-base.js 负责把 kit 加载进模板，缺了模板里所有组件都不渲染）。
```
