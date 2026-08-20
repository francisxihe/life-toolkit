# Task 技术实现

产品说明见 [任务管理 ProductWiki](../../../apps/prototype/product-wiki/growth/task/README.md)。

## 当前代码边界

- 控制器：[task.route-controller.ts](../../../apps/desktop/src/service/growth/task/task.route-controller.ts)，前缀 `/task`。
- 服务、实体关联处理和仓储实现在 `apps/desktop/src/service/growth/task/`；Entity 使用 TypeORM closure table 保存父子任务。
- DTO 位于该目录的 `dto/`，VO 来自 `@true-north/vo` 的 `Task` 命名空间。

## 当前 IPC 路由

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| POST | `/task/create` | 创建任务 |
| DELETE | `/task/delete/:id` | 删除任务 |
| PUT | `/task/update/:id` | 更新任务 |
| GET | `/task/find/:id`、`/list`、`/page` | 查询单项、列表和分页 |
| GET | `/task/task-with-relations/:id`、`/tree` | 查询任务及关联信息、任务树 |
| PUT | `/task/done/:id`、`/start/:id`、`/pause/:id`、`/abandon/:id`、`/restore/:id` | 受控状态流转 |

`/task/tree` 返回根节点及嵌套 `children`；`/task/task-with-relations/:id` 是详情聚合入口。路由与返回对象取自当前控制器；更细粒度 DTO/VO 字段请以源码和生成包为准。

## 原型对齐边界

桌面端增长任务入口为 `/growth/task/task-today`、`/growth/task/task-calendar` 和 `/growth/task/task-all`；`task-today` 是当前日期工作清单，左侧日程日历可切换选定日期，列表按「已过期 / **未完成** / 已完成 / 已放弃」分组（仅选定今天时显示已过期）。**能力集以 Desktop 为准，页面视觉对齐 Prototype。** 不做任务联动摘要。独立周视图和统计页已移除，工作台承担聚合统计。

| 原型契约 | v0.1.0 状态 | 当前实现 |
| --- | --- | --- |
| 详情抽屉 | 已落地 | 任务各视图和 Goal 的关联任务均在当前页面打开 `TaskDetailDrawer`；不注册独立任务详情路由。 |
| 详情数据 | 已落地 | 左侧仅定位当前根任务及后代；右侧固定概览、关联 Todo、TrackTime；Todo 按 `taskIds` 查询，TrackTime 按 `relatedType/relatedId` 查询。 |
| 唯一直接归属 | 已落地 | Create/Update Service 强制 `goalId`、`parentId` 二选一，校验归属存在、自环和循环层级；切换归属会显式清除旧关系。 |
| 时间、重要度、难度继承 | 已落地 | 子任务创建时继承父任务的计划范围、重要度和难度；所有写入入口均校验不得超出上游目标或任务。 |
| 删除与状态流转 | 已落地 | 有直接子任务或关联 Todo 时拒绝删除；`done/start/pause/abandon/restore` 负责合法状态与时间戳，通用 update 拒绝状态字段。 |
| 工时 | 已落地 | `estimateTime` 和 TrackTime `duration` 均为整数秒；服务层验证，渲染层按小时/分钟展示。 |
| 当前任务视图 | 对齐中 | overdue **仅** `isSelectedToday`（见 `task-today/index.tsx`）；列表项为 Prototype **execution row**：行内完成+专注，更多菜单保留 start/pause/abandon/delete（`TaskList/TaskItem.tsx`）。 |
| 任务日历与全部视图 | 对齐中 | 月历 chip **左边框**风格（对齐原型 `.calendarTask`）；格子悬停新建已落地（`task-calendar/CalendarCell.tsx`）；全部任务筛选能力维持 Desktop。 |

版本内设计、迁移和验收见 [v0.1.0 TDD](../../v0.1.0/TDD.md)。
