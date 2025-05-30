# Habit 模块

## 概述

Habit（习惯）模块是个人成长管理系统中专门用于习惯养成和跟踪的模块。帮助用户建立良好的习惯，通过持续的记录和统计来促进习惯的养成。

## 功能特性

### 核心功能
- ✅ 习惯创建、更新、删除
- ✅ 习惯状态管理（活跃、暂停、已完成、已放弃）
- ✅ 习惯执行记录（打卡功能）
- ✅ 习惯统计分析
- ✅ 批量完成操作
- ✅ 习惯暂停和恢复

### 状态管理
- `ACTIVE` - 活跃中
- `PAUSED` - 已暂停
- `COMPLETED` - 已完成
- `ABANDONED` - 已放弃

### 习惯类型
- **日常习惯**：每日需要执行的习惯
- **周期习惯**：按特定周期执行的习惯
- **目标习惯**：有明确完成目标的习惯

## API 接口

### 习惯管理
```http
POST   /habit/create           # 创建习惯
PUT    /habit/update/:id       # 更新习惯
DELETE /habit/delete/:id       # 删除习惯
GET    /habit/detail/:id       # 获取习惯详情
```

### 状态操作
```http
PUT /habit/batch-complete      # 批量完成习惯
PUT /habit/abandon/:id         # 放弃习惯
PUT /habit/restore/:id         # 恢复习惯
PUT /habit/pause/:id           # 暂停习惯
PUT /habit/resume/:id          # 恢复习惯
```

### 查询接口
```http
GET /habit/page               # 分页查询习惯
GET /habit/list               # 列表查询习惯
```

### 习惯记录
```http
POST   /habit-log/create       # 创建习惯记录
PUT    /habit-log/update/:id   # 更新习惯记录
DELETE /habit-log/delete/:id   # 删除习惯记录
GET    /habit-log/page         # 分页查询习惯记录
```

## 数据结构

### 创建习惯请求
```typescript
interface CreateHabitVo {
  name: string;              // 习惯名称
  description?: string;      // 习惯描述
  type?: string;            // 习惯类型
  frequency?: string;       // 执行频率
  targetCount?: number;     // 目标次数
  unit?: string;           // 计量单位
  startDate?: Date;        // 开始日期
  endDate?: Date;          // 结束日期
  reminderTime?: string;   // 提醒时间
}
```

### 习惯记录
```typescript
interface HabitLogVo {
  habitId: string;         // 习惯ID
  logDate: Date;          // 记录日期
  completed: boolean;     // 是否完成
  count?: number;         // 完成次数
  note?: string;          // 备注
}
```

### 查询过滤器
```typescript
interface HabitFilterDto {
  status?: string;         // 习惯状态
  type?: string;          // 习惯类型
  startDate?: string;     // 开始日期
  endDate?: string;       // 结束日期
}
```

## 文件结构

```
habit/
├── dto/                     # 数据传输对象
├── entities/               # 数据库实体
├── mapper/                 # 数据映射器
├── habit.controller.ts     # 习惯控制器
├── habit.service.ts        # 习惯业务逻辑
├── habit-log.controller.ts # 习惯记录控制器
├── habit-log.service.ts    # 习惯记录业务逻辑
├── habit.module.ts         # 模块定义
└── README.md              # 本文档
```

## 使用示例

### 创建日常习惯
```typescript
const dailyHabit = {
  name: "晨跑",
  description: "每天早上跑步30分钟",
  type: "DAILY",
  frequency: "DAILY",
  targetCount: 1,
  unit: "次",
  reminderTime: "07:00"
};
```

### 创建周期习惯
```typescript
const weeklyHabit = {
  name: "阅读",
  description: "每周阅读3次，每次1小时",
  type: "WEEKLY",
  frequency: "WEEKLY",
  targetCount: 3,
  unit: "次"
};
```

### 记录习惯完成
```typescript
const habitLog = {
  habitId: "habit-id",
  logDate: "2024-01-01",
  completed: true,
  count: 1,
  note: "今天跑了5公里"
};
```

## 统计功能

### 习惯完成率统计
- 日完成率
- 周完成率
- 月完成率
- 总体完成率

### 连续打卡统计
- 当前连续天数
- 最长连续天数
- 总打卡天数

### 趋势分析
- 完成趋势图表
- 习惯执行热力图
- 月度/年度统计报告

## 提醒功能

### 提醒类型
- **时间提醒**：在指定时间提醒
- **位置提醒**：到达指定位置时提醒
- **完成提醒**：未完成时的催促提醒

### 提醒设置
```typescript
interface ReminderSetting {
  enabled: boolean;        // 是否启用提醒
  time: string;           // 提醒时间
  repeatDays: number[];   // 重复日期（周几）
  message?: string;       // 自定义提醒消息
}
```

## 依赖关系

- **用户模块**：习惯属于特定用户
- **通知模块**：发送习惯提醒通知
- **统计模块**：生成习惯统计报告

## 最佳实践

1. **习惯设计原则**
   - 从小习惯开始
   - 设置合理的目标
   - 保持一致性

2. **记录建议**
   - 及时记录完成情况
   - 添加详细备注
   - 定期回顾和调整

3. **激励机制**
   - 设置里程碑奖励
   - 分享成就
   - 建立习惯社群

## 注意事项

1. 习惯删除后相关记录也会被删除
2. 暂停的习惯不会计入统计
3. 批量操作需要确认用户权限
4. 提醒功能需要用户授权通知权限 