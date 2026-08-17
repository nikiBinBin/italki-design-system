# 参照material

不是模板,不参与构建 —— 放在这里是因为它们是某个东西的**来源**,删掉就无从核对。

## `booking-flow-spec/`

booking flow 五步的设计参照标记,来自 `maintenance/templates/booking-flow/spec/`。
那个目录本身是退役的实现(已被 `templates/teacher-profile/` 里的活流程取代,
见 `../OWNER-CLEANUP.md`),但 spec 不是实现:teacher-profile 每一步的文案和结构
都是照它做的,例如 step 4 的 "Where will the lesson happen?"。

它过去和退役实现放在一起,所以 `audit-templates.mjs` 把整个目录当成一个活模板扫,
每次都报一条没人会修的 finding。搬出来之后模板目录里只剩真模板。
