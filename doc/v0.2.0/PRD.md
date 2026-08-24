# True North v0.2.0 PRD

> 版本定位：交付三栏 AI 会话壳；目标与任务「AI 拆解」均由详情发起绑定会话，在右侧工作台审阅采纳；会话普通聊天、「对已选追问」与拆解建议生成均走本机编码 Agent（对话区可切换；未安装或未登录说明原因）；拆解工作台块为非流式结构化结果。本版**不交付** AI 设置页。本 PRD 仅描述相对 ProductWiki 的本版本产品差异。

---

## 1. 背景与目标

```yaml
product_meta:
  name: 'AI 会话与目标/任务拆解工作台'
  version: 'v0.2.0'
  priority: 'high'
  complexity: 'complex'
  business_value: '用户可在统一 AI 会话中用本机编码 Agent 继续对话，并从目标或任务发起拆解、审阅并采纳建议'
  target_users: ['个人规划者']
  related_features:
    - 'ai.session.view.shell'
    - 'ai.session.view.session-list'
    - 'ai.session.view.conversation'
    - 'ai.session.view.workspace-host'
    - 'ai.session.view.agent-picker'
    - 'ai.session.rule.workspace-dispatch'
    - 'ai.session.rule.goal-bound-start'
    - 'ai.session.rule.task-bound-start'
    - 'ai.session.rule.agent-switch'
    - 'ai.session.field.agent-preference.selectedAgent'
    - 'growth.goal.view.ai-decomposition'
    - 'growth.goal.rule.ai-decompose-generation'
    - 'growth.goal.rule.ai-decompose-adopt'
    - 'growth.goal.rule.ai-decompose-followup'
    - 'growth.task.view.ai-decomposition'
    - 'growth.task.rule.ai-decompose-generation'
    - 'growth.task.rule.ai-decompose-adopt'
    - 'growth.task.rule.ai-decompose-followup'
  tags: ['ai', 'session', 'goal', 'task', 'decompose', 'streaming', 'coding-agent']
```

| 项目背景 | 核心目标 |
| --- | --- |
| 产品已从「详情抽屉拆解」演进为「业务页只发起、会话页审阅」；会话聊天与拆解建议均改为本机编码 Agent，不再要求用户在应用内配置模型密钥。 | 1) 交付三栏 AI 会话壳；2) 从目标/任务发起绑定会话并产出拆解工作台块；3) 工作台内用当前 Agent 生成的建议完成采纳；4) 会话文本与拆解生成走当前选用且可用的本机 Agent；5) 可在对话区切换 Agent；6) 无 AI 设置页。 |

参见 ProductWiki · [AI 会话](../../packages/product-wiki/wiki/ai/session/spec.json)、[目标管理 · AI 拆解](../../packages/product-wiki/wiki/growth/goal/spec.json)、[任务管理 · AI 拆解](../../packages/product-wiki/wiki/growth/task/spec.json)。

---

## 2. 用户与场景

| 角色 | 需求 | 场景 |
| --- | --- | --- |
| 个人规划者 | 用 AI 把抽象目标拆成可执行行动 | 在目标详情点「AI 拆解」，进入绑定会话；点选工作台块后审阅并采纳 |
| 个人规划者 | 用 AI 把任务拆成子任务与待办 | 在任务详情点「AI 拆解」，进入绑定会话；点选工作台块后审阅并采纳 |
| 个人规划者 | 回顾历史协助并继续追问 | 在 `/ai` 浏览会话、发送追问；或在拆解工作台勾选建议后「对已选追问」预填再发送（与普通发送同一套当前 Agent；不自动打开工作台） |
| 个人规划者 | 选用本机已安装的编码 Agent | 在对话区切换 Agent；未安装或未登录项不可选并看到原因；切换后之后的发送作为新的开始 |

说明：本版**没有**独立 AI 设置页。聊天与拆解是否可用都取决于本机编码 Agent 是否安装并登录。用户只感知失败原因，不管理密钥。

---

## 3. 功能范围

| 模块 | 范围内 | 非范围 |
| --- | --- | --- |
| AI 会话壳 | 三栏：会话列表、对话、可插拔工作台容器；新建/切换会话；`refType` 支持 goal/task | 能力专用工具栏（如「重新生成拆解」挂在会话顶栏） |
| 编码 Agent | 对话区选择器；本版 ChatGPT（本机已安装 ChatGPT 应用并登录）；未安装/未登录灰显并说明原因；切换只影响之后发送 | 一次接完所有第三方 CLI（含 Cursor）；独立 AI 设置页；聊天或拆解在 Agent 不可用时回退到应用内在线模型；要求用户另装 cursor-agent |
| 会话聊天 | 普通发送与「对已选追问」后发送走同一套所选 Agent；不自动改写/打开工作台 | 拆解 Capability 流式、应用内多轮 tool-calling、RAG |
| 工作台 | 用户点选消息中的结构化块后挂载；切换会话关闭；支持 `goal.decompose` / `task.decompose` | 默认自动打开最后一块工作台 |
| 目标 AI 拆解 | 详情入口发起绑定会话；建议类型：子目标/任务/待办/习惯；编辑写回预览、采纳置灰、对已选追问 | 目标详情独立拆解抽屉 |
| 任务 AI 拆解 | 详情入口发起绑定会话；建议类型：**仅子任务 + 待办**；同一套编辑/采纳/追问交互 | 产出子目标或习惯；任务列表页独立 AI 入口；让 Agent 直接写入 Growth 实体 |
| 模型接入（对用户不可见） | 聊天与拆解都走本机 ChatGPT；失败有明确原因 | AI 设置 UI、密钥管理、连通性探测页、应用内 HTTP 模型回退 |

