# AI 技术域

```yaml
document_meta:
  title: 'AI TechnicalWiki'
  status: 'design'
  last_updated: '2026-08-09'
  note: '设计基线草稿；实现入库后与代码对齐并可将 status 调整为 active'
```

> AI 是横切平台域：提供模型配置读取、补全调用、能力（Capability）编排与运行审计。Growth 等业务域通过 Capability 消费 AI，不在业务 Service 内直接请求模型。产品语义见 ProductWiki；本版交付差异见 [v0.2.0 TDD](../../v0.2.0/TDD.md)。

## 定位与边界

| 负责 | 不负责 |
| --- | --- |
| Provider 适配、CompletionRunner、Prompt/Capability 注册、主进程配置读取、AiRun | Goal/Task/Todo/Habit 的业务 CRUD 与校验 |
| 结构化补全、统一错误码 | 云端代理、向量检索、多租户计费 |
| 密钥仅存主进程配置 | 渲染进程持有或经 IPC 回传明文 API Key |
| 架构上可扩展后续聊天等 Capability | **本版不实现**聊天（含表、IPC、UI、半成品目录） |

与 Growth 的关系：目标 AI 拆解的**生成**在 AI 域完成；**采纳创建**仍走现有 Growth IPC/Service。参见 [growth/goal.md](../growth/goal.md)。

## 文档导航

| 文档 | 说明 |
| --- | --- |
| [platform.md](./platform.md) | 配置、Provider、Runner、Prompt、Capability、AiRun、错误码；聊天仅留白 |
| [capabilities.md](./capabilities.md) | `goal.decompose` 契约；后续 Capability 留白说明 |

## 代码落点（v0.2.0）

```
packages/business/enum/…          # AiProviderKind、AiRunStatus、AiCapabilityKey…
packages/business/vo/ai/          # Run / GoalDecompose（本版无需 Settings/Conversation VO）
packages/business/web-service/    # controller/ai.ts（decompose）
apps/desktop/src/service/ai/      # ai.config.ts、route-controller、provider、completion、prompt、capability、run、context
apps/desktop/src/main/ipc-handlers.ts
apps/desktop/src/service/db/database.config.ts  # 仅注册 AiRun（本版）
```

分层与 IPC 注册约定参见 [desktop-layers](../architecture/desktop-layers.md)、[controller-desktop](../development/controller/controller-desktop.md)。

## 扩展原则

1. **Capability 不直连网络**——只通过 `CompletionRunner`。
2. **业务实体创建不进 Provider**——生成与采纳分离。
3. **新能力（如 chat）只新增 Capability + 所需持久化/UI**，不复制配置读取与 Runner。
4. **REST IPC 承载请求-响应**；若未来需要流式，再增加独立 preload 通道，不破坏现有 `electron-ipc-restful`。
5. **留白不等于预埋代码**——未立项能力只写在文档约束里，不建空表/空目录。
