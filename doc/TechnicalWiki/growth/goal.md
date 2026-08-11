# Goal 技术实现

产品说明见 [目标管理 ProductWiki](../../../apps/prototype/product-wiki/growth/goal/README.md)。

## 当前代码边界

- 控制器：[goal.route-controller.ts](../../../apps/desktop/src/service/growth/goal/goal.route-controller.ts)，前缀 `/goal`。
- 服务与仓储实现位于 `apps/desktop/src/service/growth/goal/`；控制器通过 `GoalService` 调用业务能力。
- DTO 位于同目录 `dto/`，VO 来自 `@true-north/vo` 的 `Goal` 命名空间；Entity 使用 TypeORM closure table 保存父子层级。

## 当前 IPC 路由

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| POST | `/goal/create` | 创建目标 |
| DELETE | `/goal/delete/:id` | 删除目标 |
| PUT | `/goal/update/:id` | 更新目标 |
| GET | `/goal/find/:id`、`/list`、`/page` | 查询单项、列表和分页 |
| GET | `/goal/get-tree`、`/find-roots`、`/children/:parentId` | 查询目标树与层级节点 |
| PUT | `/goal/done/:id`、`/abandon/:id`、`/restore/:id` | 受控完成、废弃与恢复目标 |

控制器负责将请求 VO 导入 DTO，再调用服务并导出 VO；本文不将其视为产品字段契约。

## 原型对齐边界

| 原型契约 | v0.1.0 状态 | 当前实现 |
| --- | --- | --- |
| `vision / result` 类型 | 已落地 | enum、VO、DTO 与 Entity 统一为 `vision / result`；数据库初始化会将旧的 `objective / key_result` 迁移为新值。 |
| 父子类型、时间、重要度和难度约束 | 已落地 | GoalService 在创建、编辑父级与变更父级时校验直接层级、循环引用、时间范围、重要度与难度；父级收紧会校验全部直接子目标。 |
| 完成、放弃、恢复 | 已落地 | `/goal/done/:id`、`/abandon/:id`、`/restore/:id` 维护合法状态与时间戳；通用更新拒绝状态字段，渲染层仅展示状态 Tag。 |
| 删除影响提示 | 已落地 | GoalService 汇总直接子目标、关联任务、目标关联 Todo 与习惯；存在影响时拒绝删除并返回可展示摘要。 |
| 详情操作区 | 已落地 | Goal 详情固定为概览、子目标、关联任务三 Tab；右上方提供只读状态 Tag、编辑/删除/放弃菜单及完成/恢复主操作。 |

### AI 拆解（消费方）

目标详情「AI 拆解」仅**发起**绑定该目标的 AI 会话；**模型调用与建议生成**属于 AI 平台域，不在 `/goal/*` CRUD 内实现；审阅与采纳在会话页右侧工作台完成，不再使用详情抽屉。参见 [TechnicalWiki · AI](../ai/README.md)、[capabilities · goal.decompose](../ai/capabilities.md)。采纳创建仍使用本模块既有 create 接口。版本差异与验收见 [v0.2.0 TDD](../../v0.2.0/TDD.md)。

版本内 Goal CRUD 设计见 [v0.1.0 TDD](../../v0.1.0/TDD.md)。
