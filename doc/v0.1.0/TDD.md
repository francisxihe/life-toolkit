# True North v0.1.0 技术开发文档（TDD）

## 文档元信息

```yaml
document_meta:
  title: 'True North v0.1.0 TDD'
  version: 'v0.1.0'
  status: 'draft'
  created_date: '2025-12-23'
  last_updated: '2026-08-08'
  owner: 'Growth Squad'
  target_audience: ['frontend_developer', 'desktop_service_developer', 'tester']

scope:
  product_change_source: 'packages/product-wiki/wiki/changelog.json'
  included_modules: ['growth.goal', 'growth.task', 'growth.todo', 'growth.track-time']
  supplemental_contract: '任务预计时长与专注时长均以整数秒传输和存储；待办无 in_progress，计时不改待办状态'
```

桌面端进程、IPC、DTO/VO 与持久化分层参见 [TechnicalWiki · 架构总览](../TechnicalWiki/architecture/overview.md) 和 [TechnicalWiki · 数据流](../TechnicalWiki/architecture/data-flow.md)。产品规则参见 ProductWiki 的 [目标管理](../../packages/product-wiki/wiki/growth/goal/spec.json)、[任务管理](../../packages/product-wiki/wiki/growth/task/spec.json)、[待办管理](../../packages/product-wiki/wiki/growth/todo/spec.json) 与 [专注与时间追踪](../../packages/product-wiki/wiki/growth/track-time/spec.json)。长期实现边界见 [TechnicalWiki · Todo](../TechnicalWiki/growth/todo.md)、[Track-Time](../TechnicalWiki/growth/track-time.md)。

## 范围追溯与现状

| ProductWiki 变更 | 原型落点 | 当前桌面端现状 | v0.1.0 交付 |
| --- | --- | --- | --- |
| Goal 详情、状态字段 | `pages/goal/index.tsx` | 有 CRUD 与树接口；完成入口和层级规则未完整收口 | 详情操作区、受控状态流转、校验与删除影响检查 |
| Goal 时间范围、优先级继承 | `shared/lifecycle.ts` | Entity 有时间、重要度、难度；Service 未校验父子关系 | 创建、编辑父/子目标时在 Service 层校验 |
| Task 详情抽屉 | `pages/task-detail/` | 有任务树、关联查询基础接口；无抽屉实现契约 | 抽屉数据加载与交互实现 |
| Task 时间继承 | `shared/lifecycle.ts` | Task 允许 `goalId`、`parentId` 同时为空或同时存在，缺少难度字段 | 唯一归属与上游约束校验 |
| Todo 状态精简 | `pages/todo/`、`EntityDrawer` | 仍有 `in_progress` 与 `/todo/start|/pause` | 三态 + 删除 start/pause + 数据迁移 |
| Todo 区间专注 / TrackTime 待办关联 | `FocusTimer`、待办列表/抽屉 | TrackTime 仅 `TASK`；待办无专注入口 | `TrackTimeRelatedType.TODO`、入口与只读历史 |

非范围：Habit 产品扩展；服务端因时间点拒绝 create。

## 目标与任务实现设计

### Goal：类型、层级与状态

- 将 Goal 类型的持久化与 VO 枚举统一为 ProductWiki 的 `vision | result`。迁移现有 `objective → vision`、`key_result → result`；迁移在 TypeORM 数据库升级流程中执行，不手改生成 API。
- `POST /goal/create` 与 `PUT /goal/update/:id` 的 Service 必须在同一业务事务内校验直接父子关系：顶层只能为 `vision`、`result` 父级只能拥有 `result` 子级、子目标时间范围不得越界、重要度和难度不得超过父级；修改父目标时还要校验其全部直接子目标。
- 通用更新不再作为状态转换入口。新增 `PUT /goal/done/:id`，并保留 `PUT /goal/abandon/:id`、`PUT /goal/restore/:id`；三个入口统一维护 `doneAt`、`abandonedAt`，并只接受合法状态迁移。渲染层仅展示状态 Tag，通过这些操作入口触发变更。
- 删除前由 GoalService 汇总直接子目标、关联任务、关联待办和关联习惯；存在影响时拒绝删除并返回可展示的影响摘要，避免数据库级级联删除破坏复盘关系。

### Task：抽屉、关系树与约束

- 渲染层在 Task 页面内挂载 `TaskDetailDrawer`，不注册 `/growth/task/detail/:id`。入口传入任务 id；Provider 维护当前选中节点，关闭后销毁局部状态。
- 左侧使用 `GET /task/tree` 的根树定位当前任务所属根节点，再仅渲染该根节点及后代；选中节点展开父链。内联创建调用 `POST /task/create`，成功后刷新此根树。
- 右侧只提供“概览 / 关联 Todo / TrackTime”：详情使用 `GET /task/task-with-relations/:id`；Todo 使用 `/todo/list` 的 `taskIds` 过滤；TrackTime 使用 `/trackTime/related/:relatedType/:relatedId`，打开计时器时携带任务关联但不自动启动。
- Task 的创建与更新必须恰好指定一个直接归属（`goalId` 或 `parentId`）；校验归属对象存在、无自环/循环父子关系，并校验任务计划范围、重要度与难度不超出归属目标或父任务。删除有直接子任务或关联 Todo 的任务时返回冲突，不级联删除。
- 新增 `PUT /task/done/:id`；`abandon`、`restore` 与 `done` 负责状态时间戳和转换校验，通用 `PUT /task/update/:id` 不接受状态流转。

