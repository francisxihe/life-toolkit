# 重复规则技术实现

产品说明见 [重复规则 ProductWiki](../../../apps/prototype/product-wiki/growth/repeat/README.md)。

重复分为两层：**共享调度实体 `repeat`**（Desktop 持久化）与 **规则算法包** `@true-north/components-repeat`（不落库）。不单独注册 RouteController；由 `repeat_todo` 与 Habit 关联使用。

## 代码边界

| 层 | 路径 | 职责 |
| --- | --- | --- |
| 算法包 | [packages/components/repeat](../../../packages/components/repeat)（`@true-north/components-repeat`） | `RepeatRule` 解析、`assertRepeat`、`calculateNextDate`；不决定状态迁移或事务 |
| 调度实体 | `apps/desktop/src/service/growth/repeat/` | 表 `repeat`：规则字段 + **`currentDate` 游标**；`RepeatService.settleCurrent` 推进或结束 |
| 内容主人 | `repeat_todo`（独立重复）、`habit`（习惯） | 各挂 `repeatId`；不各自再存一份规则列 |

## 三层关系

```text
repeat          规则 + currentDate（无业务内容、无 TodoStatus）
    ↑ repeatId
repeat_todo     独立重复的内容定义（无实例状态）
habit           习惯内容 + streak 等（无实例 TodoStatus）
    ↓ 结算时物化
todo            唯一带 planDate + TodoStatus 的实例
```

说明时可用「蓝图」理解 `repeat_todo`，领域命名一律用 **`repeat_todo`**，不要使用 template。

## 调用关系

```text
RepeatSelector / renderer form
  -> RepeatRule VO
  -> RepeatTodoService 或 HabitService
  -> assertRepeat
  -> 创建/更新 Repeat + 主人.repeatId
  -> 结算时 RepeatService.settleCurrent + 物化 Todo
```

| 使用方 | 职责 | 持久化 |
| --- | --- | --- |
| `repeat_todo` | 内容定义；列表投影当前视图；结算时物化 `todo` | 内容字段 + `repeatId`；系列生命周期 ≠ `TodoStatus` |
| Habit | 内容、目标、streak；打卡走 Todo 结算 | 习惯字段 + `repeatId`；可选 `cycleTodoId` 指向当前实例 |
| Todo | 一次性事项，或已结算的重复/习惯实例 | `relatedType` + `relatedId`（见 [Todo](./todo.md)） |
| render | 选择器收集规则 | 不自行计算下一日期 |

## 主路径（独立重复）

1. **创建**：写 `repeat`（`currentDate` = 首日）+ `repeat_todo`；**不写** `todo`。
2. **列表 / 分页**：今天、日历、全部在未完成筛选下均合并按 `repeat.currentDate` 投影的视图（`relatedType=is-repeat`，id = `repeat_todo.id`）。
3. **完成/放弃视图**：快照 `currentDate` → 插入有状态 `todo`（`relatedType=repeat`，`relatedId=repeat_todo.id`）→ `RepeatService.settleCurrent` 推进游标；系列结束只改 `repeat_todo` 生命周期。
4. **删除系列**：仅全部待办入口；删 `repeat_todo` + `repeat`，**不删除**已物化历史 `todo`。

## 旧表迁移

启动时若仍存在 `todo_repeat`：逐行拆成 `repeat`（规则 + `current_date`）与 `repeat_todo`（内容 + `repeat_id`，**保留原 id**），状态映射 `todo→active` / `abandoned→abandoned` / 其余→`ended`，然后 `DROP TABLE todo_repeat`。

## 约束

- 所有规则以本地 `YYYY-MM-DD` 计算；`forTimes` 将首次实例计入次数。
- 周/月/年/自定义模式须满足各自配置完整性。
- `todo.relatedId` 在 `relatedType=repeat` 时指向 **`repeat_todo.id`**，不是 `repeat.id`。
- 共享包只处理重复语义，不决定 Todo/Habit 状态迁移、批量上限或持久化事务。
