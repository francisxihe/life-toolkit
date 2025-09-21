# 习惯管理功能

## 功能概述

习惯管理模块是Life Toolkit个人成长系统的核心功能之一，通过目标导向的习惯养成，帮助用户实现个人成长目标。

## 主要特性

### 1. 习惯创建与管理

- **强制目标关联**: 每个习惯必须关联至少一个目标，确保习惯与个人成长目标的一致性
- **多维度属性**: 支持设置重要程度(1-5级)、难度等级(容易/中等/困难)、标签等属性
- **时间规划**: 支持设置开始时间和目标完成时间
- **状态管理**: 活跃中、已暂停、已完成、已放弃四种状态

### 2. 习惯执行跟踪

- **完成记录**: 支持每日完成情况记录
- **连续天数**: 自动计算当前连续天数和历史最长连续天数
- **完成率统计**: 基于历史数据计算完成率
- **心情记录**: 可记录执行习惯时的心情状态(1-5级)

### 3. 数据分析与统计

- **状态分布**: 展示不同状态习惯的分布情况
- **完成率对比**: 对比不同习惯的完成率
- **连续天数分析**: 分析习惯坚持的时长分布
- **趋势分析**: 展示习惯执行的时间趋势

### 4. 筛选与搜索

- **多维度筛选**: 支持按状态、难度、重要程度、关联目标等筛选
- **关键词搜索**: 支持按习惯名称和描述搜索
- **时间范围**: 支持按创建时间范围筛选
- **排序功能**: 支持多种排序方式

## 页面结构

```
/habits
├── /                    # 习惯列表页面 (默认)
├── /list               # 习惯列表页面
├── /detail/:id         # 习惯详情页面
└── /statistics         # 习惯统计页面
```

## 组件架构

### 核心组件

- `HabitListPage`: 习惯列表页面，支持筛选、分页、操作
- `HabitDetailPage`: 习惯详情页面，展示详细信息和统计数据
- `HabitStatisticsPage`: 习惯统计页面，提供数据分析和图表展示
- `HabitCard`: 习惯卡片组件，展示单个习惯的核心信息
- `CreateHabitModal`: 创建习惯模态框，支持表单验证和目标关联
- `HabitFilter`: 习惯筛选组件，提供多维度筛选功能

### 工具组件

- `HabitContext`: 习惯上下文，管理全局状态
- `useHabitContext`: 习惯上下文Hook，便于组件间状态共享

## API接口

### 习惯管理接口

- `HabitController.createHabit()`: 创建习惯
- `HabitController.updateHabit()`: 更新习惯
- `HabitController.getHabitDetail()`: 获取习惯详情
- `HabitController.getHabitPage()`: 分页获取习惯列表
- `HabitController.deleteHabit()`: 删除习惯
- `HabitController.doneBatchHabit()`: 批量完成习惯
- `HabitController.abandonHabit()`: 放弃习惯

### 习惯日志接口

- `HabitLogController.createHabitLog()`: 创建习惯日志
- `HabitLogController.updateHabitLog()`: 更新习惯日志
- `HabitLogController.getHabitLogPage()`: 分页获取习惯日志
- `HabitLogController.getHabitLogsByDate()`: 按日期获取习惯日志
- `HabitLogController.getHabitLogsCalendar()`: 获取日历视图的习惯日志

## 数据模型

### 习惯模型 (HabitVo)

```typescript
interface HabitVo {
  id: string;
  name: string;
  description?: string;
  status: HabitStatus;
  importance?: number;
  difficulty?: Difficulty;
  tags?: string[];
  startAt?: string;
  endAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  completedCount?: number;
  goals?: GoalVo[];
  recentLogs?: HabitLogVo[];
  statistics?: HabitStatisticsVo;
}
```

### 习惯日志模型 (HabitLogVo)

```typescript
interface HabitLogVo {
  id: string;
  habitId: string;
  logDate: string;
  completionScore: HabitCompletionScore;
  note?: string;
  mood?: number;
  createdAt: string;
  updatedAt: string;
}
```

## 使用指南

### 1. 创建习惯

1. 点击"创建习惯"按钮
2. 填写习惯名称和描述
3. 设置重要程度和难度等级
4. 选择关联的目标(必选)
5. 设置开始时间和目标时间
6. 添加相关标签
7. 提交创建

### 2. 管理习惯

- **完成习惯**: 点击"完成"按钮记录当日完成情况
- **暂停习惯**: 临时暂停习惯执行
- **恢复习惯**: 恢复已暂停的习惯
- **放弃习惯**: 永久放弃习惯(可重新激活)
- **删除习惯**: 彻底删除习惯(不可恢复)

### 3. 查看统计

- 访问统计页面查看整体数据分析
- 在习惯详情页查看单个习惯的详细统计
- 使用筛选功能查看特定条件下的习惯数据

## 技术实现

### 前端技术栈

- React 18 + TypeScript
- Arco Design UI组件库
- React Router v6 路由管理
- 自定义Hooks状态管理

### 数据流

1. 用户操作 → 组件事件处理
2. API调用 → 后端服务
3. 数据更新 → 状态刷新
4. UI重新渲染 → 用户反馈

### 状态管理

- 使用React Context管理全局状态
- 组件内部使用useState管理局部状态
- 通过useCallback优化性能

## 扩展功能

### 计划中的功能

1. **习惯模板**: 提供常用习惯模板
2. **习惯提醒**: 支持定时提醒功能
3. **社交分享**: 分享习惯成就
4. **数据导出**: 导出习惯数据报告
5. **AI建议**: 基于数据提供习惯优化建议

### 自定义扩展

- 支持自定义习惯属性
- 支持自定义统计维度
- 支持自定义提醒规则
- 支持自定义报表模板

## 注意事项

1. **目标关联**: 创建习惯时必须关联至少一个目标
2. **数据一致性**: 删除目标时会影响关联的习惯
3. **性能优化**: 大量数据时建议使用分页和筛选
4. **用户体验**: 重要操作需要确认提示

## 故障排除

### 常见问题

1. **创建失败**: 检查是否选择了关联目标
2. **数据不更新**: 检查网络连接和API状态
3. **页面加载慢**: 检查数据量和筛选条件
4. **操作无响应**: 检查权限和登录状态

### 调试方法

1. 查看浏览器控制台错误信息
2. 检查网络请求状态
3. 验证数据格式和类型
4. 确认组件状态和属性传递