### Todo：状态精简与受控流转

- `TodoStatus` 仅保留 `todo | done | abandoned`；从 `@true-north/enum` 移除 `IN_PROGRESS`。
- 删除 `TodoService` / `TodoRepeatService` 的 `start`、`pause` 及 RouteController `PUT /todo/start/:relatedType/:id`、`PUT /todo/pause/:relatedType/:id`；按仓库生成流程同步客户端。
- `done` / `abandon` 仅允许当前状态为 `todo`；`restore` 回到 `todo`。通用 `update` 不接受状态字段。
- SQLite 启动迁移：将 `todo` / `todo_repeat`（及实际表名）中 `status = 'in_progress'` 更新为 `'todo'`。
- Render：列表/表格/筛选去掉「开始」与「进行中」；未完成判定为 `status === todo`。

### TrackTime：待办关联与 FocusTimer

- `TrackTimeRelatedType` 增加 `TODO = 'todo'`；create/related 查询支持待办 id。
- `FocusTimerProvider.open` 支持任务/待办预关联（`{ taskId, todoId, label? }`）；`relatedLocked = Boolean(taskId || todoId)` 由入口显式决定，不用当前 `todoId` 推断。
- 未锁定时：`loadTimerData` 并行加载未完成任务与 `TodoStatus.TODO` 待办，Select 分组可搜索（`task:<id>` / `todo:<id>`），清空为独立专注；迷你与全屏复用同一选择/锁定逻辑。
- 锁定时只读展示 `任务 · {name}` / `待办 · {name}`，无 Select；结束时 `TrackTimeController.create` 写入对应关联；**不**调用待办状态接口。
- 待办列表/详情：当 `status === todo` 且 `planStartTime !== planEndTime` 时展示「开始专注」；时间点隐藏入口。
- 待办详情只读加载 `GET /trackTime/related/todo/:id`；时间点待办同样可读。
- 服务端不因时间点拒绝 `relatedType=todo` 的 create。

### 数据、VO 与迁移

| 对象 | v0.1.0 契约 | 兼容处理 |
| --- | --- | --- |
| GoalType | `vision | result` | 迁移旧枚举值；VO、DTO、Entity、web-service 通过既有代码生成流程同步。 |
| Task 计划范围 | 继续使用 `startAt` / `endAt` 表示唯一计划范围 | 原型的 `start/end` 与 `plannedStart/plannedEnd` 映射至该范围，不增设第二组持久化日期。 |
| Task 预计时长 | `estimated: number`，单位为秒 | `estimateTime: string` 迁移为可无歧义解析的秒数；不可解析值置空并列入数据修复清单。 |
| TrackTime 时长 | `duration: number`，单位为秒 | 所有聚合与展示从秒换算为小时/分钟；不再以分钟作为 IPC 或存储单位。 |
| Task 难度 | `difficulty: number`，与 Goal 一致参与上游校验 | 保留历史 `urgency` 列直到兼容窗口结束，但不作为 v0.1.0 任务层级约束字段。 |
| TodoStatus | `todo \| done \| abandoned` | `in_progress` → `todo`；删除 start/pause 生成接口。 |
| TrackTimeRelatedType | `none \| task \| todo` | 存量记录无待办关联；新增待办关联写入 `relatedType=todo`。 |

接口定义、VO 与 web-service controller 必须通过仓库生成流程更新；不得直接改写生成接口。

## 实施顺序与验收

1. 更新 ProductWiki，完成 Goal/Task/Todo/TrackTime 差异设计。
2. 落地 Service 级层级、删除与状态转换约束，再通过 RouteController 暴露新增 `done` IPC；删除待办 start/pause。
3. 完成 Task 抽屉与 Todo 专注入口、TrackTime 待办关联；所有错误在操作位置反馈。
4. 更新 TechnicalWiki 的现状与差距矩阵，保证版本 TDD 不复制长期工程规范。

| 场景 | 验收结果 |
| --- | --- |
| 编辑 Goal 父级时间、重要度或难度 | 任一直接子目标越界时拒绝保存并说明冲突。 |
| Goal 完成、放弃、恢复与删除 | 状态 Tag 只读；状态入口合法；有关联内容时禁止删除。 |
| 打开任意任务详情 | 在当前页面打开抽屉；左侧仅有同根子树；右侧无独立子任务 Tab。 |
| 新建或调整子任务 | 必须只有一个上游，且计划范围、重要度、难度均不超过上游。 |
| 记录与展示工时 | Task 预计与 TrackTime 实际均以秒保存；界面显示可读的小时/分钟。 |
| 待办状态 | 无开始操作与进行中；旧 `in_progress` 视为未完成。 |
| 区间待办专注 | 可预关联创建 TrackTime；待办状态不变。 |
| 时间点待办 | 无专注入口；已有关联记录仍可读。 |

验证命令：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.1.0 --json
pnpm --filter true-north-prototype product-wiki:check
pnpm --filter true-north-prototype test -- --runInBand
```
