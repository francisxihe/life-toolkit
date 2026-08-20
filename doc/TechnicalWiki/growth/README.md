# Growth 技术实现

本目录记录 Growth 域的桌面端技术基线。产品语义、规则和路线图以 [Growth ProductWiki](../../../packages/product-wiki/wiki/growth/README.md) 为准；每个模块页区分“当前实现”和“产品表面 / 实现缺口”，避免把设计目标误写为已实现能力。

交付顺序：**ProductWiki + desktop 表面 → 本目录技术方案 → Desktop 落地**。新项目不做数据兼容/迁移；本地测试数据可保留。

- [目标管理](./goal.md)
- [任务管理](./task.md)
- [待办管理](./todo.md)
- [习惯管理](./habit.md)
- [专注与时间追踪](./track-time.md)
- [重复规则](./repeat.md)

带有 RouteController 的 Growth 模块路由由 desktop 的 `electron-ipc-restful` 承载；路径以控制器前缀和方法路径组合表示。共享重复规则不单独暴露 IPC。

## 功能真源与样式真源

| 范围 | 功能真源 | 样式真源 |
| --- | --- | --- |
| 工作台、习惯（就地打卡） | ProductWiki | desktop |
| 当前/日历/全部任务与待办、目标 | ProductWiki / desktop 能力集 | desktop |
| 专注 mini | ProductWiki | desktop 现状（例外） |
| 专注 full | ProductWiki | desktop 原页面级 track-time / `pages/timer`（例外） |

横切：当前任务/待办侧边日程月历；分组文案「已过期 / **未完成** / 已完成 / 已放弃」（已过期仅今天）；批量完成仅「全部待办」；不做任务联动摘要。

本轮 Desktop 剩余落地：`TaskItem`/`TodoItem` execution row、HabitCard 执行规则与工作台 meta、月历左边框 chip、专注 full 接 `pages/timer` Flip。

## 产品表面 / 技术归属

| 产品能力 | 技术归属 | 当前基线 | 对齐说明 |
| --- | --- | --- | --- |
| 工作台 | render 聚合页 | 已组合目标、任务、待办、习惯和专注投入指标 | 习惯区需就地完成/未完成（调用 Todo done/abandon）。 |
| 目标管理 | `service/growth/goal` | 树、CRUD、关联查询、受控状态流转已存在；详情仍有拆解抽屉（待迁），真实模型 Capability 已在 AI 域 | CRUD/状态维持 Desktop；v0.2.0 将入口改为绑定会话、审阅迁到会话工作台，见 [AI](../ai/README.md)、[Goal](./goal.md)。 |
| 任务管理 | `service/growth/task` | 当前任务、月历、全部任务和详情抽屉已接入 | 能力维持 Desktop；分组中间项文案为「未完成」。见 [Task](./task.md)。 |
| 待办管理 | `service/growth/todo` | 当前待办、月历、全部待办、批量完成；`repeat_todo` 投影与物化 | 关联收拢为 `relatedType`+`relatedId`；见 [Todo](./todo.md)。 |
| 习惯管理 | `service/growth/habit` | 列表、详情、创建/编辑、暂停/恢复、放弃和周期待办打卡 | 规则挂共享 `repeat`；打卡走 Todo 结算。见 [Habit](./habit.md)。 |
| 专注计时 | `service/growth/track-time` | 全局覆盖层、任务入口和秒级关联时间记录已接入 | mini 不变；full 用旧页面级样式。见 [TrackTime](./track-time.md)。 |
| 重复规则 | `@true-north/components-repeat` + `service/growth/repeat` | 算法包 + 调度表 `repeat`（规则与 `currentDate`） | 不单独暴露 IPC；`repeat_todo` / Habit 关联。见 [重复规则](./repeat.md)。 |
