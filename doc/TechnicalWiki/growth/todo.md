# Todo 技术实现

产品说明见 [待办管理 ProductWiki](../../../apps/prototype/product-wiki/growth/todo/README.md)。重复调度与 `repeat_todo` 见 [重复规则](./repeat.md)。

## 代码边界

- 控制器：[todo.route-controller.ts](../../../apps/desktop/src/service/growth/todo/todo.route-controller.ts)，前缀 `/todo`。
- **实例**由 `TodoService` 处理；**独立重复定义**由 `TodoRepeatService`（表 `repeat_todo`）处理；**游标推进**由 `RepeatService` 处理。
- 控制器按 `TodoRelatedType` 分派：`is-repeat` 针对投影/定义，其余针对已落库 `todo`。
- DTO 位于 `dto/`，VO 来自 `@true-north/vo` 的 `Todo` 命名空间。

## 模型：实例 vs `repeat_todo`

| | `todo` | `repeat_todo` |
| --- | --- | --- |
| 本质 | 某一天的可执行实例 | 独立重复的内容定义（物化来源） |
| 状态 | 有 `TodoStatus`（todo/done/abandoned） | **无实例状态**；仅有系列生命周期（如 active/ended/abandoned） |
| 日期 | `planDate` | 当前日在关联的 `repeat.currentDate` |
| 列表「当前项」 | 自身即列表行 | 查询时投影为视图 DTO（`relatedType=is-repeat`） |

创建独立重复：只建 `repeat` + `repeat_todo`。完成投影：物化一条 `todo` 并推进 `repeat.currentDate`。

## 关联：`relatedType` + `relatedId`（单一归属）

| `relatedType` | `relatedId` | 含义 |
| --- | --- | --- |
| `none` | 空 | 独立一次性待办 |
| `task` | task.id | 任务下的待办 |
| `habit` | habit.id | 习惯周期/历史实例 |
| `repeat` | **repeat_todo.id** | 由 `repeat_todo` 物化的实例 |
| `goal` | goal.id | 目标来源（若使用） |
| `is-repeat` | — | **仅视图 DTO**，不落库；投影 id = `repeat_todo.id` |

### 类型推断（service / VO）

- Entity/DB：扁平 `relatedType` + `relatedId`。
- VO/DTO：判别联合；service 用 `narrowTodoRelated`。

## IPC 路由

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| POST | `/todo/create` | 创建普通待办，或带重复规则时创建 `repeat`+`repeat_todo` |
| DELETE | `/todo/delete/:relatedType/:id` | 删实例；`is-repeat` 删 `repeat_todo`+`repeat`，**不级联**已物化 `todo` |
| PUT | `/todo/update/:relatedType/:id` | 更新实例或 `repeat_todo` |
| GET | `/todo/find/:relatedType/:id`、`/list`、`/page` | 详情；**list 与 page（未完成筛选）均合并当前重复视图** |
| PUT | `/todo/done/:relatedType/:id`、`/done/batch` | 完成；`is-repeat` 走物化+推进 |
| PUT | `/todo/abandon/:relatedType/:id`、`/restore/:relatedType/:id` | 废弃与恢复（已物化习惯实例不可 restore） |

不提供 `/todo/start`、`/todo/pause`。

## 列表与分页

- `list`：真实 `todo` ∪ `generateTodoByRepeat`（按 `repeat.currentDate`）。
- `page`：在筛选状态未设或为 `todo` 时同样合并投影，计入 total；筛选 `done`/`abandoned` 时不加投影。

## 删除边界（对齐 ProductWiki）

| 入口 | 删除 |
| --- | --- |
| 今天 / 日历 | **不提供**删除（可完成/放弃） |
| 全部待办 | **提供**删除；进行中重复（`is-repeat`）只能在此删除 |

`DELETE .../is-repeat/:id`：删除 `repeat_todo` 及其 `repeat`；**保留** `relatedType=repeat AND relatedId=:id` 的历史 todo。

## 原型对齐边界

桌面端入口：`/growth/todo/todo-today`、`todo-calendar`、`todo-all`。批量完成仅在 `todo-all`（单次 ≤50）。

| 产品/原型语义 | 实现边界 |
| --- | --- |
| 状态 | `todo / done / abandoned`；通用 update 不接受状态流转 |
| 周期待办 | 见 [重复规则](./repeat.md)；三视图均展示当前指针实例 |
| 删除 | 仅全部；删系列不删物化历史 |
| list / page | 均合并进行中重复投影（未完成筛选） |
