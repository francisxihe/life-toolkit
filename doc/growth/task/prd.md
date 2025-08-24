# 任务管理模块 PRD

## 一、产品概述
```yaml
product_meta:
  name: "任务管理"
  version: "v1.0"
  priority: "high"
  complexity: "medium"
  estimated_effort: "1-2周"
  business_value: "提供任务计划-执行-回顾的一体化闭环，提升个人效率与专注度"
  target_users: ["个人用户", "知识工作者"]
  related_features: ["目标管理", "习惯追踪", "时间追踪"]
  tags: ["个人成长", "任务管理", "效率工具"]
```

**功能目标**: 解决任务分散与跟踪不一致的问题 + 提供清晰的状态与优先级管理 + 面向个人效率用户

**用户场景**:
- 主场景: 用户日常规划与执行本周任务，并在日历中查看全月任务分布
- 次场景: 用户按重要/紧急程度聚焦任务，筛选并批量处理
- 边界场景: 团队协作、评论/附件管理(排除)、跨人协作(排除)

**功能范围**:
- 包含: 任务的创建/编辑/删除、状态管理(TODO/DONE/ABANDONED)、日期区间(计划开始/结束)、优先级(重要/紧急)、标签、多条件筛选、子任务树、与目标的可选关联、时间追踪IDs关联、列表/周/日历三视图
- 排除: 团队协作、文件附件、评论讨论、复杂项目/看板协作

## 二、需求分析
```gherkin
Feature: 任务管理
  As a 个人用户
  I want 规划、管理并回顾任务
  So that 提升执行效率与复盘质量

Scenario: 创建任务
  Given 用户在任务页面
  When 用户点击“新建任务”并填写名称、计划日期、重要/紧急、标签
  Then 系统应创建任务
  And 任务出现在列表/日历/周视图相应位置

Scenario: 编辑任务
  Given 任务已存在
  When 用户在列表或日历中打开任务详情并修改字段
  Then 系统应保存修改
  And 相关视图中的展示同步更新

Scenario: 开始任务
  Given 任务状态为 "TODO"
  When 用户点击"开始任务"
  Then 状态变更为 "IN_PROGRESS"
  And 在周视图进入“进行中”分组

Scenario: 完成任务
  Given 任务状态为 "IN_PROGRESS"
  When 用户点击"完成任务"
  Then 状态变更为 "DONE" 且记录 doneAt
  And 在周视图进入“已完成”分组

Scenario: 标记放弃
  Given 存在状态为 TODO 的任务
  When 用户标记为已放弃
  Then 状态变更为 "ABANDONED" 且记录 abandonedAt
  And 在周视图进入“已放弃”分组

Scenario: 还原任务
  Given 存在状态为 DONE 或 ABANDONED 的任务
  When 用户执行还原操作
  Then 状态恢复为 TODO
  And 可继续出现在待办相关筛选下

Scenario: 多条件筛选
  Given 列表视图存在多项任务
  When 用户按关键字/计划日期范围/重要/紧急/状态/标签组合筛选
  Then 系统返回匹配任务分页列表

Scenario: 展开子任务
  Given 任务存在子任务
  When 用户在列表视图展开父任务
  Then 系统显示子任务项

Scenario: 日历单元格创建
  Given 用户在日历视图中
  When 用户点击某日期单元格的“添加任务”
  Then 系统预填该日期为计划日期并创建任务

Scenario: 级联删除
  Given 任务存在子任务与关联待办
  When 用户删除该任务
  Then 系统级联删除其所有后代任务并清理关联待办
```

**业务流程**:
- 登录 → 查看“本周任务/任务日历/全部任务” → 筛选/创建/编辑 → 状态变更(开始/完成/放弃/还原) → 回顾与统计

**业务规则**:
- 状态规则: TODO → IN_PROGRESS → DONE/ABANDONED；DONE/ABANDONED → TODO(可还原)
- 时间规则: 计划起止(startAt/endAt)定义计划区间；完成(doneAt)与放弃(abandonedAt)用于周视图分组与筛选
- 优先/紧急: 可选(1/2/3 或空)，映射显示“非常/较/一般/无”，与筛选器联动
- 标签: 多选标签，支持筛选
- 层级: 支持父子任务树，列表可展开查看子任务
- 关联: 可选 goalId；时间追踪 trackTimeIds 仅做关联展示/统计，不在本期展开
- 删除: 支持级联删除后代任务，并清理关联 Todo（仅业务一致性约束）
- 与 Todo 的关系与可见性: 在任务详情的“执行清单”中创建的待办默认 source=task，且 isDailyVisible=false（不进入“每日视图”）；可在任务详情中切换“加入每日清单”开关以设为 true，立即影响每日视图。任务详情的执行清单展示全部关联待办，不受 isDailyVisible 过滤。
- 级联删除约束: 删除任务时对关联 Todo 进行软删除（按 taskId 批量），以保持一致性；还原任务不自动还原已软删除的 Todo（由用户在 Todo 模块中独立恢复）。

## 三、产品设计

### 全部任务（表格）
**业务目标**:
- 支持多维筛选与批量管理，覆盖任务全量视图

**功能描述**:
- 筛选器: 关键字、计划日期区间、重要、紧急、状态、标签
- 列表字段: 名称、描述、状态(TODO/DONE/ABANDONED+时间)、计划日期(单日或区间)、重要/紧急、标签
- 操作: 编辑、删除；行可展开查看子任务

**用户操作流程**:
1. 设置筛选条件点击查询
2. 在表格中查看/展开/编辑/删除
3. 新建按钮创建后刷新列表

