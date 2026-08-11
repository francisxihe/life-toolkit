# True North v0.2.0 TDD

## 文档元信息

```yaml
document_meta:
  title: 'True North v0.2.0 TDD'
  version: 'v0.2.0'
  status: 'draft'
  created_date: '2026-08-09'
  last_updated: '2026-08-11'
  owner: 'Growth Squad'
  target_audience: ['frontend_developer', 'desktop_service_developer', 'tester']

scope:
  product_change_source: 'apps/prototype/product-wiki/changelog.json'
  included_modules: ['ai.session', 'growth.goal', 'growth.task', 'ai.platform']
  supplemental_contract: '密钥主进程配置文件写死；会话壳 + 目标/任务工作台拆解；任务建议仅子任务+待办；生成与采纳分离；openai_compatible；无设置页与流式'
```

桌面分层与数据流参见 [TechnicalWiki · 架构](../TechnicalWiki/architecture/overview.md)。AI 平台长期设计参见 [TechnicalWiki · AI](../TechnicalWiki/ai/README.md)。产品规则参见 ProductWiki · [AI 会话](../../apps/prototype/product-wiki/ai/session/README.md)、[目标管理](../../apps/prototype/product-wiki/growth/goal/README.md)、[任务管理](../../apps/prototype/product-wiki/growth/task/README.md)。本版产品范围见 [PRD](./PRD.md)。

## 范围追溯

| ProductWiki 变更 | 产品引用与原型 | 当前桌面端现状 | v0.2.0 交付 |
| --- | --- | --- | --- |
| 引入并改版目标 AI 拆解 | `growth.goal.view.ai-decomposition`；`GoalDecomposeWorkspace` | 详情抽屉 `GoalAiDecomposition.tsx` | 去掉详情抽屉；绑定会话 + 工作台 |
| 目标建议生成/采纳/追问 | `growth.goal.rule.ai-decompose-*` | 抽屉采纳 | 预览草稿、置灰、对已选追问 |
| 引入任务 AI 拆解 | `growth.task.view.ai-decomposition`；`TaskDecomposeWorkspace` | 无 | 任务详情入口；`task.decompose` 工作台；建议仅子任务+待办 |
| 任务建议生成/采纳/追问 | `growth.task.rule.ai-decompose-*` | 无 | 与目标工作台同一套交互；桌面 Capability **本版可后置**（原型已覆盖） |
| AI 会话壳 / 分发 | `ai.session.view.*`；`workspace-dispatch` | 无 `/ai` | 三栏壳；`goal.decompose` + `task.decompose` |
| 目标/任务绑定发起 | `goal-bound-start` / `task-bound-start`；`?goalId=` / `?taskId=` | 无 | ensure 绑定会话；不自动打开工作台 |