---

## 4. 详细需求

### 4.1 AI 会话壳

参见 ProductWiki · `ai.session.view.shell` / `session-list` / `conversation` / `workspace-host`。

1. **壳层**：左侧会话列表、中间对话、右侧工作台容器。
2. **会话列表**：展示标题、可选绑定目标或任务名、最近更新时间；支持新建无绑定会话与切换；当前会话高亮。
3. **对话**：按时间展示用户/助手消息；文本块与可点击的工作台块；底部可追问；也可由工作台「对已选追问」预填输入框；助手文本**流式**增长。发送依赖当前选中且可用的编码 Agent。
4. **工作台容器**：默认空态；仅用户显式点选后挂载；切换会话关闭。

### 4.2 编码 Agent 选择器与切换

参见 ProductWiki · `ai.session.view.agent-picker`、`ai.session.rule.agent-switch`、字段 `selectedAgent`。

1. **选择器**：位于对话区（含无选中会话的空态）。展示名为当前选用项。本版为 ChatGPT（本机 ChatGPT 应用）；列表可随本机探测结果变长。不包含 Cursor。
2. **不可用项**：未安装或未登录禁用，并说明原因。
3. **切换**：只影响之后的发送；不改已有消息；不自动打开工作台；该会话不再续跑上一 Agent 的对话线程。
4. **绑定发起**：从目标或任务发起与普通发送共用同一套所选且可用的 Agent。
5. **无设置页**：选用偏好只在此切换。

### 4.3 工作台分发与绑定发起

参见 ProductWiki · `ai.session.rule.workspace-dispatch`、`goal-bound-start`、`task-bound-start`。

1. **分发**：点选后按类型打开对应工作台；本版实现 `goal.decompose` 与 `task.decompose`。
2. **从目标发起**：`?goalId=` → 查找/新建绑定会话；产出目标拆解块；不自动打开工作台；发起消息中目标名可点进详情。
3. **从任务发起**：`?taskId=` → 查找/新建绑定会话；产出任务拆解块；不自动打开工作台；发起消息中任务名可点进详情。
4. **目标/任务详情**：不再打开独立拆解抽屉。

### 4.4 目标 AI 拆解（工作台）

参见 ProductWiki · `growth.goal.view.ai-decomposition` 及生成/采纳/追问规则。

1. **建议类型**：子目标、任务、待办、习惯。
2. **编辑 / 采纳 / 对已选追问**：与 §4.5 任务侧同一套交互语义（编辑仅写回消息预览；采纳用当前预览；已采纳置灰）。
3. **采纳约束**：待办关联当前目标；子目标/任务/习惯落在当前目标上下文。

### 4.5 任务 AI 拆解（工作台）

参见 ProductWiki · `growth.task.view.ai-decomposition`、`growth.task.rule.ai-decompose-generation` / `ai-decompose-adopt` / `ai-decompose-followup`。

1. **生成**：基于当前任务上下文，由当前会话的编码 Agent 生成建议（非流式工作台块）；结果以 `task.decompose` 工作台块交付。
2. **建议类型**：仅**子任务**与**待办**。
3. **编辑**：保存只回写消息内预览；保存后按当前预览重算子任务冲突。
4. **采纳**：子任务 `parentId=当前任务`；待办关联当前任务；批量需确认；已采纳置灰。
5. **对已选追问**：预填会话输入框，用户确认后发送；与普通消息同一套当前 Agent；不自动打开/替换工作台。
6. **失败**：同目标侧——明确错误，无未标注假建议。

### 4.6 验收标准（产品语言）

- 可从目标详情发起绑定会话并打开目标拆解工作台；可从任务详情发起并打开任务拆解工作台。
- 任务拆解建议仅为子任务与待办；可成功采纳至少一类。
- 编辑保存不创建实体；采纳后预览置灰；刷新后仍置灰。
- 「对已选追问」预填输入框，发送后走当前可用编码 Agent 的流式回复，不自动打开工作台。
- 空白会话发问可见助手气泡随流式增长；可停止生成。
- 对话区可切换编码 Agent；未安装或未登录项不可选并说明原因。
- 切换 Agent 后已有消息不变、不自动打开工作台；之后发送不再续跑上一 Agent 线程。
- 当前 Agent 不可用时不能发出去，并看到失败原因（未安装 / 未登录）。
- 切换会话后右侧工作台关闭。
- 本版本界面无 AI 设置页、无目标/任务详情拆解抽屉；有会话流式聊天，无拆解流式。

---

## 5. 交互要点

| 元素 | 规范 |
| --- | --- |
| AI 会话壳 | 三栏；无选中会话时中间与右侧可为空态，仍可切换 Agent |
| 工作台块入口 | 消息内可点击；按类型挂载目标或任务拆解工作台 |
| 拆解工作台 | 分析摘要、建议列表、勾选、「编辑」、采纳、「对已选追问」/「采纳已选」；已采纳置灰 |
| 目标详情入口 | 「AI 拆解」仅发起会话 |
| 任务详情入口 | 「AI 拆解」仅发起会话 |
| 编码 Agent 选择器 | 对话区切换；不可用项禁用并说明原因；无独立设置页 |
| 会话 composer | 普通发送与追问预填后发送同一路径；流式渲染助手文本；所选 Agent 不可用时无法发送 |

原型（`apps/prototype` · `/ai`）仅作交互与信息架构指导，生成内容不以原型本地模板为准。

---

## 6. 附录

- ProductWiki 变更：`pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json`
- 技术设计：[TDD.md](./TDD.md)
- 技术基线：[TechnicalWiki · AI](../TechnicalWiki/ai/README.md)