**交互/实现要点**:
- 筛选来源: `packages/business/web/src/pages/growth/task/task-all/TaskFilters.tsx`
- 表格列/展开: `packages/business/web/src/pages/growth/task/task-all/TaskTable.tsx`
- 状态渲染: `TaskStatus` 与时间字段(doneAt/abandonedAt)

### 周视图
**业务目标**:
- 聚焦本周执行，按状态分组展示，便于每日推进与复盘

**功能描述**:
- 分组: 已过期(TODO 且 endAt < 周起始)、本周(TODO 且计划在本周)、进行中(IN_PROGRESS)、已完成(DONE 且 doneAt 在本周)、已放弃(ABANDONED 且 abandonedAt 在本周)
- 支持点击任务查看详情编辑、快速创建

**交互/实现要点**:
- 入口与分组逻辑: `packages/business/web/src/pages/growth/task/task-week/index.tsx`

### 日历视图
**业务目标**:
- 提供按月/年维度的任务分布与计划补齐能力

**功能描述**:
- 模式: 月/年切换；前后翻页；回到今天
- 月模式支持在日期单元格列出当日覆盖(startAt~endAt)的任务
- 在日期单元格“添加任务”快捷创建并预填计划日期范围

**交互/实现要点**:
- 头部/导航/模式: `task-calendar/CalendarHeader.tsx`
- 单元格渲染/创建: `task-calendar/CalendarCell.tsx`
- 上下文与数据拉取: `task-calendar/context.tsx`

### 任务详情与执行清单（Todo）
**业务目标**:
- 将任务的可执行原子项集中管理，避免每日清单过载

**功能描述**:
- 在任务详情中展示“执行清单”列表，包含该任务的全部关联 Todo（不受 isDailyVisible 过滤）
- 支持新增/编辑/完成/放弃关联 Todo
- 为每条 Todo 提供“加入每日清单”开关，控制 isDailyVisible

**规则**:
- 在任务详情创建的 Todo：source=task，默认 isDailyVisible=false
- 切换“加入每日清单”后：isDailyVisible=true，Todo 将在“今日/每日视图”中出现（由 Todo 模块负责渲染）
- 重复 Todo：继承上一实例的 isDailyVisible

**异常/约束**:
- 删除任务：对关联 Todo 进行软删除
- 任务恢复：不自动恢复已软删除的 Todo，由用户在 Todo 模块中独立处理

### 字段与数据约束（产品视角）
- 基础: id, name(必填), description(可选), tags(可选)
- 状态: status ∈ {TODO, IN_PROGRESS, DONE, ABANDONED}；doneAt/abandonedAt 随状态写入
- 计划: startAt/endAt(可选区间)；用于列表筛选、日历显示
- 优先级: importance/urgency ∈ {1,2,3,null}
- 关联: goalId(可选)，trackTimeIds(可选数组)
- 层级: parentId(可选)，children(系统生成)

**异常处理**:
- 标题为空: 提示“请输入任务名称”
- 日期不合法: 提示“计划日期不合法”
- 删除二次确认: 防止误删（级联删除）

**权限控制**:
- 仅个人数据，用户只能操作自己的任务；无团队共享

## 四、验收标准
```gherkin
Scenario Outline: 任务核心流程验收
  Given 当前视图为 "<view>"
  And 系统中存在 "<existing>" 条任务
  When 用户执行 "<action>"
  And 输入数据为 "<input>"
  Then 系统显示 "<expected>"
  And 业务状态变更为 "<final_state>"

Examples:
  | view       | existing | action   | input                                      | expected           | final_state        |
  | 列表       | 0        | 创建     | 名称:"写周报" 计划:"2024-06-10~2024-06-10" | 创建成功           | 列表出现1条任务     |
  | 列表       | 1        | 编辑     | 修改描述:"本周五前完成"                     | 保存成功           | 任务字段已更新      |
  | 列表       | 1        | 删除     | -                                          | 删除确认并成功     | 任务被移除          |
  | 列表/周视图 | 1        | 开始任务 | -                                          | 状态=进行中         | 进入进行中分组      |
  | 列表/周视图 | 1        | 完成任务 | -                                          | 状态=已完成         | 进入已完成分组      |
  | 列表/周视图 | 1        | 放弃     | -                                          | 状态=已放弃         | 进入已放弃分组      |
  | 列表       | 5        | 筛选     | 关键字+日期+重要+紧急+状态+标签             | 返回匹配分页列表    | 条数<=分页大小      |
  | 日历       | 3        | 单元格创建 | 选择日期单元格                              | 预填日期并创建成功  | 日历当日出现该任务  |
```

```gherkin
Scenario: 在任务详情创建的待办默认不进入每日视图
  Given 存在任务A
  When 在任务A的“执行清单”中新建待办T，计划日期为今天
  Then 待办T 的 source=task 且 isDailyVisible=false
  And 在“今日/每日视图”不展示待办T
  And 在任务A的“执行清单”中可见待办T

Scenario: 在任务详情切换“加入每日清单”后进入每日视图
  Given 待办T 的 isDailyVisible=false 且计划日期为今天
  When 在任务A的“执行清单”中打开待办T的“加入每日清单”
  Then 待办T 的 isDailyVisible=true
  And 在“今日/每日视图”展示待办T

Scenario: 删除任务级联软删除关联待办
  Given 任务A 及其关联的多个待办
  When 删除任务A
  Then 任务A 被删除
  And 其关联的待办被软删除（按 taskId 批量）
```

**业务验收**:
- CRUD 与状态流转完整，级联删除生效
- 多维筛选结果正确，分页数据准确
- 周视图分组正确(过期/本周/已完成/已放弃)
- 日历视图展示与导航正确，快捷创建生效

**用户体验**:
- 关键操作路径≤3步；主要页面操作响应<1s
- 文案一致，状态/颜色映射清晰(重要/紧急/状态)
