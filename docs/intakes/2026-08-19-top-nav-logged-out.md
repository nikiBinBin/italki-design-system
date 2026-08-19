---
target: top-nav-logged-out
date: 2026-08-19
---

# Intake — top-nav-logged-out

## Request

> 在Top Nav中新增未登录的顶部导航

## Confirmed
- **谁的视角** — 提示词已说明：“未登录”
- **对象** — 现有可复用组件 `top-nav`（`COMPONENTS.md § Navigation`），不是 `workspace-header`。扫描把“页面布局规则”里的“页面”读成了新页面交付物，已在提问时纠正。

## Answered

1. **做在哪一层？** —— (c) 两个都要：`top-nav` 出一个具名 variant，`PATTERNS.md` 另写这个外壳该被喂什么产品数据。
2. **参考还是推导？** —— Reference fidelity。设计稿 `cPiCQdXRharsS6DsybuvLn`：
   - `102:4271` 桌面 1440×72
   - `102:4611` 移动 375×56
   - `102:4733` 移动汉堡抽屉 327×852
3. **必须出现的信息 / 主动作** —— 以设计稿为准。桌面：logo + `English · USD $` 语言货币下拉 + 四条文字链（1-on-1 teacher / Group Class / Community / Become a teacher）+ 一颗灰底胶囊「Sign up / Log in」；中间槽为空，未登录态没有搜索。移动：汉堡 + logo + 32px 灰底胶囊「Open in App」。抽屉：四条带图标的导航行 + 红色「Sign up / Log in」+ 语言与货币两个 48px 下拉。
   主动作是「Sign up / Log in」。它在桌面与移动条上是次级灰底（`variant="secondary"`），只有在抽屉里才是红色（`variant="red"`）——设计稿如此。
4. **视口** —— 两个都要，断点按 `EXECUTION.md §13.1`，< 744px 走移动形态。
5. **状态** —— 默认态 + 语言下拉展开 + 移动抽屉展开，三个都要可交互。加载/空/错误态不适用于导航外壳。
6. **不能动的部分** —— 见下。需求方明确要求底部分隔线**所有** variant 一起改成 Divider，这一条推翻了「已登录两个 variant 不动」的默认。
7. **交互程度** —— 状态切换器 + 浮层真正可用（下拉与抽屉能开能关）。
8. **逐条决议**（提问块的编号）：
   1. 右侧按钮用 `button variant="secondary" size=40 shape="pill"`；`COMPONENTS.md` 里「top-nav 动作用 emphasis」改为「emphasis 是已登录默认，未登录用 secondary」。合并成一颗，不用稿里隐藏的两段式 `102:4340`。
   2. 文字链取设计稿实测色 `#9C9CAC`（后经需求方改绑为 Figma 变量 `colors/secondary3`，色值未变）→ 仓库 `--ui-color-placeholder`。不为同一色值新造 token，改为在 `COMPONENTS.md` 把该角色的描述扩一句。
   3. **底部分隔线全部改为 `Foreground/Divider`**：`.ui-top-nav` 的 `border-bottom` 由 `--ui-color-border` 改为 `--ui-color-divider`，三个 variant 与移动形态一致。
   4. 语言/货币下拉：给 `top-nav-context` 增加无旗模式 `mode: "plain"`，不新做子组件。
   5. 移动端右边距按 16px 与左侧对齐（稿里量出来是 9px，判为未对齐）。
   6. 汉堡抽屉：需求方补了 `102:4733`，纳入本次范围。

## Assumed
- **不能动的部分** — 除分隔线颜色外，`global-default` 与 `teacher-search` 两个 variant 的结构、尺寸、槽位内容不变。
- **内容来源** — 设计稿上的真实文案，不替换、不编造。
- **入口与去向** — 导航外壳没有“入口页”，本项不适用。
- **抽屉的交互边界** — 稿里只有静止态。开合动效、焦点陷阱、Escape 关闭沿用现有 `drawer` 组件契约，不另行发明。

## Reference Mode

- **Reference Mode**: Reference fidelity
- **Reference Source**: Figma `cPiCQdXRharsS6DsybuvLn` — `102:4271`（桌面）、`102:4611`（移动）、`102:4733`（抽屉）
- **Reference Elements Reused**: logo、语言货币下拉、四条文字链、Sign up / Log in、Open in App、汉堡、抽屉导航行、抽屉红色 CTA、抽屉双下拉
- **Reference Elements Intentionally Omitted**: 稿里全部隐藏图层——搜索条 `102:4306` / `102:4351`、Book lessons 按钮 `102:4277`、两段式 Sign up ｜ Log in `102:4340`、移动 32px Signup/Login `102:4647`、filter `102:4272`
- **New Elements Required By The User Story**: 无。未登录条的每个元素都有稿。
- **Known Differences**（设计稿与本仓库 token 的分歧，实现取仓库值并在此记录）：
  - 抽屉里两个下拉的描边稿上是 `#D9D9D9`，Figma 里挂的样式名却是 `Foreground/Border`；本仓库 `Foreground/Border` 是 `#E5E8ED`。`#D9D9D9` 不在 DS 调色板内，`COMPONENTS.md § Color Application Rules` 禁止未登记色值，故实现用 `--ui-color-border`。
  - 抽屉红色 CTA 在稿上是被缩放过的实例（文字 22.11px / 行高 31.587px、内边距 20.107px 都是缩放残留），按 48px Button 的既有规格实现：`--ui-radius-md` 圆角、16/24 字号，与稿面尺寸 280×48 一致。
  - 移动条按钮 32px，`EXECUTION.md §13.2` 建议移动端胶囊 ≥ 36px、尽量 40px。设计稿优先（`§0.5` 来源优先级第 1 条高于第 4 条），实现取 32px。
  - 移动条右边距 9px → 取 16px（见上）。
  - Figma 变量绑在 `colors/*` 基础色层而非 DS 3.0 语义层：`colors/secondary3` `#9C9CAC`、`colors/secondary2` `#515164`、`colors/bg1` `#F5F6F9`、`colors/bg2` `#FFFFFF`。
- **Open Decisions**: 无。
