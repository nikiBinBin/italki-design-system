# 组件 usage notes

每个 `<Name>.md` 是那个组件 `.prompt.md` 的尾巴 —— 构建时原样接在
"Cells shown on the card" 后面。设计面板里的 agent 读到的就是这些。

## 为什么是文件，不是脚本里的字符串

原来这些正文写在 `build-ds-project.mjs` 的模板字符串里。2026-08-17 那个文件被一条
`git checkout` 冲掉，未提交的正文一起没了（见 `../PROMPT-NOTES-LOST.md`）；只有已经推到
Design 项目里的那份还在。放成独立文件之后，一次误操作带不走全部，补也能一份一份补。

## 现状

从云端逐字捞回来的：Button、Modal、Result、Tooltip、Toast。

其余组件还是薄版（只到 "Cells shown on the card" 为止）。补法是机械的：读云端
`components/<group>/<Name>/<Name>.prompt.md`，把 "## Cells shown on the card" 那节之后的
全部内容存成这里的 `<Name>.md`。**在补完之前不要推 `components/**/*.prompt.md`** ——
云端那份比本地全。

## 写新的

一个组件的 notes 回答的是文档回答不了的问题：这几个长得像的该选哪个、这个 prop 为什么
不该传、什么时候根本不该用这个组件。不要复述 props 表 —— 那个上面已经有了。
