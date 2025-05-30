# Goal 模块

## 概述

Goal（目标）模块是个人成长管理系统的核心模块之一，用于管理用户的长期和短期目标。支持目标的层级结构、状态管理、优先级设置等功能。

## 功能特性

### 核心功能
- ✅ 目标创建、更新、删除
- ✅ 目标状态管理（待办、进行中、已完成、已放弃）
- ✅ 目标层级结构（父子关系）
- ✅ 优先级管理（重要性、紧急性）
- ✅ 时间范围设置（开始时间、结束时间）
- ✅ 批量操作（批量完成、批量放弃）

### 状态管理
- `TODO` - 待办
- `IN_PROGRESS` - 进行中
- `DONE` - 已完成
- `ABANDONED` - 已放弃

### 优先级系统
- **重要性**：`HIGH`、`MEDIUM`、`LOW`
- **紧急性**：`HIGH`、`MEDIUM`、`LOW`

## API 接口

### 目标管理
```http
POST   /goal/create           # 创建目标
PUT    /goal/update/:id       # 更新目标
DELETE /goal/delete/:id       # 删除目标
GET    /goal/detail/:id       # 获取目标详情
```

### 状态操作
```http
PUT /goal/batch-done          # 批量完成目标
PUT /goal/abandon/:id         # 放弃目标
PUT /goal/restore/:id         # 恢复目标
```

### 查询接口
```http
GET /goal/page               # 分页查询目标
GET /goal/list               # 列表查询目标
```

## 数据结构

### 创建目标请求
```typescript
interface CreateGoalVo {
  name: string;           // 目标名称
  description?: string;   // 目标描述
  type?: string;         // 目标类型
  importance?: string;   // 重要性
  urgency?: string;      // 紧急性
  startAt?: Date;        // 开始时间
  endAt?: Date;          // 结束时间
  parentId?: string;     // 父目标ID
}
```

### 查询过滤器
```typescript
interface GoalListFiltersVo {
  withoutSelf?: boolean;     // 排除自身
  id?: string;              // 目标ID
  parentId?: string;        // 父目标ID
  importance?: string;      // 重要性
  urgency?: string;         // 紧急性
  status?: string;          // 状态
  startAt?: string;         // 开始时间
  endAt?: string;           // 结束时间
}
```

## 文件结构

```
goal/
├── dto/                    # 数据传输对象
├── entities/              # 数据库实体
├── mappers/               # 数据映射器
├── goal.controller.ts     # 控制器
├── goal.service.ts        # 核心业务逻辑
├── goal-tree.service.ts   # 树形结构服务
├── goal-status.service.ts # 状态管理服务
├── goal.module.ts         # 模块定义
└── README.md             # 本文档
```

## 使用示例

### 创建目标
```typescript
const newGoal = {
  name: "学习TypeScript",
  description: "深入学习TypeScript高级特性",
  importance: "HIGH",
  urgency: "MEDIUM",
  startAt: "2024-01-01",
  endAt: "2024-03-31"
};
```

### 创建子目标
```typescript
const subGoal = {
  name: "完成TypeScript官方文档阅读",
  parentId: "parent-goal-id",
  importance: "HIGH",
  urgency: "HIGH"
};
```

## 依赖关系

- **Task模块**：目标可以关联多个任务
- **数据库**：使用TypeORM进行数据持久化
- **树形结构**：支持目标的层级关系管理

## 注意事项

1. 删除父目标时会级联删除所有子目标
2. 目标状态变更会影响相关任务的状态
3. 批量操作需要确保用户有相应权限
4. 时间范围设置需要符合逻辑（开始时间不能晚于结束时间） 