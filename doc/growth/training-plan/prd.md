# 训练计划模块 PRD

## 一、产品概述
```yaml
product_meta:
  name: "训练计划"
  version: "v1.0"
  priority: "high"
  complexity: "medium"
  estimated_effort: "1-2周"
  business_value: "帮助用户系统化管理训练内容并制定可执行的训练计划，提高执行率与训练效果"
  target_users: ["自我训练者", "学生运动员", "健身/运动爱好者"]
  related_features: ["任务管理", "习惯追踪", "时间追踪", "目标管理", "日历"]
  tags: ["训练", "计划", "运动", "效率"]
```

**目标**: 结合 Keep、开炼等平台经验，提供“训练内容管理 + 计划制定 + 执行跟踪”的闭环；在不新增复杂实体的前提下，最大化复用现有模块能力（Task/Habit/Goal/TrackTime）。

**范围**:
- ✅ 包含：训练内容库（以标签/模板描述）、训练计划生成（按周期/频次）、计划排期（周/月）、训练执行与完成/放弃、进度与完成率、日历展示与快速创建、与目标的可选关联。
- ❌ 排除：视频托管/课程付费、社交/课程评论、AI 自动编排、个性化推荐、复杂周期化分期（如宏/中/微周期细分）。

## 二、问题与场景
- __[内容管理]__ 用户零散收集训练动作/课程，难以结构化复用。
- __[计划制定]__ 缺少按周期与周内频次的自动编排，执行节奏不稳。
- __[执行跟踪]__ 无统一进度/时长/完成率视图，难复盘。

**核心用户场景**:
- 制定一个为期4周、每周3次的篮球专项计划（或健身计划），并按周查看与执行。
- 从内容库中挑选训练动作，组合为“训练单元/Session”，生成整期计划。
- 在日历中浏览当月训练安排，在某天快速创建或微调。
- 开始一次训练 Session，完成后记录完成状态与训练时长（time tracking）。

## 三、产品设计

### 数据与映射（产品视角，复用现有能力）
- __计划（Plan）__: 用 `Task` 作为顶层父任务（tag: `training-plan`）。
- __训练单元（Session）__: Plan 的子任务（父子树结构），每个单元对应 1 天或一个训练时段，使用 `startAt/endAt` 进行排期。
- __训练动作（Drill）__: Session 的子任务（可选），便于细分动作与完成状态。
- __频次与周期__: 用 Habit/Task 组合实现。v1 以向导一次性批量生成 Session 任务，不做自动滚动周期。
- __时间追踪__: 用 `trackTimeIds` 关联一次或多次训练计时记录，用于统计总训练时长与单次时长。
- __目标关联__: 可选 `goalId` 关联阶段目标（如“提升投篮命中率/体能耐力”）。

### 关键能力
- __训练内容库__：基于 `Task` 模板（名称、简述、标签、建议时长），支持按标签/关键字筛选后添加到计划。
- __计划创建向导__：
  - 输入：周期（n 周）、每周频次（x 次）、开始日期、每次目标时长、选定内容模板集合。
  - 输出：按周生成 Session（子任务），每个 Session 包含选定动作（Drill 子任务），带默认时长/备注。
- __排期与日历__：
  - 计划生成后，Session 自动落在周日历；可在日历拖拽/调整日期（v1 可通过编辑 `startAt/endAt` 实现）。
  - 日历支持快速创建“临时训练”（创建独立 Session 任务）。
- __执行与记录__：
  - 开始训练：记录开始/结束时间（Time Tracking），或直接手动输入时长。
  - 完成/放弃：`status` 切换为 `DONE/ABANDONED`，写入 `doneAt/abandonedAt`。
  - Drill 层级可逐项勾选完成；Session 自动根据子项完成度提示。
- __进度与复盘__：
  - 计划维度：完成率（完成 Session / 总 Session）、总训练时长、最近7天训练分布。
  - 周视图分组：本周待训练/已完成/已放弃/已过期（按 `endAt`）。

### 视图与交互
- __计划列表__：列出所有计划（父任务），字段：名称、周期、进度%、总 Session 数、完成数、总时长；支持搜索/标签筛选。
- __计划详情（周/列表）__：
  - 周视图：按周列出 Session，展开查看 Drill；支持开始/完成/放弃/编辑。
  - 列表视图：按日期排序的 Session 列表，支持批量编辑日期、状态。
- __日历视图__：月/年模式查看所有 Session；日期单元格可“添加训练”，预填当天 `startAt/endAt`。

