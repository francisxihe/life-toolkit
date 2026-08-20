# AI Capabilities

```yaml
document_meta:
  status: 'design'
  last_updated: '2026-08-11'
```

产品语义参见 ProductWiki · [目标管理 · AI 拆解](../../../apps/prototype/product-wiki/growth/goal/README.md)。平台抽象参见 [platform.md](./platform.md)。

## 1. `goal.decompose`（v0.2.0 交付）

### 产品对应

- 视图：`growth.goal.view.ai-decomposition`
- 规则：`growth.goal.rule.ai-decompose-generation`、`growth.goal.rule.ai-decompose-adopt`

### IPC

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/ai/capabilities/goal/decompose` | 输入 `goalId`，返回分析摘要与建议列表 |

### VO（设计）

**请求** `GoalDecomposeRequestVo`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| goalId | string | 当前目标 |
| forceRefresh | boolean? | `true` 时跳过缓存，强制调用模型并覆盖缓存；绑定发起默认 `false`，工作台内强制刷新传 `true` |

**响应** `GoalDecomposeResponseVo`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| runId | string | 对应 AiRun（缓存命中时为生成时的 runId） |
| analysisSummary | string | 工作台分析摘要文案 |
| suggestions | AiSuggestionVo[] | 建议列表 |

**AiSuggestionVo**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 稳定于单次响应内 |
| kind | `goal` \| `task` \| `todo` \| `habit` | 建议类型 |
| title | string | 标题 |
| reason | string | 理由 |
| impact | string | 影响说明 |
| planned | string | 计划日期 `YYYY-MM-DD` |
| importance | number | 重要度 |
| difficulty | number | 难度 |
| conflict | string? | 本地后处理写入；有值则不可采纳 |

### 执行步骤（主进程 Capability）

1. 校验目标存在，否则 `CONTEXT_NOT_FOUND`。
2. `goal-context.builder` 装配**截断**上下文：
   - 目标：名称、描述、类型、状态、重要度/难度、起止
   - 直接子目标标题（上限 N）
   - 关联任务 title+status（`findByGoalIds`，上限 N）
   - 关联待办（`relatedType=GOAL` + relatedId）与习惯摘要（上限 N）
3. 对 `promptContext` 计算 sha256 指纹；若 `!forceRefresh` 且 SQLite `ai_suggestion_cache` 命中（同一 capability + goal + 指纹一致），重算 `conflict` 后直接返回（**不**新建 AiRun、不调 Provider）。
4. 未命中 / 强制刷新：通过 PromptRegistry 构建 messages，要求模型**只输出 JSON**（字段与 kind 枚举固定）。
5. `CompletionRunner.complete({ responseFormat: 'json', schema, ref: { type: 'goal', id } })`。
6. **本地后处理**（不信任模型冲突判断）：
   - 非法 kind / 空 title 丢弃
   - 与已有子目标标题近似 → 填 `conflict`
   - 总量与每类上限（实现默认：总量 ≤ 8，每类 ≤ 2，可在 TDD 微调）
7. 组装 `analysisSummary` 与 `suggestions`，写入/覆盖 `ai_suggestion_cache`（按目标一行），返回。
8. **不在主进程创建** Goal/Task/Todo/Habit。

### 缓存

- 键：`capabilityKey` + `refType=goal` + `refId=goalId`（一目标一行，覆盖写）。
- 失效：上下文指纹变化（目标/子目标/关联任务待办习惯摘要变化）→ miss；`forceRefresh=true` → 强制打模型并覆盖。

### 采纳（渲染层，非本 Capability）

- 调用现有 Growth create API。
- 待办：`relatedType = GOAL`，`relatedId = goalId`。
- 子目标：`parentId = goalId`，类型遵守 Goal 规则。
- 任务：`goalId`；习惯：`goalIds` 含当前目标。
- UI 状态（已采纳、批量确认、编辑后采纳）见版本 TDD / ProductWiki，不在此重复。

### 失败与兜底

- 平台错误码见 [platform.md](./platform.md)。
- **无本地启发式建议**；失败时仅展示错误与重试/重新生成，禁止静默降级为假 AI。

## 2. 后续 Capability

新业务能力应作为**新 Capability** 挂在同一平台上，复用配置抽象、Provider、Runner、AiRun；结果可通过会话消息中的工作台块交付（见 [platform.md §7](./platform.md)）。流式、工具调用、RAG 等未立项能力不预埋半成品代码。
