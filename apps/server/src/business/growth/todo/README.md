# Todo 模块

## 概述

Todo（待办事项）模块是个人成长管理系统中用于管理日常待办事项的轻量级模块。与Task模块相比，Todo更适合管理简单、快速的日常事务，支持重复任务、快速记录等功能。

## 功能特性

### 核心功能
- ✅ 待办事项创建、更新、删除
- ✅ 状态管理（待办、已完成、已放弃）
- ✅ 优先级管理（重要性、紧急性）
- ✅ 重复任务支持
- ✅ 计划日期设置
- ✅ 批量操作（批量完成、批量放弃）
- ✅ 快速添加和标记完成

### 状态管理
- `TODO` - 待办
- `DONE` - 已完成
- `ABANDONED` - 已放弃

### 优先级系统
- **重要性**：`HIGH`、`MEDIUM`、`LOW`
- **紧急性**：`HIGH`、`MEDIUM`、`LOW`

### 重复模式
- **每日重复**：每天重复的待办事项
- **每周重复**：每周特定日期重复
- **每月重复**：每月特定日期重复
- **自定义重复**：自定义重复周期

## API 接口

### 待办事项管理
```http
POST   /todo/create           # 创建待办事项
PUT    /todo/update/:id       # 更新待办事项
DELETE /todo/delete/:id       # 删除待办事项
GET    /todo/detail/:id       # 获取待办事项详情
```

### 状态操作
```http
PUT /todo/batch-done          # 批量完成待办事项
PUT /todo/abandon/:id         # 放弃待办事项
PUT /todo/restore/:id         # 恢复待办事项
```

### 查询接口
```http
GET /todo/page               # 分页查询待办事项
GET /todo/list               # 列表查询待办事项
```

## 数据结构

### 创建待办事项请求
```typescript
interface CreateTodoVo {
  title: string;             // 待办事项标题
  description?: string;      // 详细描述
  importance?: string;       // 重要性
  urgency?: string;         // 紧急性
  planDate?: Date;          // 计划完成日期
  dueDate?: Date;           // 截止日期
  isRepeating?: boolean;    // 是否重复
  repeatPattern?: string;   // 重复模式
  repeatEndDate?: Date;     // 重复结束日期
  tags?: string[];          // 标签
}
```

### 更新待办事项请求
```typescript
interface UpdateTodoVo {
  title?: string;
  description?: string;
  importance?: string;
  urgency?: string;
  planDate?: Date;
  dueDate?: Date;
  isRepeating?: boolean;
  repeatPattern?: string;
  repeatEndDate?: Date;
  tags?: string[];
}
```

### 查询过滤器
```typescript
interface TodoListFiltersVo {
  importance?: string;        // 重要性
  urgency?: string;          // 紧急性
  status?: string;           // 状态
  planDateStart?: string;    // 计划开始日期
  planDateEnd?: string;      // 计划结束日期
  doneDateStart?: string;    // 完成开始日期
  doneDateEnd?: string;      // 完成结束日期
  abandonedDateStart?: string; // 放弃开始日期
  abandonedDateEnd?: string;   // 放弃结束日期
}
```

## 文件结构

```
todo/
├── dto/                     # 数据传输对象
├── entities/               # 数据库实体
├── mappers/                # 数据映射器
├── todo.controller.ts      # 待办事项控制器
├── todo.service.ts         # 待办事项业务逻辑
├── todo-base.service.ts    # 基础服务
├── todo-repeat.service.ts  # 重复任务服务
├── todo-status.service.ts  # 状态管理服务
├── todo.module.ts          # 模块定义
└── README.md              # 本文档
```

## 使用示例

### 创建简单待办事项
```typescript
const simpleTodo = {
  title: "买菜",
  description: "去超市买今晚做饭的食材",
  importance: "MEDIUM",
  urgency: "HIGH",
  planDate: "2024-01-01",
  tags: ["生活", "购物"]
};
```

### 创建重复待办事项
```typescript
const repeatingTodo = {
  title: "晨练",
  description: "每天早上7点进行30分钟晨练",
  importance: "HIGH",
  urgency: "MEDIUM",
  isRepeating: true,
  repeatPattern: "DAILY",
  repeatEndDate: "2024-12-31",
  tags: ["健康", "运动"]
};
```

