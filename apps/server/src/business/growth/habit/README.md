# 习惯管理模块 (Habit Module)

## 概述

习惯管理模块提供了完整的习惯养成功能，支持与目标系统和待办事项系统的深度集成。

## 核心功能

### 1. 基础习惯管理
- 创建、更新、删除习惯
- 习惯状态管理（活跃、暂停、完成、放弃）
- 习惯频率设置（每日、每周、每月、自定义）
- 习惯难度分级
- 连续天数统计
- 提醒功能

### 2. 与目标系统打通 🆕
- **多对多关联**：一个习惯可以支撑多个目标，一个目标可以由多个习惯支撑
- **目标驱动**：创建习惯时可以关联相关目标
- **进度同步**：习惯的完成情况会影响目标的达成进度

#### 使用场景示例
```
目标：早晨高效工作
支撑习惯：
- 早起拉伸 (每日)
- 洗冷水澡 (每日)
- 冥想10分钟 (每日)
```

### 3. 与待办事项系统打通 🆕
- **自动生成待办**：创建习惯时自动生成对应的重复待办任务
- **智能调度**：根据习惯频率自动创建下一个待办任务
- **完成联动**：完成习惯日志时自动创建下一个待办任务

#### 工作流程
1. 创建习惯 → 自动创建重复待办配置
2. 完成习惯日志 → 自动创建下一个待办任务
3. 待办任务提醒 → 完成习惯 → 记录日志 → 循环

## 数据模型

### Habit 实体
```typescript
class Habit {
  // 基础字段
  name: string;              // 习惯名称
  description?: string;      // 习惯描述
  status: HabitStatus;       // 习惯状态
  frequency: HabitFrequency; // 习惯频率
  difficulty: HabitDifficulty; // 习惯难度
  
  // 统计字段
  currentStreak: number;     // 当前连续天数
  longestStreak: number;     // 最长连续天数
  completedCount: number;    // 累计完成次数
  
  // 关联字段 🆕
  goals: Goal[];             // 关联的目标
  todoRepeats: TodoRepeat[]; // 关联的重复待办任务
  autoCreateTodo: boolean;   // 是否自动创建待办任务
}
```

## API 接口

### 基础接口
- `POST /habit/create` - 创建习惯
- `PUT /habit/update/:id` - 更新习惯
- `DELETE /habit/delete/:id` - 删除习惯
- `GET /habit/detail/:id` - 获取习惯详情
- `GET /habit/list` - 获取习惯列表
- `GET /habit/page` - 分页获取习惯

### 状态管理接口
- `PUT /habit/abandon/:id` - 放弃习惯
- `PUT /habit/restore/:id` - 恢复习惯
- `PUT /habit/pause/:id` - 暂停习惯
- `PUT /habit/resume/:id` - 恢复习惯
- `PUT /habit/batch-complete` - 批量完成习惯

### 关联功能接口 🆕
- `GET /habit/detail-with-relations/:id` - 获取习惯详情（包含关联信息）
- `GET /habit/by-goal/:goalId` - 根据目标ID获取相关习惯

## 使用示例

### 1. 创建支撑目标的习惯
```typescript
const createHabitDto = {
  name: "早起拉伸",
  description: "每天早上6点起床后进行10分钟拉伸运动",
  frequency: HabitFrequency.DAILY,
  difficulty: HabitDifficulty.MEDIUM,
  importance: 4,
  goalIds: ["goal-id-1", "goal-id-2"], // 关联目标
  autoCreateTodo: true, // 自动创建待办任务
  needReminder: true,
  reminderTime: "06:00"
};
```

### 2. 完成习惯并自动创建下一个待办
```typescript
// 记录习惯完成日志
const habitLogDto = {
  habitId: "habit-id",
  logDate: new Date(),
  completionScore: 100, // 完成度100%
  mood: "good",
  note: "今天状态很好"
};

// 系统会自动：
// 1. 更新习惯连续天数
// 2. 创建明天的待办任务
```

## 技术实现

### 数据库关系
- `habit_goal` - 习惯与目标的多对多关联表
- `todo_repeat.habitId` - 重复待办任务与习惯的关联

### 服务层架构
- `HabitService` - 习惯核心业务逻辑
- `HabitLogService` - 习惯日志管理，负责自动创建待办任务
- `TodoRepeatService` - 重复待办任务管理

### 自动化流程
1. **创建时**：`HabitService.create()` → 创建重复待办配置
2. **完成时**：`HabitLogService.create()` → 自动创建下一个待办任务
3. **更新时**：支持动态调整目标关联和待办创建策略

## 配置选项

### 习惯频率映射
- `DAILY` → 每日重复待办
- `WEEKLY` → 每周重复待办  
- `MONTHLY` → 每月重复待办
- `CUSTOM` → 自定义重复规则

### 自动化控制
- `autoCreateTodo: false` - 禁用自动创建待办任务
- `needReminder: true` - 启用提醒功能

## 扩展功能

### 未来规划
- [ ] 习惯模板系统
- [ ] 习惯分组管理
- [ ] 习惯完成度统计分析
- [ ] 习惯与时间追踪的集成
- [ ] 习惯社交分享功能 