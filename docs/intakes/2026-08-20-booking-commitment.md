---
target: booking-commitment
date: 2026-08-20
---

# Intake — booking-commitment

## Request

> 将Teacher Profile template里面的booking抽出来放到patterns：Booking commitment里

来源：`maintenance/templates/teacher-profile/TeacherProfile.dc.html` —— 它的
`Booking rail`、`Booking drawer` 和 Step 1–5 + Confirmation 七个画面。目标是
Catalog 的 `booking-commitment` pattern 路由，也就是 italki UI Kit 里 Patterns
分组下那张现在还是 spec stub 的 BookingCommitment 卡片。

## Confirmed
- 目标对象是已文档化的 `booking-panel`（`PATTERNS.md § Booking And Payment`）。intake 扫描把对象误判成了 `teacher-detail`（它命中了 “Teacher Profile” 这个词），已按 `booking-panel` 的契约重读。
- 落点与 teacher-detail 相同：改写 Catalog 路由，重建卡片。手工塞进云端项目的文件下一次推送就会消失。

## Answered

1. **边界** — 选 A：只要有界的承诺面 —— Booking rail + 抽屉的 Step 1 选课 / Step 2 课时数 / Step 3 选时间。Step 4 平台、Step 5 结账、确认页归 `payment-checkout`，本次不动（它仍是 spec stub）。
2. **卡片上的分步** — 要能一步一步点下去，跟模板现在的行为一样。卡片不是静态的 flow strip：Back / Continue 真的切换步骤，Stepper 跟着走。
3. **状态** — 只画一个满状态，不铺失败态矩阵。

由 `booking-panel` 契约与模板本身确定的几项：

- **谁的视角** — 学生在为这位老师下单。
- **交付物是什么** — 唤起式浮层加一个有界的侧栏面：抽屉是承诺流程，rail 是页面上的入口。
- **主动作** — 从 rail 的 `Book trial` 进入，抽屉里每一步的 Continue 推进，Step 3 之后交给 `payment-checkout`。页面唯一的红色 CTA。
- **必须出现的信息** — 课程选择与时长、课时数与套餐折扣、时区正确的可约时间、当前价格与时长、预订状态、一个下一步动作。
- **布局目标** — 桌面 Web。
- **参考还是复用** — 对齐 `templates/teacher-profile/TeacherProfile.dc.html` 的这七个画面。
- **交互程度** — 抽屉分步可点。这要求行为是 kit helper，而不是各写一份：`ds-cards-behaviour.js` 只接 runtime 提供的行为（Filter pattern 当初就是这么补的），所以步骤切换写进 `catalog-runtime/italki-ui.js`，Catalog 与卡片两边都只做转发。

## Assumed
- **入口与去向** — 从 `teacher-detail` 的 booking 承诺进入；Step 3 之后进入 `payment-checkout`。
- **内容来源** — 沿用模板里的课程、时长与套餐数据（西语，Lucía Fernández），不用 lorem，不编造政策文案。