### 创建有截止日期的待办事项
```typescript
const urgentTodo = {
  title: "提交月度报告",
  description: "完成并提交本月的工作总结报告",
  importance: "HIGH",
  urgency: "HIGH",
  planDate: "2024-01-30",
  dueDate: "2024-01-31",
  tags: ["工作", "报告"]
};
```

## 重复任务功能

### 重复模式类型
```typescript
enum RepeatPattern {
  DAILY = "DAILY",           // 每日
  WEEKLY = "WEEKLY",         // 每周
  MONTHLY = "MONTHLY",       // 每月
  YEARLY = "YEARLY",         // 每年
  CUSTOM = "CUSTOM"          // 自定义
}
```

### 重复任务配置
```typescript
interface RepeatConfig {
  pattern: RepeatPattern;    // 重复模式
  interval: number;          // 间隔（如每2天、每3周）
  weekdays?: number[];       // 周几重复（周重复时使用）
  monthDay?: number;         // 月份中的第几天
  endDate?: Date;           // 重复结束日期
  maxOccurrences?: number;  // 最大重复次数
}
```

### 重复任务生成规则
1. **每日重复**：每天自动生成新的待办事项
2. **每周重复**：在指定的星期几生成
3. **每月重复**：在每月的指定日期生成
4. **自定义重复**：根据自定义规则生成

## 标签系统

### 标签功能
- 为待办事项添加多个标签
- 支持标签筛选和搜索
- 标签统计和分析
- 常用标签快速选择

### 预设标签分类
```typescript
const defaultTags = {
  工作: ["会议", "报告", "项目", "邮件"],
  生活: ["购物", "家务", "健康", "娱乐"],
  学习: ["阅读", "课程", "练习", "复习"],
  社交: ["聚会", "电话", "拜访", "活动"]
};
```

## 快速操作功能

### 快速添加
- 支持语音输入
- 智能解析时间和优先级
- 快捷键操作
- 模板快速创建

### 快速完成
- 一键标记完成
- 批量操作
- 手势操作（移动端）
- 快捷键完成

### 智能提醒
```typescript
interface ReminderSetting {
  enabled: boolean;          // 是否启用提醒
  beforeMinutes: number;     // 提前多少分钟提醒
  repeatInterval: number;    // 重复提醒间隔
  sound?: string;           // 提醒声音
  vibration?: boolean;      // 是否震动
}
```

## 统计分析

### 完成率统计
- 日完成率
- 周完成率
- 月完成率
- 按标签分类统计

### 效率分析
- 平均完成时间
- 拖延情况分析
- 优先级分布
- 时间段效率分析

### 趋势报告
```typescript
interface TodoStats {
  totalCount: number;        // 总数
  completedCount: number;    // 已完成数
  abandonedCount: number;    // 已放弃数
  completionRate: number;    // 完成率
  avgCompletionTime: number; // 平均完成时间
  topTags: string[];        // 热门标签
}
```

## 与其他模块的关系

### 与Task模块的区别
- **Todo**：轻量级、快速记录、日常事务
- **Task**：重量级、详细规划、项目任务

### 与Calendar模块的集成
- 待办事项显示在日历中
- 支持拖拽调整日期
- 时间冲突检测

### 与Habit模块的关联
- 重复待办事项可转换为习惯
- 习惯完成可生成待办事项
- 数据互通和分析

## 最佳实践

1. **简洁明了**
   - 标题简短有力
   - 避免过度详细描述
   - 合理使用标签分类

2. **优先级管理**
   - 每天不超过3个高优先级事项
   - 及时调整优先级
   - 避免优先级膨胀

3. **时间规划**
   - 设置合理的计划日期
   - 预留缓冲时间
   - 定期回顾和调整

4. **重复任务优化**
   - 定期检查重复任务的必要性
   - 及时调整重复模式
   - 避免重复任务过多

## 注意事项

1. 删除重复待办事项时需要选择是否删除所有重复项
2. 状态变更会影响统计数据的准确性
3. 批量操作需要确认用户权限
4. 重复任务的生成需要考虑系统性能
5. 标签数量建议控制在合理范围内，避免过度分类 