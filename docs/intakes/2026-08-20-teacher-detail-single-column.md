---
target: teacher-detail-single-column
date: 2026-08-20
---

# Intake — teacher-detail-single-column

## Request

> 看一下这个 claude.ai design project（Teacher Profile - single column copy.dc.html），我想将它放入 italki UI Kit (DS 3.0) 作为 Patterns 下的 teacher detail

来源：claude.ai design project `654ced9b-923a-4fc1-b86a-6243dc03dd6d`，文件
`Teacher Profile - single column copy.dc.html`。该项目挂的就是 italki UI Kit
(DS 3.0)（云端 `f7eb9b7d-…`，本仓库是它的本地镜像）。

## Confirmed
- 目标对象是已文档化的 `teacher-detail`（`PATTERNS.md § Teacher Detail`），不是新对象。
- 落点是 Catalog 的 `teacher-detail` pattern 路由 —— 卡片由它生成，手工塞进云端项目的文件下一次推送就会消失。

## Answered

1. **放进 Kit 落在哪一层** — 选 A：改写 `index.html` 的 `teacher-detail` 路由（+ `catalog.css`），重建 Patterns 卡片后推送。不新增 `templates/` 模板。
2. **单栏是取代还是并列** — 两种形态都要。双栏（右侧 booking rail）与单栏（吸底 booking bar）都是这个 pattern 的合法形态，同一张卡片上先后呈现。
3. **契约跟着改** — `PATTERNS.md § Teacher Detail` 写入两种形态；`tabs`（local section navigation）降为双栏形态的构件，不再是 pattern 的必需项；吸底 booking bar 与吸顶老师条补上行为契约。
4. **外壳** — 登录产品内。页面由 `workspace-header` + `sidebar-navigation` 承载，pattern 自己不画顶栏；设计稿里那条只有 logo 的自定义 `TopNav` 去掉。
5. **头像** — 换成仓库自带的 `Assets/Images/faces/*.jpg`，不保留 randomuser.me 外链。
6. **状态** — 只做默认满状态（italki Plus + 在线 + 有评价），不铺状态矩阵。

由设计稿本身确定、经需求方确认无误的几项：

- **谁的视角** — 学生在评估这位老师。
- **交付物是什么** — 对现有对象的改进：给 `teacher-detail` 增加一种布局形态，不是新页面。
- **主动作** — `Book trial · US$8.00`，页面唯一的红色 CTA，位于吸底预订条。
- **必须出现的信息** — 身份与信任证据（评分 / 学生数 / 课时数 / 出席率）；自我介绍与 italki insights；课程与价格；可预约时间（Calendar）；学生评价（评分分布、筛选、评价条）；相似老师；吸底的价格与预订动作。单栏形态不含 tabs，也不含右侧 booking rail。
- **布局目标** — 桌面 Web。
- **参考还是复用** — 对齐上述设计稿。
- **交互程度** — 静态视觉。卡片是规范用的参考渲染，设计稿里的 read more / 横向轮播 / 展开更多评价 / 两条吸附栏只保留视觉形态。

## Assumed
- **入口与去向** — 从 `teacher-discovery` 进入，预订完成后进入 booking flow。
- **内容来源** — 沿用设计稿里的示例内容（Lucía Fernández，西语，DELE），不用 lorem，不编造政策文案。
