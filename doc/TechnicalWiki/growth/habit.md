# Habit 技术实现

产品说明见 [习惯管理 ProductWiki](../../../apps/prototype/product-wiki/growth/habit/README.md)。重复调度见 [重复规则](./repeat.md)。

## 代码边界

- 控制器：[habit.route-controller.ts](../../../apps/desktop/src/service/growth/habit/habit.route-controller.ts)，前缀 `/habit`。
- 服务位于 `apps/desktop/src/service/growth/habit/`；创建/更新时通过 `@true-north/components-repeat` 校验规则，规则与游标落在共享 **`repeat`**（`habit.repeatId`），Habit 自身不再重复存储规则列。
- Habit **不是** `repeat_todo`：额外拥有目标关联、streak、pause/activate 等产品语义。
- 打卡走 Todo 结算接口（`relatedType=habit`）；游标推进复用 `RepeatService.settleCurrent`。
- DTO 位于 `dto/`，VO 来自 `@true-north/vo` 的 `Habit` 命名空间。

## 与重复域的关系

| 概念 | Habit |
| --- | --- |
| 调度 | `habit.repeatId` → `repeat`（含 `currentDate`） |
| 当前实例 | `cycleTodoId` 指向已物化的当前 `todo`（eager）；`todo.relatedType=habit`，`relatedId=habit.id` |
| 结算 | 原地更新当前 todo 状态 → 推进 `repeat.currentDate` → 创建下一 cycle todo（或结束习惯） |
| 与独立重复差异 | 独立重复用 `repeat_todo` 投影、完成时才物化；Habit 创建即物化当前 cycle todo |

## IPC 路由

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| POST | `/habit/create` | 创建习惯 + `repeat` + 首个 cycle todo |
| DELETE | `/habit/delete/:id` | 删除习惯 |
| PUT | `/habit/update/:id` | 更新习惯内容/规则（规则写 `repeat`） |
| GET | `/habit/find/:id`、`/list`、`/page` | 查询 |
| PUT | `/habit/abandon/:id`、`/restore/:id`、暂停/激活 | 受控状态；放弃时结算未完成的 cycle todo |

## 原型对齐边界

功能与样式真源均为 **Prototype**：主路径是列表/卡片就地打卡，详情为次要入口。工作台习惯区复用 Todo `done`/`abandon`。

| 产品/原型语义 | 实现边界 |
| --- | --- |
| HabitCard / 工作台 | 就地完成/未完成；`formatHabitRepeatLabel` 展示规则 |
| 状态 | `active / paused / completed / abandoned` |
| 周期待办 | `cycleTodoId` + Todo 结算 + `RepeatService` 推进 |
| 已结算习惯 todo | 不可 `restore`；等待下一周期 |
