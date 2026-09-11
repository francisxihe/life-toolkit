# AI Platform

```yaml
document_meta:
  status: 'active'
  last_updated: '2026-09-11'
```

参见 [AI 域总览](./README.md)。通用 Desktop 分层不在此复述。

AI 会话与 Workbench 是宿主平台，不是插件。业务通过 `AiContribution` 注入 Capability、MCP 工具、实体解析器和 Agent 指令；渲染层通过 `WorkbenchToolDefinition` 与 `AiEntitySource` 注入展示与跳转。工具必须走 capability registry，不能直接 import capability 单例。协议细节见 [Plugin Platform](../plugin-platform.md)。

## 1. 贡献与注册表

```ts
type AiDomainContribution = {
  capabilities?: AiCapability[];
  tools?: AgentTool[];
  entityResolvers?: EntityResolver[];
  agentInstructions?: string;
};

type AiCapability<I, O> = {
  key: string;
  execute(input: I): Promise<O>;
};
```

- `CapabilityRegistry` / `AgentToolRegistry` / `entityResolverRegistry`：重复 key 抛错；读取未知 key 抛错。
- 主进程在 `initIpcRouter` / MCP 启动前调用 `composeAiPlatform()`。
- MCP `tools/list` 与 `tools/call` 只枚举/执行已注册工具；`AGENTS.md` 由已注册工具名 + 业务 `agentInstructions` 生成。
- 会话绑定通过 entity resolver 校验并命名，不直接 import Goal/Task repository。

兼容入口（调用方切完后可删）：`POST /ai/capabilities/goal/decompose`、`/task/decompose`，以及 `/ai/conversations/bound/goal|task`。规范入口是 `POST /ai/capabilities/:key` 与 `POST /ai/conversations/bound`。

## 2. 运行时

本机编码 Agent（当前为 Codex）按会话准备独立 workspace，经 loopback MCP 调工具。应用级 Agent 选择存在 `runtime/selection-store`；会话可覆盖 `runtimeId`。切换 Agent 会清空该会话原生线程，下一次发送重新开始。

历史 HTTP `CompletionRunner` / `AiProvider` / 设置页密钥不是当前执行路径。结构化结果由 Agent 生成后交给业务 Capability 规范化，再写入助手消息的 workspace 块。

## 3. 缓存

`service/ai/cache/` 的 `AiSuggestionCache` 仍按 `capabilityKey + refType + refId` 覆盖写最近一次成功结构化结果。指纹变化或业务侧 `forceRefresh` 才重新生成。缓存命中不视为一次新的模型调用。

## 4. 统一错误码

经 IPC 返回稳定 shape（`{ code, message, details? }`）。

| code | 含义 |
| --- | --- |
| `NOT_CONFIGURED` | 运行时未配置 |
| `PROVIDER_HTTP` | 上游 HTTP/鉴权错误 |
| `TIMEOUT` | 超时 |
| `INVALID_MODEL_OUTPUT` | JSON/schema 失败 |
| `CONTEXT_NOT_FOUND` | 绑定实体不存在 |
| `AGENT_UNAVAILABLE` / `AGENT_UNAUTHENTICATED` | 本机 Agent 不可用或未登录 |
| `INTERNAL` | 其它 |

## 5. 会话与消息

产品语义参见 ProductWiki · [AI 会话](../../../packages/product-wiki/wiki/ai/session/spec.json)。

### 协议

- `AiWorkspacePartVo.workspaceKey` 为 `string`；`payload` 为 opaque `Record<string, unknown>`。
- 通用实体引用：`{ type, id, label }`。`workspaceEntityRef(payload)` 读取可选 `payload.ref`。
- `PUT /ai/messages/:id/workspace` 用完整 payload 替换当前 workspace 块，不支持字段级 patch。
- 业务载荷 VO（拆解建议、capture 建议）分别放在 Growth / Activity VO，由对应 `parsePayload` 校验。

### Conversation

| 字段 | 说明 |
| --- | --- |
| title | 展示标题 |
| purpose | `chat` / `capture` |
| refType / refId | 可选业务关联（字符串，由 entity resolver 解释） |
| runtimeId | 会话所用编码 Agent |
| pinned / updatedAt | 列表排序 |

### Message

| 字段 | 说明 |
| --- | --- |
| conversationId | 所属会话 |
| role | `user` / `assistant` |
| parts | `text`（可含 entityLinks）/ `tool` / `workspace` |
| createdAt | 创建时间 |

### 渲染桥

- `AiSessionProvider` 注入 `entitySources`：mention、绑定启动、消息实体跳转、会话列表绑定标签均走该列表。
- `createAiWorkspaceHost` 实现 Workbench 的 load/subscribe/patch，内部只调 AI 会话 API。
- 标题、入口文案、auto-open 来自 `WorkbenchToolDefinition`，不在会话组件里按业务 key 分支。

## 6. Workbench 端口

Workbench 只做标签、网页宿主和通用 tool stage：查找 definition、校验 payload、把 host actions 交给业务组件。业务 UI 自行读实体、调领域 API。

网页「收藏到 Library」由 Library 提供 `WorkbenchExtractHandler`，在 composition root 注入；Workbench 核心不 import Library。

## 7. 目录

```
apps/desktop/src/service/ai/
  contribution.ts
  capability/capability.registry.ts
  agent/tools.ts
  entity/entity-resolver.registry.ts
  conversation/
  runtime/                 # Agent 探测、MCP、workspace AGENTS.md
  cache/
  ai.route-controller.ts   # runtime + 会话 + 泛型 capability/bound

apps/desktop/src/main/ai.composition.ts
apps/desktop/src/render/app.composition.ts
apps/desktop/src/render/features/ai/
  context.tsx              # 会话状态与 Workbench 同步桥
  entity-source.ts
  workspace-host.ts
apps/desktop/src/render/features/workbench/
  types.ts                 # WorkbenchToolDefinition / host / registry
  ToolStage.tsx
  context.tsx
```
