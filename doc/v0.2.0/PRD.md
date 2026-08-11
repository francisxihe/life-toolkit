# True North v0.2.0 PRD

> 版本定位：交付三栏 AI 会话壳；目标与任务「AI 拆解」均由详情发起绑定会话，在右侧工作台审阅采纳；技术上复用真实模型 Capability。本版**不交付** AI 设置页与流式对话。本 PRD 仅描述相对 ProductWiki 的本版本产品差异。

---

## 1. 背景与目标

```yaml
product_meta:
  name: 'AI 会话与目标/任务拆解工作台'
  version: 'v0.2.0'
  priority: 'high'
  complexity: 'complex'
  business_value: '用户可在统一 AI 会话中发起目标或任务拆解，审阅并采纳建议'
  target_users: ['个人规划者']
  related_features:
    - 'ai.session.view.shell'
    - 'ai.session.view.session-list'
    - 'ai.session.view.conversation'
    - 'ai.session.view.workspace-host'
    - 'ai.session.rule.workspace-dispatch'
    - 'ai.session.rule.goal-bound-start'
    - 'ai.session.rule.task-bound-start'
    - 'growth.goal.view.ai-decomposition'
    - 'growth.goal.rule.ai-decompose-generation'
    - 'growth.goal.rule.ai-decompose-adopt'
    - 'growth.goal.rule.ai-decompose-followup'
    - 'growth.task.view.ai-decomposition'
    - 'growth.task.rule.ai-decompose-generation'
    - 'growth.task.rule.ai-decompose-adopt'
    - 'growth.task.rule.ai-decompose-followup'
  tags: ['ai', 'session', 'goal', 'task', 'decompose']
```

| 项目背景 | 核心目标 |
| --- | --- |
| 产品已从「详情抽屉拆解」演进为「业务页只发起、会话页审阅」；正式产品仍缺会话壳与真实模型落地路径。 | 1) 交付三栏 AI 会话壳；2) 从目标/任务发起绑定会话并产出拆解工作台块；3) 工作台内用真实模型建议完成采纳；4) 密钥仍由主进程配置，无设置页。 |

参见 ProductWiki · [AI 会话](../../apps/prototype/product-wiki/ai/session/README.md)、[目标管理 · AI 拆解](../../apps/prototype/product-wiki/growth/goal/README.md)、[任务管理 · AI 拆解](../../apps/prototype/product-wiki/growth/task/README.md)。

---

## 2. 用户与场景

| 角色 | 需求 | 场景 |
| --- | --- | --- |
| 个人规划者 | 用 AI 把抽象目标拆成可执行行动 | 在目标详情点「AI 拆解」，进入绑定会话；点选工作台块后审阅并采纳 |
| 个人规划者 | 用 AI 把任务拆成子任务与待办 | 在任务详情点「AI 拆解」，进入绑定会话；点选工作台块后审阅并采纳 |
| 个人规划者 | 回顾历史协助并继续追问 | 在 `/ai` 浏览会话、发送追问；或在拆解工作台勾选建议后「对已选追问」预填再发送（不自动打开工作台） |

说明：本版模型端点与密钥由应用侧主进程配置提供，**不向用户提供设置页**；用户侧只感知拆解是否可用及失败原因。

---

## 3. 功能范围

| 模块 | 范围内 | 非范围 |
| --- | --- | --- |
| AI 会话壳 | 三栏：会话列表、对话、可插拔工作台容器；新建/切换会话；`refType` 支持 goal/task | 能力专用工具栏（如「重新生成拆解」挂在会话顶栏） |
| 工作台 | 用户点选消息中的结构化块后挂载；切换会话关闭；支持 `goal.decompose` / `task.decompose` | 默认自动打开最后一块工作台 |
| 目标 AI 拆解 | 详情入口发起绑定会话；建议类型：子目标/任务/待办/习惯；编辑缓存预览、采纳置灰、对已选追问 | 目标详情独立拆解抽屉 |
| 任务 AI 拆解 | 详情入口发起绑定会话；建议类型：**仅子任务 + 待办**；同一套编辑/采纳/追问交互 | 产出子目标或习惯；任务列表页独立 AI 入口 |
| 模型接入（对用户不可见） | 已接入兼容模型时拆解可用；失败有明确原因 | AI 设置 UI、密钥管理、连通性探测页、流式渲染、工具调用 Agent、RAG |

