# AI 技术域

```yaml
document_meta:
  title: 'AI TechnicalWiki'
  status: 'active'
  last_updated: '2026-09-11'
```

> AI 是可注入的宿主平台：负责会话、本机 Agent 运行时、工具调度，以及把工作台块交给 Workbench。Growth、Activity 等业务域显式贡献 Capability、Agent 工具、实体解析器和 Workbench 工具 UI。产品语义见 ProductWiki；本版交付差异见 [v0.2.0 TDD](../../v0.2.0/TDD.md)。

## 定位与边界

| 负责 | 不负责 |
| --- | --- |
| 会话 / 消息持久化、流式通道、绑定会话 | Goal/Task/Todo 等业务 CRUD 与校验 |
| 泛型 Capability / AgentTool / EntityResolver 注册表 | 封闭的业务枚举（`goal.decompose` 等常量归各业务） |
| 本机编码 Agent 探测、MCP loopback、从注册表生成 Agent 指令 | 在 `service/ai` 内实现拆解/收集业务逻辑 |
| 通用 workspace 消息块（`workspaceKey: string` + opaque payload） | 工作台 UI、标题、入口文案、自动打开策略 |
| 把工作台写回请求转成完整 payload 替换 | 跨域采纳事务（由 Activity 编排） |

依赖方向：业务贡献 → AI 契约/注册表 → 通用消息块 → 会话桥 → Workbench 端口 → 业务工具 UI。

普通会话输入自动识别记录意图，需要落库时由 Activity 贡献的 `capture_activity` 产出 `activity.capture` workspace；已有 `purpose: capture` 会话只当普通历史读取。目标/任务拆解由 Growth 贡献。**生成**走业务 Capability；**采纳**走领域 Service，多意图采纳由 Activity 事务编排。自动打开策略由 Workbench 工具定义提供：绑定拆解发起带 `force`；`activity.capture` 仅在 `capture_activity` 工具 `done` 时打开。普通聊天、追问和切换 Agent 不自动打开。

## 文档导航

| 文档 | 说明 |
| --- | --- |
| [platform.md](./platform.md) | 注册表、会话协议、运行时、composition root、扩展规范 |
| [capabilities.md](./capabilities.md) | 现有业务能力的归属、IPC 与工作台约定 |

## 代码落点

```
packages/business/enum/ai/                 # 会话 purpose、错误码、消息角色
packages/business/vo/ai/                   # 通用 Conversation / Message / workspace 协议
packages/business/web-service/             # 泛型 executeCapability / ensureBoundConversation；旧路径兼容代理
apps/desktop/src/service/ai/               # 注册表、会话、运行时、MCP；不含业务 Capability 实现
apps/desktop/src/main/ai.composition.ts    # 显式装配 Growth / Activity 贡献与 capture 适配器
apps/desktop/src/render/features/ai/       # 会话壳、entity source、workspace host
apps/desktop/src/render/app.composition.ts # 显式汇总 Workbench 工具与实体源
apps/desktop/src/render/features/workbench/# 通用标签宿主；不 import 业务实现
```

业务实现不在 AI 目录：

```
apps/desktop/src/service/growth/ai/        # 拆解 Capability、MCP 工具、实体 resolver
apps/desktop/src/service/activity/ai/      # capture Capability 与工具
apps/desktop/src/render/features/growth/workbench/ai-decomposition/
apps/desktop/src/render/features/activity/workbench/
```

分层与 IPC 注册约定参见 [desktop-layers](../architecture/desktop-layers.md)、[controller-desktop](../development/controller/controller-desktop.md)。

## 扩展原则

1. **显式 composition root**——在 `main/ai.composition.ts` / `render/app.composition.ts` 装配贡献，禁止 import 副作用注册。
2. **注册表立即失败**——重复 key、未知 key、非法 payload 抛错，不静默覆盖。
3. **业务实体创建不进 Agent 工具**——生成与采纳分离；创建由用户在工作台确认。
4. **新能力写在业务域**：Capability + Agent 工具 +（如需）实体 resolver + Workbench `WorkbenchToolDefinition`，再在 composition root 注入。
5. **REST IPC 承载请求-响应**；流式走独立 preload 通道 `AI_CONVERSATION_STREAM_CHANNEL`。
6. **workspaceKey 字符串保持稳定**——已持久化的 `goal.decompose`、`task.decompose`、`activity.capture` 不得改名。
