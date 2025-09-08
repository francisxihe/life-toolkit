# Task 模块

## 概述

Task（任务）模块是个人成长管理系统中用于管理具体执行任务的核心模块。任务通常是目标的具体分解，具有明确的执行步骤和完成标准，支持时间跟踪、优先级管理等功能。

## 功能特性

### 核心功能
- ✅ 任务创建、更新、删除
- ✅ 任务状态管理（待办、进行中、已完成、已放弃）
- ✅ 任务层级结构（父子任务关系）
- ✅ 优先级管理（重要性、紧急性）
- ✅ 时间跟踪功能
- ✅ 批量操作（批量完成、批量放弃）
- ✅ 任务与目标关联

### 状态管理
- `TODO` - 待办
- `IN_PROGRESS` - 进行中
- `DONE` - 已完成
- `ABANDONED` - 已放弃

### 优先级系统
- **重要性**：`HIGH`、`MEDIUM`、`LOW`
- **紧急性**：`HIGH`、`MEDIUM`、`LOW`

### 时间跟踪
- 预估工作时间
- 实际工作时间记录
- 时间效率分析

## API 接口

### 任务管理
```http
POST   /task/create                    # 创建任务
PUT    /task/update/:id                # 更新任务
DELETE /task/delete/:id                # 删除任务
GET    /task/detail/:id                # 获取任务详情
GET    /task/task-with-relations/:id  # 获取任务及时间跟踪信息
```

### 状态操作
```http
PUT /task/done/batch          # 批量完成任务
PUT /task/abandon/:id         # 放弃任务
PUT /task/restore/:id         # 恢复任务
```

### 查询接口
```http
GET /task/page               # 分页查询任务
GET /task/list               # 列表查询任务
```

## 数据结构

### 创建任务请求
```typescript
interface CreateTaskVo {
  name: string;              // 任务名称
  description?: string;      // 任务描述
  importance?: string;       // 重要性
  urgency?: string;         // 紧急性
  estimatedTime?: number;   // 预估时间（分钟）
  startAt?: Date;           // 开始时间
  endAt?: Date;             // 结束时间
  goalId?: string;          // 关联目标ID
  parentId?: string;        // 父任务ID
}
```

### 任务时间跟踪
```typescript
interface taskWithRelationsVo {
  id: string;
  name: string;
  description?: string;
  status: string;
  estimatedTime?: number;    // 预估时间
  actualTime?: number;       // 实际时间
  trackRecords: TrackRecord[]; // 时间跟踪记录
}

interface TrackRecord {
  id: string;
  startTime: Date;          // 开始时间
  endTime?: Date;           // 结束时间
  duration: number;         // 持续时间（分钟）
  description?: string;     // 记录描述
}
```

### 查询过滤器
```typescript
interface TaskFilterVo {
  id?: string;              // 任务ID
  importance?: string;      // 重要性
  urgency?: string;         // 紧急性
  status?: string;          // 状态
  startAt?: string;         // 开始时间
  endAt?: string;           // 结束时间
  excludeIds?: string[];    // 排除ID列表
}
```

## 文件结构

```
task/
├── dto/                     # 数据传输对象
├── entities/               # 数据库实体
├── mappers/                # 数据映射器
├── task.controller.ts      # 任务控制器
├── task.service.ts         # 任务业务逻辑
├── task-tree.service.ts    # 任务树形结构服务
├── task-status.service.ts  # 任务状态管理服务
├── task.module.ts          # 模块定义
└── README.md              # 本文档
```

## 使用示例

### 创建简单任务
```typescript
const simpleTask = {
  name: "完成项目文档",
  description: "编写项目的技术文档和用户手册",
  importance: "HIGH",
  urgency: "MEDIUM",
  estimatedTime: 240,  // 4小时
  startAt: "2024-01-01T09:00:00",
  endAt: "2024-01-01T17:00:00"
};
```

### 创建关联目标的任务
```typescript
const goalTask = {
  name: "学习React Hooks",
  description: "深入学习React Hooks的使用方法",
  goalId: "goal-id-123",
  importance: "HIGH",
  urgency: "HIGH",
  estimatedTime: 180  // 3小时
};
```

### 创建子任务
```typescript
const subTask = {
  name: "编写单元测试",
  description: "为新功能编写完整的单元测试",
  parentId: "parent-task-id",
  importance: "MEDIUM",
  urgency: "HIGH",
  estimatedTime: 120  // 2小时
};
```

## 时间跟踪功能

### 开始时间跟踪
```typescript
// 开始执行任务时记录开始时间
const startTracking = {
  taskId: "task-id",
  startTime: new Date(),
  description: "开始编写代码"
};
```

### 结束时间跟踪
```typescript
// 完成任务时记录结束时间
const endTracking = {
  trackRecordId: "record-id",
  endTime: new Date(),
  description: "完成核心功能开发"
};
```

### 时间统计分析
- **预估 vs 实际**：对比预估时间和实际花费时间
- **效率分析**：计算任务完成效率
- **时间分布**：分析时间在不同任务上的分配
- **趋势分析**：跟踪时间管理能力的提升

## 任务分解策略

### SMART原则
- **Specific**（具体的）：任务目标明确具体
- **Measurable**（可衡量的）：有明确的完成标准
- **Achievable**（可实现的）：在能力范围内
- **Relevant**（相关的）：与目标相关
- **Time-bound**（有时限的）：有明确的时间限制

### 任务分解建议
1. **大任务分解**：将大任务分解为多个小任务
2. **时间估算**：合理估算每个任务的执行时间
3. **依赖关系**：明确任务之间的依赖关系
4. **优先级排序**：根据重要性和紧急性排序

## 与其他模块的关系

### 与Goal模块的关系
- 任务是目标的具体执行步骤
- 任务完成状态影响目标进度
- 支持从目标自动生成任务

### 与Time Tracking模块的关系
- 记录任务执行的详细时间
- 分析时间使用效率
- 优化时间分配策略

### 与Calendar模块的关系
- 任务可以安排到具体的时间段
- 支持日程规划和提醒
- 避免时间冲突

## 最佳实践

1. **任务粒度控制**
   - 单个任务不超过4小时
   - 复杂任务及时分解
   - 保持任务的独立性

2. **时间管理**
   - 合理估算任务时间
   - 预留缓冲时间
   - 定期回顾和调整

3. **优先级管理**
   - 使用艾森豪威尔矩阵
   - 优先处理重要紧急任务
   - 避免拖延症

4. **进度跟踪**
   - 及时更新任务状态
   - 记录执行过程中的问题
   - 总结经验教训

## 注意事项

1. 删除父任务会级联删除所有子任务
2. 任务状态变更会影响关联目标的进度
3. 时间跟踪数据用于效率分析，建议准确记录
4. 批量操作需要确保用户有相应权限
5. 任务时间安排要考虑现实可行性 