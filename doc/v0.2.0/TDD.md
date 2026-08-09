# True North v0.2.0 TDD

## 文档元信息

```yaml
document_meta:
  title: 'True North v0.2.0 TDD'
  version: 'v0.2.0'
  status: 'draft'
  created_date: '2026-08-09'
  last_updated: '2026-08-09'
  owner: 'Growth Squad'
  target_audience: ['frontend_developer', 'desktop_service_developer', 'tester']

scope:
  product_change_source: 'apps/prototype/product-wiki/changelog.json'
  included_modules: ['growth.goal', 'ai.platform']
  supplemental_contract: '密钥主进程配置文件写死；生成与采纳分离；openai_compatible；聊天仅文档留白、零实现'
```

桌面分层与数据流参见 [TechnicalWiki · 架构](../TechnicalWiki/architecture/overview.md)。AI 平台长期设计参见 [TechnicalWiki · AI](../TechnicalWiki/ai/README.md)（`status: design`）。产品规则参见 ProductWiki · [目标管理](../../apps/prototype/product-wiki/growth/goal/README.md)。本版产品范围见 [PRD](./PRD.md)。

## 范围追溯

| ProductWiki 变更 | 产品引用与原型 | 当前桌面端现状 | v0.2.0 交付 |
| --- | --- | --- | --- |
| 引入 AI 拆解视图 | `growth.goal.view.ai-decomposition`；原型 `AiDecompositionDrawer.tsx` | 详情有「AI 拆解」入口与本地模板建议抽屉 | 抽屉改调真实 decompose；交互对齐原型（冲突/已采纳/批量确认等） |
| AI 建议生成规则 | `growth.goal.rule.ai-decompose-generation` | 本地 `useMemo` 模板，无 Provider | 主进程 Capability + OpenAI-compatible；配置来自主进程写死文件 |
| AI 建议采纳规则 | `growth.goal.rule.ai-decompose-adopt` | 可 create 四类实体；待办未挂 GOAL；缺已采纳/冲突 | 采纳对齐规则；todo 使用 `relatedType=GOAL` |

