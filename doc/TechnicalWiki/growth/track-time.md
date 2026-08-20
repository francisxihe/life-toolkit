# Track-Time 技术实现

产品说明见 [专注与时间追踪 ProductWiki](../../../packages/product-wiki/wiki/growth/track-time/README.md)。

## 当前代码边界

- 控制器：[track-time.route-controller.ts](../../../apps/desktop/src/service/growth/track-time/track-time.route-controller.ts)，前缀 `/trackTime`。
- 服务、DTO 和相关持久化实现在 `apps/desktop/src/service/growth/track-time/`。
- DTO 位于 `dto/`，VO 来自 `@true-north/vo` 的 `TrackTime` 命名空间；关联类型来自 `@true-north/enum`。当前模型使用通用 `relatedType / relatedId`，任务与待办均为可选关联对象。

## 当前 IPC 路由

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| POST | `/trackTime/create` | 创建时间记录 |
| DELETE | `/trackTime/delete/:id` | 删除时间记录 |
| PUT | `/trackTime/update/:id` | 更新时间记录 |
| GET | `/trackTime/find/:id` | 查询时间记录 |
| GET | `/trackTime/related/:relatedType/:relatedId` | 按关联对象查询记录 |
| DELETE | `/trackTime/related/:relatedType/:relatedId` | 删除关联对象的全部记录 |

## 产品表面 / 实现缺口

**专注计时是样式例外**（相对其它 Growth 页）：

| 产品语义 | 当前实现 | 对齐约束 |
| --- | --- | --- |
| 迷你浮层 | `FocusTimerProvider` mini Card | **保持 Desktop 现状**（`focus-timer/index.tsx` mini 分支）。 |
| 全屏模式 | FocusTimer full | **复用** [`pages/timer/normal`](../../../apps/desktop/src/render/pages/timer/normal/) 的 `Flip` / `Countdown`（或 `Flip` + `getTimeArr`）+ 底部 `.actions`；业务仍 `TrackTimeController.create`；不以「仅深色大字」代替。 |
| 全局计时器 | 顶栏、任务与待办入口唤起 | 可携带任务或待办关联；UI 状态不由 RouteController 保存。顶栏未锁定时提供可搜索的任务/待办联合选择（`task:<id>` / `todo:<id>`）；任务或待办入口显式锁定关联，不展示选择器。Select 弹层 `z-index` 高于迷你/全屏浮层。 |
| 任务可选关联 | 通用可选关联 | `relatedType=task`；未关联记录可创建查询。 |
| 待办可选关联 | 通用可选关联 | `relatedType=todo`；与任务互斥；结束计时不改待办状态；顶栏联合选择与入口预填均可写入。 |
| 待办入口约束 | Render 层按计划时间点/区间控制入口 | 时间点待办隐藏「开始专注」；已有记录通过 `GET /trackTime/related/todo/:id` 只读展示。服务端不因时间点拒绝 create。 |
| 时长单位 | `duration: number` | 整数秒；render 换算小时/分钟。 |
| 任务实际耗时 | Task 详情聚合 | 由 TrackTime 聚合，不另存 Task 实际时长字段。 |
