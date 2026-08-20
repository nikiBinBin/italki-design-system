---
target: logged-in-shell
date: 2026-08-20
---

# Intake — logged-in-shell（已登录外壳）

## Request

> app-shell 我想改个名，而且现在这个是已登陆的我还需要一个未登录的，已登陆的需要把 footer 去掉，未登录的需要加上

一次请求，两个交付物：现有的 `app-shell` 改名并去掉 footer，另外新增一个未登录
的对应外壳。这份记录是其中的 **已登录外壳**。

## Confirmed
- 对象是已文档化的外壳，不是新对象：`PATTERNS.md § Authenticated Workspace Shell`（`workspace-header` + `sidebar-navigation`）和 `§ Logged-Out Shell`（`visitor-header`）。
- 两个外壳互斥 —— 文档已写明 `visitor-header` 与 `workspace-header` 永不同时出现，且登出壳不带 sidebar。

## Answered

1. **命名** — `logged-in-shell` / `logged-out-shell`，`@template name` 为 "Logged-in shell" / "Logged-out shell"。Catalog 的 pattern 条目和 kit 卡片一起改名：原 "Workspace shell" / `WorkspaceShell` → "Logged-in shell" / `LoggedInShell`，并新增 "Logged-out shell" / `LoggedOutShell`。三处（模板目录、pattern 条目、卡片）对齐。
2. **footer 写进契约** — 不是这两个模板碰巧的样子。`PATTERNS.md` 里写明：已登录外壳不带 footer，登出外壳带。理由是否则下一个做登录页的人还会加上。
3. **登出壳也进 kit** — 作为一张 Patterns 卡片，同时在 Catalog 加对应 pattern 条目。两个外壳对称，只文档化一个等于让人靠记。
4. **登出壳不是"现在这个去掉 sidebar"** — 现 `app-shell` 用 `TopNav variant="global-default"`（带搜索）；登出壳用 `variant="logged-out"`：公共导航（1-on-1 teacher / Group Class / Community / Become a teacher）、语言与货币合成一个控件、`Sign up / Log in` 是**一个** `secondary` 控件。是新写，不是改。

由文档与请求确定的：

- **谁的视角** — 已登录壳是产品内的学生；登出壳是访客。
- **交付物是什么** — 外壳模板，不是页面。正文留空并标注，供人从这里起页面。
- **主动作** — 已登录壳自己没有主动作，页面内容拥有它；登出壳是 `Sign up / Log in`，红色 CTA 只出现在手机菜单里。
- **必须出现的信息** — 已登录：workspace-header 的完整右侧集群 + sidebar 的既定 roster；登出：四个公共目的地、locale/currency、一个入口、footer。
- **布局目标** — 桌面 Web；窄屏行为归 `top-nav` 组件自己的变体，不在模板里另写。
- **状态** — 只有默认态。外壳没有自己的数据状态。
- **交互程度** — 模板是活的（`.dc.html`），组件行为真实可点。

## Assumed
- **入口与去向** — 外壳不是入口，它是页面的框；正文占位块说明从哪里开始写。
- **内容来源** — sidebar roster 取自 kit 的 `appShellNav()`，footer 与公共导航沿用现有模板和 Catalog 的示例内容。
