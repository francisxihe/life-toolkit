# AI Platform

```yaml
document_meta:
  status: 'design'
  last_updated: '2026-08-11'
```

参见 [AI 域总览](./README.md)。通用 Desktop 分层不在此复述。

## 1. 配置（v0.2.0：主进程配置文件写死）

### 本版策略

- 使用主进程内**静态配置模块**（建议 `apps/desktop/src/service/ai/ai.config.ts`）提供 `providerKind`、`baseUrl`、`model`、`apiKey`、`timeoutMs` 等。
- **密钥写死在该配置文件**（仅主进程可读）；**不**做用户设置 UI、**不**做 `safeStorage`、**不**暴露 `/ai/settings*` IPC。
- 配置文件不得被渲染进程 import；`apiKey` 不得经 preload/IPC 回传。
- 缺必要项时 Runner 返回 `NOT_CONFIGURED`（提示检查主进程配置，而非打开设置页）。

### 逻辑字段

| 字段 | 说明 |
| --- | --- |
| `providerKind` | 首版仅 `openai_compatible` |
| `baseUrl` | 兼容端点根（需规范化是否已含 `/v1`） |
| `model` | 模型名 |
| `apiKey` | 仅主进程配置文件 |
| `timeoutMs` | 默认建议 60000 |
| `maxTokens` | 可选 |

### 后续演进（仅架构留白，本版不实现）

日后可替换为：userData + `safeStorage`、设置页、脱敏 `/ai/settings*`。替换时保持 `CompletionRunner` 只依赖「读配置」抽象（如 `AiConfigProvider.get()`），避免 Capability 感知存储形态。

## 2. Provider

```ts
interface AiProvider {
  kind: AiProviderKind;
  complete(req: ProviderCompleteRequest): Promise<ProviderCompleteResult>;
  // stream?(req): AsyncIterable<ProviderStreamChunk>; // 后续聊天等能力可扩展，本版不实现
}
```

- **首版实现**：`OpenAICompatibleProvider`，`POST {baseUrl}/chat/completions`（原生 `fetch` + zod 校验响应）。
- **注册表**：`AiProviderRegistry` 按 `providerKind` 解析实现。
- 渲染层与 Capability **不得**依赖具体 SDK。

## 3. CompletionRunner

统一补全入口：

```ts
complete(input: {
  capabilityKey: AiCapabilityKey;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  responseFormat: 'json' | 'text';
  schema?: ZodTypeAny; // json 时
  ref?: { type: string; id: string }; // 如 goal；后续可扩 conversation
  temperature?: number;
}): Promise<{ content: string; parsed?: unknown; runId: string }>
```

固定职责：

1. 读取配置；未配置 → `AiErrorCode.NOT_CONFIGURED`
2. 选择 Provider 发起请求（超时 → `TIMEOUT`；HTTP 失败 → `PROVIDER_HTTP`）
3. `json` 模式：解析 + schema 校验；失败则**一次** repair 补全；仍失败 → `INVALID_MODEL_OUTPUT`
4. 写入 `AiRun`（成功/失败）
5. 不解析 Goal/Chat 业务语义

接口形状上预留日后 `stream(...)`（与 `complete` 共用 Provider），**本版不实现 stream、不接 preload 流式通道**。

## 4. PromptRegistry / CapabilityRegistry

- `PromptRegistry`：按 capability key 提供 system/user 模板或构建函数。
- `CapabilityRegistry`：注册 `AiCapability<I,O>`，由 route-controller 或应用服务按 key 调度。

```ts
interface AiCapability<I, O> {
  key: AiCapabilityKey;
  execute(input: I, ctx: CapabilityContext): Promise<O>;
}
```

`CapabilityContext` 提供：`runner`、配置只读视图、run 写入、只读 growth 上下文 builder（或注入的 repository 门面）。

## 5. AiRun（SQLite）

审计与排障实体，注册于 `database.config.ts`。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| capabilityKey | 如 `goal.decompose` |
| status | `pending` / `succeeded` / `failed` |
| providerKind / model / baseUrlHost | 不存 key |
| requestSummary / responseSummary | 截断摘要，控制隐私与体积 |
| errorCode / errorMessage | 失败时 |
| latencyMs | 可选 |
| refType / refId | 如 `goal` + goalId |
| createdAt / finishedAt | 时间戳 |

本版可不做 Runs 列表 UI；**实际打模型**的 decompose 必须写库；缓存命中不新建 AiRun。

## 5.1 AiSuggestionCache（SQLite）

按 Capability + 业务引用缓存最近一次成功结构化结果，避免重复打模型。

| 字段 | 说明 |
| --- | --- |
| capabilityKey / refType / refId | 查找键（如 `goal.decompose` + `goal` + goalId）；一引用一行覆盖写 |
| contextFingerprint | `promptContext` 的 sha256 |
| runId | 生成时的 AiRun id |
| payloadJson | 完整响应 JSON（如 `GoalDecomposeResponseVo`） |

命中条件：指纹一致且未 `forceRefresh`；命中后仍可对建议重算 `conflict`。目录：`service/ai/cache/`。

## 6. 统一错误码

经 IPC 返回稳定 shape（建议 `{ code, message, details? }`），避免仅抛无结构字符串。

| code | 含义 |
| --- | --- |
| `NOT_CONFIGURED` | 主进程配置缺少 baseUrl/model/key |
| `PROVIDER_HTTP` | 上游 HTTP/鉴权错误 |
| `TIMEOUT` | 超时 |
| `INVALID_MODEL_OUTPUT` | JSON/schema 失败 |
| `CONTEXT_NOT_FOUND` | 如 goalId 不存在 |
| `INTERNAL` | 其它 |

## 7. 会话与消息（设计基线）

产品语义参见 ProductWiki · [AI 会话](../../../apps/prototype/product-wiki/ai/session/README.md)。本版交付差异见 [v0.2.0 TDD](../../v0.2.0/TDD.md)。

会话壳复用平台配置、Provider、Runner、AiRun；结构化结果经 Capability 生成后写入消息中的工作台块，由渲染层按类型挂载工作台。

### Conversation

| 字段 | 说明 |
| --- | --- |
| title | 展示标题 |
| refType / refId | 可选业务关联；当前仅 `goal` + goalId |
| updatedAt | 最近消息或状态变更时间 |

### Message

| 字段 | 说明 |
| --- | --- |
| conversationId | 所属会话 |
| role | `user` / `assistant` |
| parts | JSON 数组：文本块与工作台块（工作台块含 `type` 与载荷） |
| createdAt | 创建时间 |

### 约定

- 工作台默认不自动打开；仅用户点选消息中的块后挂载；切换会话关闭工作台。
- 从目标发起：ensure 绑定会话，写入发起消息与含拆解块的助手消息，**不**自动打开工作台。
- 本版工作台类型仅 `goal.decompose`。

### 仍后置（不预埋）

- AI 设置 UI、`safeStorage`、`/ai/settings*`
- preload 流式通道、tool-calling、RAG

## 8. 目录草案（v0.2.0 落地范围）

```
apps/desktop/src/service/ai/
  ai.config.ts           # 写死 baseUrl / model / apiKey 等
  ai.route-controller.ts # decompose + 会话必要路由
  provider/
  completion/
  prompt/
  capability/            # goal-decompose
  cache/                 # ai_suggestion_cache（目标+上下文指纹）
  run/
  context/               # goal-context.builder
  conversation/          # Conversation / Message Entity、Repository、Service
```

主进程注册：`initIpcRouter` 增加 AI route-controller。密钥与网络仅出现在该树内。
