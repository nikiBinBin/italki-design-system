# Pattern 覆盖清单（React vs docs/PATTERNS.md）

来源：`docs/PATTERNS.md` 的 entry 名（权威清单）× `italkiDesignReact/ds/registry.mjs`
的 `PATTERNS`。核对日期 2026-08-13。

JS 设计系统项目里的 9 个 pattern 卡（BookingCommitment / Filter / LessonCard /
MiraModule / PaymentCheckout / TeacherCard / TeacherDetail / TeacherDiscovery /
WorkspaceShell）**是占位说明卡**，正文只写 "This is a product-specific
composition… Authoritative specification: PATTERNS.md" 并列出 entry 名，没有任何
组合标记，所以不能当还原依据。依据是本文件左列。

| # | PATTERNS.md 的 entry | React 现状 |
|---|---|---|
| 1 | `workspace-header` | 模板里有（TopNav 直接用），**没有独立 pattern** |
| 2 | `sidebar-navigation` | 同上（Sidebar + appShellNav），**没有独立 pattern** |
| 3 | `teacher-discovery-search and filter` | `patterns/TeacherFilter.tsx` |
| 4 | `teacher-discovery` | **缺** |
| 5 | `teacher-card` | `patterns/TeacherCard.tsx` |
| 6 | teacher identity patterns | **缺**（散在 TeacherCard / TeacherProfile 里） |
| 7 | `lesson-card` | `patterns/LessonCard.tsx` |
| 8 | `teacher-detail` | **缺** |
| 9 | `booking-panel` | `patterns/Booking.tsx` → `BookingPanel` |
| 10 | `booking-offer-summary` | **缺** |
| 11 | `payment-method` | `patterns/Booking.tsx` → `PaymentMethod` |
| 12 | `order-summary` | `patterns/Booking.tsx` → `OrderSummary` |
| 13 | `mira module family` | **缺** |

React 侧还有一个 `ProductLayouts.tsx`，**不在这份清单里**——是我自己划的分组。

## 为什么会漏成这样

组件有两道保险，pattern 一道都没有：

- **parity**（696 项）比的是 kit 的字符串渲染 vs React 渲染。pattern 在 kit 里没有
  渲染器，所以一项都进不去。
- **drift check** 比的是卡片和目录同一分组的结构。`ds/reference/` 下有 53 个组件
  参照文件，**pattern 零个**；Catalog 的 59 条路由里 pattern 只有 `teacher-card`
  一条。所以除了 TeacherCard，没有任何 pattern 被比对过。

结论：pattern 是"我写的"，不是"搬来的"，这是机制缺口的必然结果。

## 补法（按顺序）

1. 给 pattern 建立参照来源。可用的真实渲染只有三处：Catalog 的 `teacher-card`
   路由、三个 template 的markup（teacher-profile / teacher-search /
   booking-flow）。先从 template 里把 `teacher-detail`、`teacher-discovery`、
   `booking-offer-summary` 的实际组合切出来，放进 `ds/reference/patterns/`。
2. 让 `ds/cards.mjs` 的 drift 检查覆盖 `patterns/`——这样不一致会变红灯，而不是靠
   人眼发现。
3. 按上表补齐缺的 5 项、并决定 `ProductLayouts` 是拆进 1/2 还是删掉。
4. `mira module family` 在 PATTERNS.md 里是"家族"，需要先定它包含哪几个模块，再动手。

---

## 修正：JS 的 9 张 pattern 卡不是同一类

- **占位说明卡**（正文只有 "Authoritative specification: PATTERNS.md" + entry 名）：
  WorkspaceShell、PaymentCheckout（其余未逐一确认）
- **真渲染**：Filter、LessonCard、TeacherCard —— 这些可以直接当还原依据

## Filter 的真实结构（来自 patterns/Filter/Filter.html）

一个 `ui-modal--wide` 内联开着的对话框，标题 "Filter"，body 里 6 张
`filter-pattern__card`：

1. **Teacher from** — 卡头带一个 icon-only 搜索按钮；`Native speaker` chip；
   两个 `filter-pattern__cluster`（caption "Popular countries/regions" 6 个 chip、
   "Other countries/regions" 4 个 chip）
2. **Also speak** — 同样带搜索按钮；cluster "My speaking language"（2）、
   "Popular languages"（8）
3. **Price range** — `filter-pattern__price-chart` 18 根柱子（`--filter-bar-height`
   逐根不同，3 根 `is-selected`）+ 双滑块 `ui-slider__range`（20–70）+
   `filter-pattern__range-values` 的 Minimum $55 / Maximum $162
4. **Availability** — `ui-tabs`（General / Specific time）→ 快捷 chip（Instant
   lesson、Within 72 hours）→ "Days of the week" 7 个 chip（Mon 选中）→
   "Time range" 6 张 `ui-selection--icon-simple` 复选卡，图标按时段分
   morning/afternoon/evening/night，12–16 与 16–20 选中
5. **Lesson category** — 6 个可展开父项（`filter-category-parent` 复选框），
   展开的 Language Essentials 里是 8 个子 chip，首个是 `All`（选中）
6. **Teacher type** — Plus features available 复选框（带 Plustag 图标）+ 两张
   `ui-selection` 卡（Professional teacher / Community tutor，均选中，带描述）

页脚：`Reset`（secondary 40 rounded）+ `Show teachers`（red 40 rounded）。

React 的 `TeacherFilter.tsx` 只有其中一部分，且分组和层级都不同 —— 属于重写，
不是还原。下一步：把这份 HTML 落到 `ds/reference/patterns/Filter.html`，让 drift
检查能对上，再逐块改 React。

---