查询变更：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json
```

## 原型评审与决策

- 结论：原型 `/ai` 三栏与工作台分发可作为**交互与信息架构**指导；本地假建议**不得**作为正式生成算法。
- 阻断项已收敛：正式路径必须走真实模型；交互载体为会话工作台，**替换**抽屉。

| 问题与证据 | 方案比较 | 已确认决策 | 风险与后续 |
| --- | --- | --- | --- |
| 抽屉 vs 会话工作台 | A 保留抽屉 / B 会话壳 + 工作台（对齐 ProductWiki） | **B**；桌面现有抽屉视为待迁移差距 | 迁移期避免双入口并存 |
| 工作台是否默认打开 | A 发起后自动打开最后一块 / B 仅用户点选后打开 | **B**（含从目标发起） | 需空态文案引导点选 |
| 生成落点 | A 仅抽屉本地态 / B 写入助手消息 workspace 块 | **B**；仍调 `goal.decompose` Capability | 消息 parts 需稳定 schema |
| 会话持久化 | A 仅内存 / B SQLite Conversation + Message | **B**（本版） | 无云同步 |
| 密钥与设置 | A 设置页 / B 配置文件写死 | **B（本版）** | 密钥勿提交真实生产机密 |
| 流式对话 | A 本版 stream / B 请求-响应 REST | **B**；流式后置 | — |
| 待办关联目标 | 原型 `goalId` / 桌面 `relatedType` | 采纳待办写 `relatedType=GOAL` + `relatedId` | — |
| 编辑与采纳 | 「编辑后采纳」即创建 / 「编辑」仅缓存预览 | **编辑写回工作台块预览草稿；采纳读当前预览创建**；四类建议同一套 | 草稿需随工作台块载荷或本地态持久到消息刷新前可用 |
| 对已选追问 | 直接发送 / 预填确认 | **预填会话输入框并聚焦，用户确认后发送**；不自动打开工作台 | 摘要含类型、标题与当前预览字段 |
| 任务拆解建议类型 | 与目标相同四类 / 仅子任务+待办 | **仅子任务 + 待办** | 原型 fixture 非生成规格 |
| 任务 Capability | 本版与目标一并落地 / 会话壳后置 | **产品与原型本版交付**；桌面 `task.decompose` Capability 可随会话壳一并后置，记为差距 | 复用 Runner/配置 |

## 现状与差距

| 能力 | 现状 | 目标 |
| --- | --- | --- |
| AI 配置 / Provider / Runner / AiRun / 缓存 | 已落地 | 保留；工作台与绑定发起复用 |
| Goal decompose Capability | 已落地 | 发起会话时写入消息块；工作台可 `forceRefresh` 再生成 |
| 拆解 UI | 目标详情抽屉 | 迁到 `GoalDecomposeWorkspace`；去掉详情抽屉 |
| AI 会话壳 | 无 | `/ai` 三栏：列表 / 对话 / 工作台容器 |
| Conversation / Message | 无 | SQLite + IPC CRUD；`refType`/`refId`；`parts`（文本 + workspace） |
| 目标绑定发起 | 无 | `?goalId=` → ensure 绑定会话 + decompose 块 |
| 任务绑定发起 / 任务拆解工作台 | 原型已有；桌面无 | `?taskId=` → `task.decompose`；建议仅子任务+待办；桌面 Capability/IPC **待实现差距** |
| Settings UI / stream | 无 | **本版不做** |

## 技术设计

### 分层与文件职责

长期目录与抽象见 [TechnicalWiki · ai/platform](../TechnicalWiki/ai/platform.md)。本版必须落地：

| 层 | 路径 / 职责 |
| --- | --- |
| Enum / VO | 既有 AI enum；新增 Conversation / Message VO；GoalDecompose 保持 |
| web-service | 既有 `controller/ai.ts`（decompose）；新增会话相关 client |
| main IPC | 既有 `ai.route-controller.ts`（decompose）；新增会话 RouteController；注册于 `ipc-handlers.ts` |
| Platform | 保留 config/provider/completion/prompt/capability/run/cache/context；新增 `conversation/`（Entity/Repository/Service） |
| Render | 新增 `/ai` 会话页；工作台 registry 挂载 `goal.decompose` / `task.decompose`；目标与任务详情入口改为导航；**移除**详情抽屉主路径 |

Growth Goal/Task CRUD **不**新增 AI 生成路由。

Conversation.`refType` 支持 `goal` \| `task`。工作台块类型：`goal.decompose`、`task.decompose`。

### 配置（本版冻结）

```ts
// apps/desktop/src/service/ai/ai.config.ts（示意）
export const aiConfig = {
  providerKind: 'openai_compatible' as const,
  baseUrl: 'https://api.example.com/v1',
  model: '…',
  apiKey: '…', // 写死；仅主进程
  timeoutMs: 60_000,
};
```

- Runner 通过 `getAiConfig()` 读取；缺项 → `NOT_CONFIGURED`。
- 日后若改用户设置，只替换配置读取实现，Capability 不变。

### 数据模型（本版冻结）

**Conversation（SQLite）**：`title`、`refType?`（本版仅 `goal`）、`refId?`、`updatedAt`。

**Message（SQLite）**：`conversationId`、`role`（`user` \| `assistant`）、`parts`（JSON：文本块 + 工作台块）、`createdAt`。

工作台块至少含：`type`（本版 `goal.decompose`）、载荷（建议快照——含用户编辑后的预览草稿或可再拉取的 run/cache 引用）、展示用摘要。预览草稿写回后，采纳与「对已选追问」均读当前预览。

**AiRun / AiSuggestionCache**：沿用既有；绑定发起与工作台刷新仍写审计/缓存。

**不做：** settings 持久化、safeStorage、stream 通道、本地启发式建议。

### IPC 与 VO（本版必须实现）

| 方法 | 路径 | 请求 / 响应 |
| --- | --- | --- |
| POST | `/ai/capabilities/goal/decompose` | `GoalDecomposeRequestVo` → `GoalDecomposeResponseVo`（既有） |
| GET/POST/… | `/ai/conversations*`（具体形状实现期按生成流程定） | 列表、创建、按 id 取消息、追加追问、目标绑定发起（ensure + 产出拆解块） |

`AiSuggestionVo` 等见 [capabilities.md](../TechnicalWiki/ai/capabilities.md)。

错误统一：`{ code, message, details? }`（`NOT_CONFIGURED`、`PROVIDER_HTTP`、`TIMEOUT`、`INVALID_MODEL_OUTPUT`、`CONTEXT_NOT_FOUND`、`INTERNAL`）。

### Goal Decompose 实现要点

参见 [capabilities · goal.decompose](../TechnicalWiki/ai/capabilities.md)。本版参数冻结：

| 项 | 值 |
| --- | --- |
| 上下文子目标 / 任务 / 待办 / 习惯摘要上限 | 各 20 |
| 建议总量上限 | 8 |
| 每类上限 | 2 |
| JSON 失败 | 自动 repair 一次 |
| 冲突 | 直接子目标标题包含关系或规范化后相等 → `conflict` |
| 主进程创建实体 | **禁止** |
| 建议缓存 | SQLite `ai_suggestion_cache`；按目标 + `promptContext` sha256；命中则跳过 Provider |
| forceRefresh | 绑定发起默认 `false`；工作台内强制刷新 `true` |
| 本地启发式 | **不做** |

### 前端：AI 会话与工作台

- 路由 `/ai`：三栏壳；无选中会话时中间/右侧空态。
- 目标详情「AI 拆解」→ `/ai?goalId=…`；任务详情「AI 拆解」→ `/ai?taskId=…`；**不**打开抽屉。
- 绑定发起：ensure 会话 → 用户发起消息 + 助手消息（含对应 workspace 块）→ **不**自动激活工作台。
- 点选工作台块 → `WorkspaceHost` 按 `goal.decompose` / `task.decompose` 挂载。
- **编辑 / 采纳 / 对已选追问**：目标与任务工作台同一套；任务建议仅 `task`/`todo`。
- 目标采纳字段：goal `parentId`；task `goalId`；todo `relatedType=GOAL` + `relatedId`；habit `goalIds`。
- 任务采纳字段：子任务 `parentId=当前任务`；待办 `taskId=当前任务`（桌面若用 `relatedType` 则对齐任务关联约定）。
- 切换会话：关闭右侧工作台。

### 与代码生成流程

- 新增 `*.route-controller.ts` 后走仓库既有 sync/生成。
- 不得手改生成接口定义文件。

## 实施顺序与验收

1. Conversation / Message Entity + VO + 会话 IPC + DB 注册（`refType` 含 goal/task）。
2. `/ai` 三栏壳对齐原型。
3. 目标绑定发起 + `goal.decompose` 工作台（迁现有 Capability）。
4. 任务绑定发起 + `task.decompose` 工作台（Capability 可后置；原型已齐）。
5. 去掉目标详情抽屉主路径；联调。

| 场景 | 验收结果 |
| --- | --- |
| 从目标发起 | 打开/新建绑定会话；有目标拆解块；右侧默认空 |
| 从任务发起 | 打开/新建绑定会话；有任务拆解块；建议仅为子任务/待办 |
| 点选工作台块 | 右侧挂载对应拆解工作台 |
| 切换会话 | 右侧关闭 |
| 编辑保存 | 不创建实体；预览更新 |
| 采纳后 | 「已采纳」+ 预览置灰 |
| 对已选追问 | 预填 composer；发送后不自动打开工作台 |
| 无详情抽屉 | 目标/任务详情不再打开拆解抽屉 |
| 设置页 / 流式 | **不存在** |

验证命令：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json
pnpm --filter true-north-prototype product-wiki:check
```

## 非范围

- AI 设置 UI、`/ai/settings*`、safeStorage
- 流式渲染、tool-calling、RAG、非 OpenAI-compatible Provider
- 工作台/任务/待办页其它 AI 入口
- 会话页能力专用工具栏（如顶栏「重新生成拆解」）

## 相关文档

- [PRD](./PRD.md)
- [TechnicalWiki · AI](../TechnicalWiki/ai/README.md)
- [TechnicalWiki · Goal](../TechnicalWiki/growth/goal.md)
- [ProductWiki · AI 会话](../../apps/prototype/product-wiki/ai/session/README.md)
- [ProductWiki · 目标管理](../../apps/prototype/product-wiki/growth/goal/README.md)
- [ProductWiki · 任务管理](../../apps/prototype/product-wiki/growth/task/README.md)