### 表单与字段（产品约束）
- Plan: name(必填), description(可选), tags(["training-plan", 运动类型等]), startAt, endAt
- Session: name(默认“第N周-第M次训练”), startAt/endAt(必填), expectedDuration(可选), status(TODO/DONE/ABANDONED)
- Drill: name, notes(可选)
- 共性: importance/urgency(可选), goalId(可选), trackTimeIds(可选)

### 业务规则
- 计划→Session→Drill 为树结构；删除 Plan 级联删除所有后代（与现有 Task 树一致）。
- 修改计划周期/开始日期时，仅影响“未开始”的 Session（保护历史记录）。
- Session 完成条件：用户显式完成或全部 Drill 完成（任一满足即可）；记录 `doneAt`。
- 过期：Session `status=TODO` 且 `endAt < today` 判定为过期。
- 时间追踪：一次 Session 可关联多段计时，统计总时长。

## 四、验收标准

**业务验收**:
- 完成率口径: 计划生成成功率 ≥ 95%，数据复用准确性 100%
- 生成速度: 单个计划生成 Session 时间 ≤ 3s（本地环境）
- 日历展示准确性: 生成的 Session 日期与设定周期/频次一致

**体验基线**:
- 可用性: 向导流程操作 ≤ 5步可达，错误有明确提示
- 响应性: 计划创建/加载反馈 ≤ 2s
- 一致性: 与 Task/Habit 模块的设计风格保持一致

**权限控制**:
- 用户仅能管理个人数据，无共享功能

## 四、需求与验收（Gherkin）
```gherkin
Feature: 训练计划制定与执行
  As a 训练用户
  I want 制定周期化训练计划并按周执行
  So that 持续推进并跟踪训练进度

Scenario: 从向导创建训练计划
  Given 用户进入“新建训练计划”向导
  When 选择周期4周、每周3次、开始于下周一，并选择3个训练内容模板
  Then 系统生成包含12个Session的计划
  And 每个Session落在对应周的日历上

Scenario: 在日历上快速新增一次训练
  Given 用户在日历月视图
  When 点击某日的“添加训练”
  Then 创建一个独立的Session并预填该日的时间

Scenario: 开始并结束一次训练
  Given 存在今天的Session任务
  When 用户开始训练并在结束时保存
  Then 系统记录一段训练时长并将该Session标记为DONE

Scenario: 调整训练日期
  Given 下周的某个Session
  When 用户将其日期改为周三
  Then Session的startAt/endAt更新并在日历移动到周三

Scenario: 查看计划进度
  Given 一个进行中的计划
  When 用户打开计划详情
  Then 展示完成率、总训练时长与本周分组列表

Scenario Outline: 创建训练计划向导
  Given 用户在训练计划页面
  When 用户点击“新建计划”并设置 "<cycle>" 周期、"<frequency>" 频次、"<start_date>" 开始日期
  Then 系统应该生成 "<expected_sessions>" 个 Session
  And 进入向导流程

Examples:
  | cycle | frequency | start_date | expected_sessions |
  | 周   | 3         | 2024-01-01 | 3                 |
  | 月   | 4         | 2024-01-01 | 4                 |
  | 季度 | 12        | 2024-01-01 | 12                |

Scenario: 创建训练计划
  Given 用户在训练计划页面
  When 用户点击“新建计划”并填写基本信息
  Then 系统应该创建计划并进入向导流程
```

## 五、非功能与边界
- 性能：计划列表/日历加载<1s（常规规模）；批量生成Session（<=100条）<2s。
- 安全：仅个人数据访问；无共享。
- 边界：v1 不提供视频播放、评测打分、教练布置与反馈、周期化自动滚动。

## 六、对齐与实现提示（产品级摘要）
- 复用 `Task` 树：Plan/Session/Drill 三层；`task.entity.ts` 的 `parent/children`、`startAt/endAt/status/doneAt/abandonedAt/tags/trackTimeIds/goalId`。
- 复用前端视图：
  - 列表/筛选：`task-all` 复用 + 训练计划专用筛选（tags包含`training-plan`）。
  - 周/日历：`task-week`、`task-calendar` 复用，用于展示与创建 Session。
- 计时：沿用时间追踪与 `taskWithTrackTime` 能力用于统计。
- 模板与向导：v1 可用“从模板创建 Task 树”的表单实现，无需新增实体。

## 七、里程碑
- M1：计划创建向导、Session 批量生成、日历/周视图联动、完成/放弃、进度查看。
- M2：训练内容模板库（增/改/删）、计划复制、进阶统计（按标签/周）。
- M3：提醒与日程同步（可选，后续迭代）。