## 我自造的名称（必须换回源头的写法）

命名不是我的自由度。下面每一条左边是我编的，右边是源头里真实的写法。

**LessonCard 状态**（源头：JS `patterns/LessonCard/LessonCard.html`）

| 我编的 | 真实的 |
|---|---|
| Starts in 20 minutes | In 11h 45m |
| （无） | Upcoming |
| （无） | Waiting |
| Confirm this time | Action required |
| Cancelled by teacher | Canceled |
| （无） | Active package |
| （无） | Active package + Expires in 2 days |
| Completed | Lesson completed! |

卡片分组名也是我编的（"Waiting and packages"、"Completed and cancelled"），
真实卡片只有一组 `Composition`，八条状态并排。

**Booking flow 步骤名**（源头：`BookingOnProfile.dc.html` 的 `steps()`）

| 我编的 | 真实的 |
|---|---|
| How many | Package |
| Where | Platform |
| Payment | Pay |
| Confirmed | （没有这一步，付完切标题为 Booking confirmed） |

**课程标签**：我写 "Most booked"，真实是 "New students only"。

**Pattern 名**（源头：`docs/PATTERNS.md` 的 entry）

| 我编的文件 | 应对应的 entry |
|---|---|
| `TeacherFilter.tsx` | `teacher-discovery-search and filter` |
| `Booking.tsx`（三个导出塞一起） | `booking-panel` / `booking-offer-summary` / `payment-method` / `order-summary` 四个 |
| `ProductLayouts.tsx` | 不在清单里；应拆成 `workspace-header` / `sidebar-navigation` 或删掉 |

**规则**：状态名、步骤名、分组名、pattern 名一律从源头取——kit 的 contracts、
`docs/PATTERNS.md` 的 entry、JS 卡片的真实标记。没有源头就先问，不要现编。

---

## Teacher Profile：Student reviews / Similar teachers 的缺项（对照截图，JS 左 React 右）

**Student reviews**

| 项 | JS（真实） | React（现状） |
|---|---|---|
| 数量标签 | `612 reviews` | `2,431 lessons`（写错了对象） |
| 直方图 | 每行 = 条 + 百分比 + **条数**（93% 571 / 5% 31 / 1% 6 / 1% 2 / 1% 2） | 百分比重复了两遍（`86% 86%`），**没有条数** |
| 类型筛选 | chip 行：All / Conversation Practice / DELE Exam Prep / Business Spanish / Grammar Foundations | **整行缺失** |
| 单条评价 | 真人头像 + 国旗角标、姓名、`34 lessons · July 2026`、**五颗金星**、正文、右侧课程类型 Tag | 首字母头像、姓名 + Tag 挤在一行、正文；**没有星级、没有「N lessons · 日期」、没有国旗** |
| 分页 | 有 | 有 |

**Similar teachers**：JS 三张并排；React 只有两张（数据只给了两个）。卡内结构接近，
但缺第三张。

## 结论：template 也没有任何参照

组件：parity（696 项）+ drift（53 个参照）。
pattern：drift（本轮刚补上 3 个参照）。
**template：什么都没有** —— 所以"抄没抄全"只能靠人眼。

补法和 pattern 同一套：把 JS 三个 template 的每个 section 抓成参照
（`ds/reference/templates/<Name>/<section-id>.html`，section 已经有稳定 id：
`section-about` / `section-lessons` / `section-availability` / `section-reviews` /
`section-similar`），让 `ds/cards.mjs` 对 template 页面逐 section 比对。这样
"reviews 少了筛选 chip、直方图少了条数、similar 少一张"会直接报红。

---

## 进度（自动推进中）

**已绿并推送**
- `TeacherCard` → 单组 `Recommendation group`，三位老师用参照的数据（Maya Chen 4.9/1,280/$18、Elena Ruiz 5.0/962/$16、James Park 4.8/746/$20），按钮 `Book lesson` secondary 40 rounded；卡片按 `__inert` 声明"Book lesson 属于页面"。
- `LessonCard` → 单组 `Composition`，八个状态名全部来自参照；每行改用 `Card` 组件（`body` 槽，用 children 时文字不进签名）；补 `lesson-package-expiring-sm.svg`。
  顺带发现构建的资源收集只扫字面量 `"Assets/…"`，模板字符串拼出来的路径收集不到 —— demo 里的图标路径改成字面量。
- Foundation 删 `--ui-gradient-beta`，Beta 徽章用 `--ui-color-info-surface`；断言双向钉死。注意：token 检查连注释一起扫，注释里提到已退役 token 也会报错。

**仍红：`TeacherFilter`（差 3 缺 3 多）**

缺：
1. Teacher type 的两张 `ui-selection` 卡要 `is-selected has-selected-marker`（参照两张都选中）——demo 传了 `selected: true` 但 pattern 不认这个字段，要改 `TeacherFilter.tsx` 支持选中态 + selected-marker
2. 同上第二张
3. 卡头缺 icon-only 的搜索按钮（`ui-button--text 32 pill is-icon-only`，Teacher from / Also speak 各一个）

多：
1. 我的 stage 是 `ui-modal-stage--demo`，参照是 `--inline`
2. 触发按钮我写 `Open modal`（secondary 40 rounded），参照是 `Open filters`（secondary 32 pill）
3. 国家 chip 多了一个（参照 Popular 6 个 + Other 4 个，我给了 Spain/Mexico/Peru 三个——数量和分组都要按参照的两个 cluster 重排）

除这些，Price range 的 18 根柱状图、Availability 的 tabs + 时段卡、Lesson category 的父子展开都还要按参照补（详见本文件上面的"Filter 的真实结构"）。