---

## 4. 详细需求

### 4.1 AI 会话壳

参见 ProductWiki · `ai.session.view.shell` / `session-list` / `conversation` / `workspace-host`。

1. **壳层**：左侧会话列表、中间对话、右侧工作台容器。
2. **会话列表**：展示标题、可选绑定目标或任务名、最近更新时间；支持新建无绑定会话与切换；当前会话高亮。
3. **对话**：按时间展示用户/助手消息；文本块与可点击的工作台块；底部可追问；也可由工作台「对已选追问」预填输入框。
4. **工作台容器**：默认空态；仅用户显式点选后挂载；切换会话关闭。

### 4.2 工作台分发与绑定发起

参见 ProductWiki · `ai.session.rule.workspace-dispatch`、`goal-bound-start`、`task-bound-start`。

1. **分发**：点选后按类型打开对应工作台；本版实现 `goal.decompose` 与 `task.decompose`。
2. **从目标发起**：`?goalId=` → 查找/新建绑定会话；产出目标拆解块；不自动打开工作台；发起消息中目标名可点进详情。
3. **从任务发起**：`?taskId=` → 查找/新建绑定会话；产出任务拆解块；不自动打开工作台；发起消息中任务名可点进详情。
4. **目标/任务详情**：不再打开独立拆解抽屉。

### 4.3 目标 AI 拆解（工作台）

参见 ProductWiki · `growth.goal.view.ai-decomposition` 及生成/采纳/追问规则。

1. **建议类型**：子目标、任务、待办、习惯。
2. **编辑 / 采纳 / 对已选追问**：与 §4.4 任务侧同一套交互语义（编辑仅缓存预览；采纳用当前预览；已采纳置灰）。
3. **采纳约束**：待办关联当前目标；子目标/任务/习惯落在当前目标上下文。

### 4.4 任务 AI 拆解（工作台）

参见 ProductWiki · `growth.task.view.ai-decomposition`、`growth.task.rule.ai-decompose-generation` / `ai-decompose-adopt` / `ai-decompose-followup`。

1. **生成**：基于当前任务上下文请求模型；结果以 `task.decompose` 工作台块交付。
2. **建议类型**：仅**子任务**与**待办**。
3. **编辑**：保存只回写预览缓存；保存后按当前预览重算子任务冲突。
4. **采纳**：子任务 `parentId=当前任务`；待办关联当前任务；批量需确认；已采纳置灰。
5. **对已选追问**：预填会话输入框，用户确认后发送；不自动打开/替换工作台。
6. **失败**：同目标侧——明确错误，无未标注假建议。

### 4.5 验收标准（产品语言）

- 可从目标详情发起绑定会话并打开目标拆解工作台；可从任务详情发起并打开任务拆解工作台。
- 任务拆解建议仅为子任务与待办；可成功采纳至少一类。
- 编辑保存不创建实体；采纳后预览置灰。
- 「对已选追问」预填输入框，发送后不自动打开工作台。
- 切换会话后右侧工作台关闭。
- 本版本界面无 AI 设置页、无流式对话窗口、无目标/任务详情拆解抽屉。

---

## 5. 交互要点

| 元素 | 规范 |
| --- | --- |
| AI 会话壳 | 三栏；无选中会话时中间与右侧可为空态 |
| 工作台块入口 | 消息内可点击；按类型挂载目标或任务拆解工作台 |
| 拆解工作台 | 分析摘要、建议列表、勾选、「编辑」、采纳、「对已选追问」/「采纳已选」；已采纳置灰 |
| 目标详情入口 | 「AI 拆解」仅发起会话 |
| 任务详情入口 | 「AI 拆解」仅发起会话 |

原型（`apps/prototype` · `/ai`）仅作交互与信息架构指导，生成内容不以原型本地模板为准。

---

## 6. 附录

- ProductWiki 变更：`pnpm --silent --filter true-north-prototype product-wiki:version -- v0.2.0 --json`
- 技术设计：[TDD.md](./TDD.md)
- 技术基线：[TechnicalWiki · AI](../TechnicalWiki/ai/README.md)
