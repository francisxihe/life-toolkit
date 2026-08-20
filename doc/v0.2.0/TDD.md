# True North v0.2.0 TDD

## 文档元信息

```yaml
document_meta:
  title: 'True North v0.2.0 TDD'
  version: 'v0.2.0'
  status: 'draft'
  created_date: '2026-08-09'
  last_updated: '2026-08-20'
  owner: 'Growth Squad'
  target_audience: ['frontend_developer', 'desktop_service_developer', 'tester']

scope:
  product_change_source: 'apps/prototype/product-wiki/changelog.json'
  included_modules: ['ai.session', 'growth.goal', 'growth.task', 'ai.platform']
  supplemental_contract: '会话聊天与拆解建议均外包本机编码 Agent CLI（本版仅 ChatGPT.app 内置 codex，展示名 ChatGPT）；应用不自研 agent-loop；领域工具经 loopback MCP（实现仍 tools.ts）；拆解 JSON 由当前会话 Agent 生成、Capability 只校验写入；无 HTTP Provider 生成回退；无设置页；本版不接 Cursor'
```

桌面分层与数据流参见 [TechnicalWiki · 架构](../TechnicalWiki/architecture/overview.md)。AI 平台长期设计参见 [TechnicalWiki · AI](../TechnicalWiki/ai/README.md)。产品规则参见 ProductWiki · [AI 会话](../../apps/prototype/product-wiki/ai/session/README.md)、[目标管理](../../apps/prototype/product-wiki/growth/goal/README.md)、[任务管理](../../apps/prototype/product-wiki/growth/task/README.md)。本版产品范围见 [PRD](./PRD.md)。

TechnicalWiki · [ai/platform](../TechnicalWiki/ai/platform.md) 仍描述「聊天与拆解共用 openai_compatible」。**本版以本文差异为准**（聊天与拆解都走本机 ChatGPT.app，不走 HTTP Provider）；功能确认后再回写 Wiki（保持既有约定，本轮不改 Wiki）。

## 范围追溯

| ProductWiki 变更 | 产品引用与原型 | 当前桌面端现状 | v0.2.0 交付 |
| --- | --- | --- | --- |
| 引入并改版目标 AI 拆解 | `growth.goal.view.ai-decomposition`；`GoalDecomposeWorkspace` | 详情抽屉已迁走；工作台已有 | 绑定会话 + 工作台（Agent 生成建议，Capability 校验写入） |
| 目标建议生成/采纳/追问 | `growth.goal.rule.ai-decompose-*` | 工作台采纳 | 预览草稿、置灰、对已选追问 |
| 引入任务 AI 拆解 | `growth.task.view.ai-decomposition`；`TaskDecomposeWorkspace` | 工作台已有 | `task.decompose` 工作台；建议仅子任务+待办 |
| 任务建议生成/采纳/追问 | `growth.task.rule.ai-decompose-*` | 已落地 Capability | 与目标工作台同一套交互 |
| AI 会话壳 / 分发 | `ai.session.view.*`；`workspace-dispatch` | `/ai` 三栏已有；composer **无** Agent 选择器 | 三栏壳；composer 走本机 Agent；工作台点选后打开 |
| 目标/任务绑定发起 | `goal-bound-start` / `task-bound-start`；`?goalId=` / `?taskId=` | 渲染侧每次新建会话再 `messages/stream`；**未** ensure 已有绑定 | ensure 绑定会话；发起与普通发送同一套所选 Agent；不自动打开工作台 |
| 编码 Agent 选择器 / 切换 | `ai.session.view.agent-picker`、`ai.session.rule.agent-switch`、`selectedAgent` | 探测不到 ChatGPT.app 时灰显「未安装」 | 探测 ChatGPT.app 内置 `codex`；展示名 ChatGPT；本版无 Cursor |
| 会话聊天路径 | `ai.session.view.conversation`（发送依赖当前可用 Agent） | 自研 `agent-loop.ts` + openai_compatible stream + 应用内 tool-calling | **删除** `agent-loop.ts`（实现阶段）；聊天只走本机 CLI；无 HTTP 回退 |