查询变更：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json
```

## 原型评审与决策

- 结论：原型抽屉可作为**交互与建议卡片信息架构**指导；本地四条模板**不得**作为正式生成算法或条数硬规格。
- 阻断项已收敛：正式路径必须走真实模型；未接入模型不得静默假 AI。

| 问题与证据 | 方案比较 | 已确认决策 | 风险与后续 |
| --- | --- | --- | --- |
| 原型用本地假建议 | A 本地启发式 / B 真实模型（无本地兜底）+ SQLite 上下文缓存 | **B** | 依赖主进程配置中的端点与 Key；打开抽屉可命中缓存 |
| 后续要聊天 | A 单接口硬编码 / B 平台 + Capability | **B**；聊天**仅文档留白，本版零实现**（不建表/目录/IPC） | 二期再立项会话模型 |
| 密钥与设置 | A 设置页 + safeStorage / B 配置文件写死 | **B（本版）**；配置抽象便于日后换成 A | 密钥勿提交真实生产机密到公共仓库；开发用本地改配置 |
| 待办关联目标 | 原型 `goalId` / 桌面 `relatedType` | 采纳待办写 `relatedType=GOAL` + `relatedId` | — |
| 「编辑后采纳」 | Creator 预填 / 行内改标题 | 行内改标题必须有；能接 Creator 则接 | Creator 预填可后补 |

## 现状与差距

| 能力 | 现状 | 目标 |
| --- | --- | --- |
| AI 配置 | 无 | `ai.config.ts` 写死 baseUrl/model/apiKey（主进程） |
| Provider / Runner | 无 | OpenAI-compatible + CompletionRunner + AiRun |
| Goal decompose | 渲染层模板 | `POST /ai/capabilities/goal/decompose` |
| 拆解 UI | 简化抽屉 | 对齐原型：摘要、impact、冲突、已采纳、批量 Modal、重新生成 |
| 采纳 todo | 未挂目标 | `relatedType=GOAL` |
| Settings UI / settings IPC | 无 | **本版不做** |
| Chat | 无 | **本版不做任何实现**（仅架构文档留白） |

## 技术设计

### 分层与文件职责

长期目录与抽象见 [TechnicalWiki · ai/platform](../TechnicalWiki/ai/platform.md)。本版必须落地：

| 层 | 路径 / 职责 |
| --- | --- |
| Enum / VO | AI 相关枚举；`packages/business/vo/ai/*`（GoalDecompose、AiRun 导出所需 VO；**无** Settings/Conversation VO） |
| web-service | `controller/ai.ts`（decompose）+ Service 客户端；走生成流程 |
| main IPC | `ai.route-controller.ts`；注册于 `ipc-handlers.ts` |
| Platform | `ai.config.ts`、`provider/`、`completion/`、`prompt/`、`capability/goal-decompose`、`run/`、`context/goal-context.builder.ts` |
| Render | 重写 `GoalAiDecomposition.tsx` + 样式；入口 `GoalMainHeader`；**无** AI 设置 Tab |

**禁止本版落地：** `conversation/` 目录、Conversation/Message Entity、`/ai/settings*`、设置页、stream preload。

Growth Goal CRUD **不**新增 AI 生成路由。参见 [growth/goal.md](../TechnicalWiki/growth/goal.md)。

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

**AiRun（SQLite）**：每次**实际打模型**的 decompose 写审计；缓存命中不新建 AiRun。字段见 platform.md。本版可不做 Runs UI。

**AiSuggestionCache（SQLite）**：按 capability + goal 存最近一次成功建议与上下文指纹；打开抽屉命中则跳过 Provider。

**不做：** Conversation、Message、settings 持久化文件、safeStorage、本地启发式建议。

### IPC 与 VO（本版必须实现）

| 方法 | 路径 | 请求 / 响应 |
| --- | --- | --- |
| POST | `/ai/capabilities/goal/decompose` | `GoalDecomposeRequestVo` → `GoalDecomposeResponseVo` |

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
| forceRefresh | 打开抽屉 `false`；「重新生成」`true`（强制打模型并覆盖缓存） |
| 本地启发式 | **不做** |

### 前端：GoalAiDecomposition

- 打开 → `decompose({ forceRefresh: false })`；重新生成 → `forceRefresh: true`；loading / 按 `code` 映射文案。
- `NOT_CONFIGURED` → 提示主进程 AI 配置不可用（不链设置页）。
- 展示 analysisSummary、reason、impact、planned、importance、conflict。
- 勾选、单条采纳、批量确认 Modal、已采纳态、冲突禁用。
- 标题可编辑后采纳。
- 采纳字段：goal `parentId`；task `goalId`；todo `relatedType=GOAL` + `relatedId`；habit `goalIds`。
- **无**「使用本地建议」；失败仅重试/重新生成。
- 补齐建议卡片样式。

### 与代码生成流程

- 新增 `*.route-controller.ts` 后走仓库既有 sync/生成。
- 不得手改生成接口定义文件。

## 实施顺序与验收

1. Enum/VO + `ai.config.ts` + provider + runner + AiRun entity + 注册 DB/IPC。
2. `GoalDecomposeCapability` + context builder + prompt + decompose 路由。
3. 重写拆解 UI + 采纳字段修复 + 样式。
4. 联调；入库后将 TechnicalWiki/ai 与代码对齐。

| 场景 | 验收结果 |
| --- | --- |
| 配置缺项 / 空 Key | decompose 返回 `NOT_CONFIGURED`；无未标注假 AI |
| 错误 Key / URL | 明确 `PROVIDER_HTTP` 等错误 |
| 配置正确 | 结构化建议；AiRun 成功记录；写入缓存 |
| 二次打开（上下文不变） | 命中缓存；无新 Provider 调用；runId 与首次相同 |
| 上下文变化后再开 | 指纹 miss，重新打模型 |
| 冲突子目标 | conflict，不可勾选/采纳 |
| 采纳待办 | `relatedType=GOAL` 可查 |
| 批量采纳 | Modal 确认后创建 |
| 重新生成 | 新 AiRun、新 runId、缓存被覆盖 |
| 无本地建议 UI | 无「使用本地建议」按钮/Tag |
| 聊天 / 设置页 | **不存在**相关 UI、表、IPC |

验证命令：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json
pnpm --filter true-north-prototype product-wiki:check
```

## 非范围

- 聊天（任意实现，含空表/空目录）
- AI 设置 UI、`/ai/settings*`、safeStorage
- 流式渲染、tool-calling、RAG、非 OpenAI-compatible Provider
- 工作台/任务/待办页其它 AI 入口

## 相关文档

- [PRD](./PRD.md)
- [TechnicalWiki · AI](../TechnicalWiki/ai/README.md)
- [TechnicalWiki · Goal](../TechnicalWiki/growth/goal.md)
- [ProductWiki · 目标管理](../../apps/prototype/product-wiki/growth/goal/README.md)
