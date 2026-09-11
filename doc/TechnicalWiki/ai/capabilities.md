# AI Capabilities

```yaml
document_meta:
  status: 'active'
  last_updated: '2026-09-11'
```

产品语义参见 ProductWiki · [目标管理 · AI 拆解](../../../packages/product-wiki/wiki/growth/goal/spec.json)。平台抽象参见 [platform.md](./platform.md)。

业务 Capability 实现位于对应业务目录，由 `composeAiPlatform()` 注册。AI 核心只按 `key: string` 调度。已持久化的 workspace key 保持不变。

## 1. `goal.decompose` / `task.decompose`

归属：Growth。常量 `GoalDecomposeKey` / `TaskDecomposeKey`、VO 与 `parseDecomposePayload` 在 Growth 包内。

### 代码

| 层 | 路径 |
| --- | --- |
| Capability / 上下文 / MCP 工具 / entity resolver | `apps/desktop/src/service/growth/ai/` |
| 工作台 UI | `apps/desktop/src/render/features/growth/workbench/ai-decomposition/` |
| 渲染实体源 | `apps/desktop/src/render/features/growth/ai/entity-sources.ts` |

### 产品对应

- 视图：`growth.goal.view.ai-decomposition`（任务拆解同型工作台）
- 规则：`growth.goal.rule.ai-decompose-generation`、`growth.goal.rule.ai-decompose-adopt`

### IPC

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/ai/capabilities/:key` | 规范入口；key 为 `goal.decompose` / `task.decompose` |
| POST | `/ai/capabilities/goal/decompose` | 兼容别名 |
| POST | `/ai/capabilities/task/decompose` | 兼容别名 |
| POST | `/ai/conversations/bound` | `{ refType, refId }` 确保绑定会话 |

Agent 工具 `decompose_goal` / `decompose_task` 先读实体再把模型生成的 suggestions 交给 Capability 规范化，写入助手消息 workspace 块。**不在主进程创建** Goal/Task/Todo/Habit。

### 执行要点

1. 校验目标/任务存在，否则 `CONTEXT_NOT_FOUND`。
2. Growth context builder 装配截断上下文（目标/任务字段、直接子项、关联待办习惯等）。
3. 对上下文指纹查 `ai_suggestion_cache`；命中则重算 `conflict` 后返回。
4. 未命中时使用 Agent 传入的 suggestions 做本地后处理：非法 kind / 空 title 丢弃，标题近似填 `conflict`，总量与每类上限裁剪。
5. 组装 `analysisSummary` 与 `suggestions`，覆盖缓存并返回。

### 采纳

工作台组件调用现有 Growth create API。待办 `relatedType = GOAL`（或任务侧对应关联）；子目标 `parentId`；任务 `goalId`；习惯 `goalIds`。UI 状态见 ProductWiki，不在此重复。

自动打开：仅绑定发起（`force=true`）。消息里点选入口文案由 tool definition 的 `entryLabel` 提供。

### 失败与兜底

- 平台错误码见 [platform.md](./platform.md)。
- **无本地启发式建议**；失败时仅展示错误与重试，禁止静默降级为假 AI。

## 2. `activity.capture`

归属：Activity。常量 `ActivityCaptureKey`、capture VO 与 `parseCapturePayload` 在 Activity 包内。

| 层 | 路径 |
| --- | --- |
| Capability / `capture_activity` 工具 | `apps/desktop/src/service/activity/ai/` |
| 采纳编排与 `CaptureAdopter` | `apps/desktop/src/service/activity/capture/` |
| 工作台 UI | `apps/desktop/src/render/features/activity/workbench/` |

Agent 工具只规范化 `todo | expense | purchase | bookmark` 建议，不创建领域实体。用户确认后走 **`POST /activity/adopt`**（规范入口）。同一 TypeORM 事务内：各业务 adopter 写领域记录 → 创建 Activity/links → 把 workspace payload 标为已采纳。任一失败整体回滚。

Todo / Expense / Purchase / Library 在各自 service 目录导出 adopter，由 `composeAiPlatform()` 注入，Activity 不直接 import 四个业务 Service 做采纳。

自动打开：`capture_activity` 工具 status 为 `done`，或绑定发起的 `force`。

已有 `purpose: capture` 会话只当普通历史读取，不再作为入口。生成不等于采纳。

## 3. 后续 Capability

在业务域新增 Capability +（可选）MCP 工具、实体 resolver、Workbench 工具定义，再于主进程/渲染 composition root 显式注册。不要把业务实现放进 `service/ai` 或 `render/features/ai`。workspace key、工具名一旦写入消息就必须保持稳定。