查询变更：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json
```

## 原型评审与决策

- 结论：原型 `/ai` 三栏、工作台分发、composer 上的编码 Agent 选择器可作为**交互与信息架构**指导；本地假回复/假建议**不得**作为正式生成算法。
- 用户已确认原型交互：选择器、未安装灰显、切换后丢上一 Agent 原生线程。下列相关项视为已确认，可写入本版方案。
- 与既有 TDD「助手纯文本 / 非范围 tool-calling」的冲突：**不**把 tool-calling 做成应用内多轮（OpenAI tools + 自研 loop）。采纳「MCP 领域工具 + 工作台块」：Agent 只通过 MCP 调用现有 `tools.ts`；拆解 JSON **由当前会话 ChatGPT 生成并传入** `decompose_*`；Capability **只校验、裁剪、算冲突并写入**工作台块。**禁止** Capability 再调 HTTP Provider；**禁止** MCP 内再 spawn 一次 `codex`。

| 问题与证据 | 方案比较 | 已确认决策 | 风险与后续 |
| --- | --- | --- | --- |
| 抽屉 vs 会话工作台 | A 保留抽屉 / B 会话壳 + 工作台（对齐 ProductWiki） | **B**；桌面现有抽屉视为待迁移差距（主路径已迁） | — |
| 工作台是否默认打开 | A 发起后自动打开最后一块 / B 仅用户点选后打开 | **B**（含从目标/任务发起） | 桌面 `context.tsx` 在 stream `message`/`done` 含 workspace 时仍自动激活，实现阶段须改掉 |
| 生成落点 | A 仅抽屉本地态 / B 写入助手消息 workspace 块 | **B**；MCP `decompose_*` 调 `goal.decompose` / `task.decompose` Capability 后写入块 | 消息 parts 需稳定 schema |
| 会话持久化 | A 仅内存 / B SQLite Conversation + Message | **B**（本版） | 无云同步 |
| 密钥与设置 | A 设置页 / B 配置文件写死 / C 本版不读应用侧密钥 | **C（本版）**；聊天与拆解都不读应用侧密钥 | 无设置页；已删除 HTTP 生成入口（`ai.config` / Provider / CompletionRunner） |
| 会话聊天载体 | A 应用内 openai_compatible stream + 自研 loop / B 本机编码 Agent CLI / C A 作 B 的回退 | **B**；**无** HTTP 聊天回退、**无**自研 loop 回退 | 依赖用户本机已安装并登录的 CLI |
| 领域工具 | A 应用内 tool-calling 多轮 / B 禁止一切工具、助手纯文本 / C loopback MCP + 工作台块 | **C**；实现仍 `apps/desktop/src/service/ai/agent/tools.ts` | MCP 网关须绑定当前 stream 的 persistParts |
| Agent 切换与线程 | A 跨 Agent 续跑同一原生线程 / B 切换后该会话不再续跑上一 Agent 线程 | **B**（用户已确认原型） | 会话存 `runtimeId` + `runtimeThreadId`；切换清空 thread |
| 选择器作用域 | A 仅当前会话 / B 应用级偏好（对齐原型全局 picker） | **B**：应用级 `selectedRuntimeId`；会话另存续跑用的 `runtimeId`/`runtimeThreadId` | 其它会话在下次发送若与偏好不同再开新线程 |
| 本版接入哪些 CLI | A 一次接完原型 fixture 全部 / B 本版只实现 ChatGPT（`codex` 二进制，含 ChatGPT.app） | **B**；展示名 ChatGPT；**不**接 Cursor（编辑器 Agent 不能嵌入会话，也不要求另装 cursor-agent）。原型 `claude-code` 仅演示灰显 | 注册表可后加 def |
| 任务拆解建议类型 | 与目标相同四类 / 仅子任务+待办 | **仅子任务 + 待办** | 原型 fixture 非生成规格 |
| 绑定发起 | 每次新建 / ensure 已有绑定会话 | **ensure**（ProductWiki）；发起与普通发送同一套所选 Agent | 桌面现状每次 `createConversation`，实现阶段对齐 |
| 编辑与采纳 / 对已选追问 | 见既有确认 | **编辑写回预览；采纳读预览；追问预填后走同一发送路径** | 发送路径改为本机 Agent，不自动打开工作台 |
| 流式 | 会话文本流式 / 拆解 REST | **会话**由 CLI JSONL 映射到现有 `ai.conversation.stream`；拆解建议随 MCP 写入工作台块，**非**独立 HTTP 流式 | preload 频道不变 |

未确认的阻断项：无（用户已确认原型交互；与旧 TDD 的 tool-calling 冲突已按上表收敛）。

## 现状与差距

| 能力 | 现状 | 目标 |
| --- | --- | --- |
| AI 配置 / Provider / Runner / AiRun / 缓存 | 已落地；拆解曾调 Runner.complete | **已删除** HTTP 生成入口（`ai.config` / Provider / CompletionRunner）；AiRun / cache 仍保留 |
| Goal / Task decompose Capability | 已落地（HTTP 生成 JSON） | 改为校验 Agent 传入的建议并写入工作台；仅经 MCP `decompose_*` |
| 自研 `agent-loop.ts` | `conversation.service` 调用 `runAgentLoop` | **实现阶段删除**该文件及对它的依赖；禁止再接应用内多轮 tool-calling |
| `tools.ts` | 作为 OpenAI tools 给 loop 用 | 改为 MCP 网关执行层；工具名与语义不变 |
| AI 会话壳 | `/ai` 三栏；无 picker | composer 对齐原型选择器 |
| Conversation | 实体目前仅 `title`（`refType`/`refId` 曾被迁移走） | 恢复 `refType`/`refId`；新增 `runtimeId`、`runtimeThreadId` |
| 目标/任务绑定发起 | 渲染侧新建 + stream；可能自动打开工作台 | ensure 绑定；同一套 Agent；**不**自动打开工作台 |
| Settings UI | 无 | **本版不做** |
| 会话 stream | 有，但源是自研 loop | **本版做**：源改为本机 Agent；IPC 路径仍 `POST .../messages/stream` |
| 本机 Agent Runtime | 无 | 注册表 + PATH 探测 + 鉴权探测 + 隔离工作区 spawn |

## 技术设计

### 分层与文件职责

长期目录与抽象见 [TechnicalWiki · ai/platform](../TechnicalWiki/ai/platform.md)。本版必须落地（相对 Wiki：**聊天与拆解都改走 Runtime / 本机 ChatGPT，不走 openai_compatible 生成**）：

| 层 | 路径 / 职责 |
| --- | --- |
| Enum / VO | 既有 AI enum 增 `AGENT_UNAVAILABLE`、`AGENT_UNAUTHENTICATED`；Conversation 增 runtime 字段；Runtime Agent 列表/选择 VO；Goal/Task Decompose 保持 |
| web-service | 既有 `controller/ai.ts`；新增 agents 列表与选择 client |
| main IPC | 既有 `ai.route-controller.ts`；Runtime 探测与选择路由；发送仍 `webContents.send('ai.conversation.stream')` |
| Platform | 保留 capability/context/cache（拆解校验写入）；**已删除** HTTP 生成入口（`ai.config` / Provider / CompletionRunner）；AiRun 仍保留、本版不调用；新增 `runtime/`（注册表、探测、spawn、JSONL 适配）；`conversation/` 改为调 Runtime；`agent/tools.ts` 给 MCP 网关用；**删除** `agent/agent-loop.ts` |
| MCP | 主进程 loopback 网关（本机 `127.0.0.1`），把 `tools.ts` 暴露为 MCP tools |
| Render | `/ai` 会话页 composer 增加 Agent 选择器；工作台 registry 不变；**禁止**因 workspace 块自动打开右侧 |

Growth Goal/Task CRUD **不**新增 AI 生成路由。Agent **不得**直接写 Growth 实体（采纳仍走现有 Growth IPC）。

Conversation.`refType` 支持 `goal` \| `task`。工作台块类型：`goal.decompose`、`task.decompose`。

### 聊天 vs 拆解（本版冻结）

| 路径 | 实现 | 配置 |
| --- | --- | --- |
| 会话普通发送、「对已选追问」后发送、绑定发起后的首轮助手回复 | 本机编码 Agent CLI（Runtime） | 用户本机 CLI 安装 + 登录；HTTP 生成入口已删 |
| `goal.decompose` / `task.decompose` | 当前会话 ChatGPT 生成建议 JSON，经 MCP 传入；Capability 校验/裁剪/冲突后写入工作台块 | 与聊天同一套 Agent；**不**调 HTTP Provider（入口已删） |

聊天与拆解均 **无** HTTP Provider 回退。未安装或未登录所选 Agent 时发送失败，提示原因，不改走 DeepSeek/兼容端点。Capability **禁止**内部再 spawn `codex`。

### Runtime 注册表

主进程 `RuntimeAgentDef` 注册表。**本版只实现一条**：

| id（`runtimeId`） | 展示名 | 探测二进制（按序） |
| --- | --- | --- |
| `codex` | ChatGPT | `codex`（含 ChatGPT.app 内置路径） |

其它 CLI 只加 def + 探测/spawn 适配即可进入列表。**本版不实现** Cursor Agent、Claude Code。原型 fixture 中的 Claude Code 仅演示灰显。

**PATH**：打包后的 Electron GUI **没有**用户 shell 的 PATH。探测顺序：

1. `process.env.PATH` 中的 `which`/`where` 语义查找
2. 常见绝对路径（macOS/Linux 至少）：`/usr/local/bin`、`/opt/homebrew/bin`、`/Applications/ChatGPT.app/Contents/Resources`、`$HOME/Applications/ChatGPT.app/Contents/Resources`、`$HOME/.local/bin`、`$HOME/.npm-global/bin`、`$HOME/.cursor/bin`、`$HOME/.codex/bin`；Windows 实现阶段补常见安装根
3. 命中后缓存 resolved 可执行文件路径，供 spawn 使用（不要依赖 `shell: true`）

**鉴权探测**（本机已安装后）：

- ChatGPT：对解析到的 `codex` 二进制执行 `codex login status`（官方：有本地凭证则 exit 0）。只判断「是否存了凭证」，不做联网校验。

`available` = 已安装 **且** 已登录。未安装原因「未安装 ChatGPT」；已安装未登录原因「未登录」。

### CLI argv（本版冻结）

隔离工作区：每次/每会话在 `userData` 下使用专用目录（**不是**用户主目录、也不是本仓库）。目录内写入仅含 True North loopback MCP 的配置，避免改用户全局 `~/.codex/config.toml`。

**ChatGPT / 内置 `codex`**：argv 形状对齐 [Open Design Codex `buildArgs`](https://github.com/nexu-io/open-design/blob/6b90486c/apps/daemon/src/runtimes/defs/codex.ts)，并对照官方 [Non-interactive mode](https://developers.openai.com/codex/noninteractive)。**只抄 argv**，不把 MCP 装进用户全局 `~/.codex`。

darwin / 有 Seatbelt 的 macOS：

- 新线程：`codex exec --json --skip-git-repo-check --sandbox workspace-write -c sandbox_workspace_write.network_access=true -c approval_policy="never"`
- 续跑：`codex exec resume --json --skip-git-repo-check -c sandbox_mode="workspace-write" -c sandbox_workspace_write.network_access=true -c approval_policy="never" <SESSION_ID>`
  - `<SESSION_ID>` 必须在所有 flag **之后**
  - **禁止**在 resume 上传 `--sandbox`、`-C`、`--add-dir`（CLI 会直接拒绝）

win32 / WSL：新线程 `--sandbox danger-full-access`；续跑 `-c sandbox_mode="danger-full-access"`（Windows 上 `workspace-write` 会拦 shell）。exec / resume 同样带 `-c approval_policy="never"`。

其它冻结项：

- **prompt 只走 stdin**。argv **禁止**裸 `-`（新 CLI：`unexpected argument '-'`）
- **禁止** `--full-auto`（已废弃）
- **禁止** `--dangerously-bypass-approvals-and-sandbox`
- **禁止** `--last`（会误续其它会话）
- `--skip-git-repo-check` 仅当本机 `codex exec --help` 已列出时才加；没有的 flag 不准发明
- cwd = 隔离工作区（spawn `cwd`，不传 `-C`）
- `network_access=true` 是 loopback MCP 的必要条件：`workspace-write` 默认断网，否则会把 `127.0.0.1` 当出站请求并等人批准，无 TTY 则取消
- `approval_policy="never"` 与 sandbox **组合**（官方非交互口径），用 `-c` 盖掉从用户 `~/.codex/config.toml` 拷来的 GUI `on-request`。无 TTY 时 MCP 审批走 prompt 会被自动 cancel
- stdout 为 JSONL。从 `thread.started` 取出线程 id，写入 `Conversation.runtimeThreadId`（具体 JSON 字段名对照当前 CLI）
- MCP：隔离目录 `.codex/config.toml` 配 streamable HTTP `url` 指向 loopback 网关，并写 `default_tools_approval_mode = "approve"`。`tools/list` 对 `search_*` / `get_*` 带 `annotations.readOnlyHint = true`；`decompose_*` 不加（会写工作台草稿）

取消生成：杀掉对应 child process，并走现有 `POST .../streams/:streamId/cancel`。

### Loopback MCP 网关

- 主进程在本机环回地址起 MCP（streamable HTTP）。仅本机、仅当前应用生命周期。
- 工具集合 = 现有 `tools.ts`：`search_goals`、`search_tasks`、`get_goal`、`get_task`、`decompose_goal`、`decompose_task`。
- `decompose_*` 调用 Capability，把工作台块 `append` 到**当前 stream 的助手消息**，并 `emitChatStreamEvent({ event: 'message' })`。Agent **必须**先读上下文再传入 `suggestions`（及可选 `analysisSummary`）；不要只输出文本列表。Capability 拒绝空建议或非法 kind。
- 网关执行域工具时可写入 `type: 'tool'` parts（running/done/error），这是 MCP 执行观测，**不是**应用内 OpenAI tool-calling 循环。
- 隔离工作区可放极短 `AGENTS.md`：只通过 MCP 读写 Growth；创建实体由用户在工作台采纳；拆解必须调用 `decompose_*` 并传入建议。

### 数据模型（本版冻结）

**应用级编码 Agent 偏好**（非设置页；`userData` 小文件即可）：`selectedRuntimeId`。对应 ProductWiki · `selectedAgent`（产品字段是展示名；实现存 `runtimeId`，列表 VO 带 `name`）。

**Conversation（SQLite）**：`title`、`refType?`（`goal` \| `task`）、`refId?`、`runtimeId?`、`runtimeThreadId?`、`updatedAt`。

- `runtimeId` / `runtimeThreadId`：该会话上次实际发送所用的本机 Agent 及其原生线程。切换 Agent（偏好与会话 `runtimeId` 不同，或对当前会话 PATCH runtime）时 **清空** `runtimeThreadId`，**不改**已有消息。
- 发送：始终用**当前应用偏好**且 `available` 的 Agent。若 `conversation.runtimeId === 偏好` 且存在 `runtimeThreadId` → resume；否则新线程，写回 `runtimeId`/`runtimeThreadId`。

**Message（SQLite）**：`conversationId`、`role`（`user` \| `assistant`）、`parts`（JSON：文本块 + 工作台块 + 可选 tool 块）、`createdAt`。

工作台块至少含：`type: 'workspace'`、`workspaceKey`（`goal.decompose` \| `task.decompose`）、载荷（`runId`、`analysisSummary`、`suggestions`——含 `accepted?` 与用户编辑后的预览草稿、`ref`）。预览草稿写回后，采纳与「对已选追问」均读当前预览。

**AiRun / AiSuggestionCache**：HTTP 生成入口已删；不强制写 Provider 形态的 AiRun（实体仍保留）。缓存可命中则跳过要求 Agent 重传；未命中不得回退 HTTP。聊天若写审计不得带 `apiKey`。

**不做：** settings 持久化 UI、safeStorage、本地启发式建议、把用户全局 MCP 配置改成 True North 专用。

### IPC 与 VO（本版必须实现）

| 方法 | 路径 | 请求 / 响应 |
| --- | --- | --- |
| POST | `/ai/capabilities/goal/decompose` | `GoalDecomposeRequestVo`（`goalId` + `suggestions` + 可选 `analysisSummary`）→ `GoalDecomposeResponseVo`；**非**生成主路径，渲染层不调用 |
| POST | `/ai/capabilities/task/decompose` | `{ taskId; suggestions; analysisSummary? }` → 同构响应（建议仅 task/todo） |
| GET | `/ai/conversations` | → `ConversationVo[]`（updatedAt desc；含 `refType`/`refId`/`runtimeId`，**不含**敏感线程细节以外的密钥） |
| POST | `/ai/conversations` | `{ title? }` → `ConversationVo` |
| GET | `/ai/conversations/:id/messages` | → `MessageVo[]`（createdAt asc） |
| POST | `/ai/conversations/:id/messages/stream` | `{ text }` → `{ user, assistant, streamId }`；后续 `ai.conversation.stream` 推送 delta/done/error（及 MCP 写入后的 `message`） |
| POST | `/ai/conversations/streams/:streamId/cancel` | → `{ ok: true }` |
| POST | `/ai/conversations/bound/goal` | `{ goalId }` → `{ conversation, created }`（ensure，不自动发消息） |
| POST | `/ai/conversations/bound/task` | `{ taskId }` → `{ conversation, created }` |
| PATCH | `/ai/conversations/:id/runtime` | `{ runtimeId }` → `ConversationVo`；若与原 `runtimeId` 不同则清空 `runtimeThreadId` |
| PATCH | `/ai/messages/:id/workspace` | `{ suggestions; analysisSummary? }` → `MessageVo` |
| GET | `/ai/runtime/agents` | → `RuntimeAgentVo[]`（`id`、`name`、`available`、`authenticated`、`unavailableReason?`） |
| GET | `/ai/runtime/selection` | → `{ runtimeId: string \| null }` |
| PUT | `/ai/runtime/selection` | `{ runtimeId }` → `{ runtimeId }`（写应用偏好；不改消息） |

`RuntimeAgentVo`：`id`、`name`（展示名）、`available`、`authenticated`、`unavailableReason?`。`available` 为 false 时必须有原因。

流式事件 payload 保持：`{ streamId, event: 'delta'|'message'|'done'|'error', delta?, message?, code?, messageText? }`。频道：`ai.conversation.stream`。**不**提供非流式 `POST .../messages` 主路径。流式事件不得携带 `apiKey` 或 CLI 鉴权材料。

列表默认选中：已保存偏好且仍 `available` 则用之；否则注册表中第一个 `available` 项。没有可用项时允许选中但 `canSend=false`。

`AiSuggestionVo` 等见 [capabilities.md](../TechnicalWiki/ai/capabilities.md)。

错误统一：`{ code, message, details? }`。

| code | 何时 |
| --- | --- |
| `AGENT_UNAVAILABLE` | 未安装，或当前选择不可用（含「没有可用 Agent」）；拆解与聊天同一套 |
| `AGENT_UNAUTHENTICATED` | 已安装但未登录 |
| `NOT_CONFIGURED` | **本版不用于拆解**（HTTP 配置已删）；保留枚举以免旧调用误报 |
| `PROVIDER_HTTP` / `TIMEOUT` / `INVALID_MODEL_OUTPUT` | **本版拆解不走 Provider**；保留枚举 |
| `CONTEXT_NOT_FOUND` | goal/task 不存在 |
| `INTERNAL` | 其它（含 CLI 非零退出、建议 JSON 校验失败且无法归入上列） |

发送不得把 Agent 未安装报成 `NOT_CONFIGURED`。拆解缺建议或 schema 不合法时把错误回给 Agent 重试，不回退 HTTP。

### Goal / Task Decompose 实现要点

参见 [capabilities · goal.decompose](../TechnicalWiki/ai/capabilities.md)。本版参数冻结：

| 项 | 值 |
| --- | --- |
| 上下文子目标 / 任务 / 待办 / 习惯摘要上限 | 各 20 |
| 建议总量上限 | 8 |
| 每类上限 | 2 |
| JSON 失败 | 工具入参校验失败则返回错误，由 Agent 改一次；应用**不**再 HTTP repair |
| 冲突（goal） | 直接子目标标题包含关系或规范化后相等 → `conflict` |
| 冲突（task） | 直接子任务标题近重复 → `conflict` |
| 主进程创建实体 | **禁止**（含禁止 Agent 经 MCP 以外的方式创建） |
| 建议缓存 | 可选：同一 ref + 上下文指纹命中可直接返回；未命中要求 Agent 传入 `suggestions`，**不**打 HTTP |
| forceRefresh | **本版不做**工作台强制刷新按钮；绑定发起不另走 HTTP |
| 本地启发式 | **不做** |
| task 建议 kind | **仅** `task` / `todo` |

### 前端：AI 会话与工作台

- 路由 `/ai`：三栏壳；无选中会话时中间/右侧空态，**仍展示** Agent 选择器（对齐原型）。
- 选择器：`Select` 展示 `name`；`!available` 禁用并在 label 中说明原因；切换 → `PUT /ai/runtime/selection`，若有当前会话再 `PATCH .../runtime`（清空该会话 thread）。可提示「之后的发送将由某某重新开始」。
- composer 发送走 `POST .../messages/stream`；所选 Agent 不可用时禁用发送。
- 目标详情「AI 拆解」→ `/ai?goalId=…`；任务详情「AI 拆解」→ `/ai?taskId=…`。
- 绑定发起：`POST bound/goal|task` → 已有则打开且**不**自动再发；新建则用当前可用 Agent `messages/stream`（文案「请帮我拆解」+ entityLinks）。**不**自动激活工作台。Agent 经 MCP 调用 `decompose_*`（传入建议）写入块。
- 点选工作台块 → `WorkspaceHost` 按 `goal.decompose` / `task.decompose` 挂载。stream 出现 workspace **不得**自动打开。
- **编辑 / 采纳 / 对已选追问**：目标与任务工作台同一套；任务建议仅 `task`/`todo`；追问仅预填，发送后同一 Agent 路径。
- 目标采纳字段：goal `parentId`；task `goalId`；todo `relatedType=GOAL` + `relatedId`；habit `goalIds`。
- 任务采纳字段：子任务 `parentId=当前任务` + `goalId`；待办 `relatedType=TASK` + `relatedId`。
- 切换会话：关闭右侧工作台；picker 保持应用级偏好（对齐原型）。

### 与代码生成流程

- 新增 `*.route-controller.ts` 方法后走仓库既有 sync/生成。
- 不得手改生成接口定义文件。

## 实施顺序与验收

阶段 3 实现顺序（本文不开始实现）：

1. VO/Enum：`RuntimeAgentVo`、选择 VO、Conversation 的 `refType`/`refId`/`runtimeId`/`runtimeThreadId`、错误码；web-service client。
2. `RuntimeAgentDef` 注册表 + PATH/鉴权探测 + `GET/PUT /ai/runtime/*`；应用级偏好落盘。
3. 恢复/补齐 Conversation `refType`/`refId` 与 `POST .../bound/goal|task`（ensure）。
4. Loopback MCP 网关包装 `tools.ts`，绑定当前 stream 的 persistParts。
5. ChatGPT（内置 `codex`）spawn 适配（stdin + `--json` + resume + 隔离目录 MCP）；JSONL → 现有 stream 事件；会话写入 `runtimeThreadId`。
6. `conversation.service` 停止调用 `runAgentLoop`；发送改走 Runtime；**删除** `apps/desktop/src/service/ai/agent/agent-loop.ts`。
7. Render：Agent 选择器（展示名 ChatGPT）、灰显、切换提示、不可用禁发；绑定发起对齐 ensure；去掉 workspace 自动打开。
8. 错误码与 `parse-ai-error` 文案；联调：切换丢线程、HTTP 生成入口已删、无 HTTP 聊天/拆解回退。

| 场景 | 验收结果 |
| --- | --- |
| 从目标发起 | ensure 绑定会话；有目标拆解块（经 MCP+Capability）；右侧默认空；所用 Agent 与 picker 一致 |
| 从任务发起 | 同上；建议仅为子任务/待办 |
| Agent 选择器 | 列出本机探测结果；本版仅 ChatGPT；未安装 ChatGPT / 未登录禁用并说明原因 |
| 切换 Agent | 已有消息不变；不自动打开工作台；当前会话不再 resume 上一 `runtimeThreadId` |
| 点选工作台块 | 右侧挂载对应拆解工作台 |
| 切换会话 | 右侧关闭；picker 仍为应用偏好 |
| 编辑保存 | 不创建实体；预览更新；刷新仍见预览 |
| 采纳后 | 「已采纳」+ 预览置灰；刷新仍置灰 |
| 对已选追问 / 普通发送 | 预填或手输后发送 → 当前可用 Agent 流式回复；不自动打开工作台 |
| 流式 | 助手气泡随 delta 增长；done 后落库可刷新一致；cancel 可停 |
| Agent 失败 | 未安装 `AGENT_UNAVAILABLE`；未登录 `AGENT_UNAUTHENTICATED`；**不**回退 HTTP 聊天 |
| 拆解失败 | ChatGPT 不可用时与聊天相同（`AGENT_UNAVAILABLE` / `AGENT_UNAUTHENTICATED`）；建议 JSON 不合法则工具报错、不回退 HTTP |
| 无详情抽屉 | 目标/任务详情不再打开拆解抽屉 |
| 设置页 | **不存在** |

验证命令：

```bash
pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json
pnpm --filter true-north-prototype product-wiki:check
```

## 非范围

- AI 设置 UI、`/ai/settings*`、safeStorage
- **拆解 Capability 流式**、RAG、HTTP Provider 生成拆解（本版 Capability 不调 openai_compatible）
- 应用内 OpenAI tool-calling 多轮、自研 `agent-loop` 回退、HTTP 聊天回退
- 一次接完所有编码 CLI（含 Cursor Agent、原型 fixture 的 Claude Code）
- Agent 插件反向集成（让外部插件驱动本应用）
- 让 Agent 直接写 Growth 实体
- 工作台/任务/待办页其它 AI 入口
- 会话页能力专用工具栏（如顶栏「重新生成拆解」）
- 本地启发式假建议
- 自动更新 ProductWiki / TechnicalWiki（功能完成并确认后再做）

## 相关文档

- [PRD](./PRD.md)
- [TechnicalWiki · AI](../TechnicalWiki/ai/README.md)
- [TechnicalWiki · Goal](../TechnicalWiki/growth/goal.md)
- [ProductWiki · AI 会话](../../apps/prototype/product-wiki/ai/session/README.md)
- [ProductWiki · 目标管理](../../apps/prototype/product-wiki/growth/goal/README.md)
- [ProductWiki · 任务管理](../../apps/prototype/product-wiki/growth/task/README.md)
- Codex CLI（ChatGPT.app 内置）：[Non-interactive mode](https://developers.openai.com/codex/noninteractive)、[MCP](https://developers.openai.com/codex/mcp)
