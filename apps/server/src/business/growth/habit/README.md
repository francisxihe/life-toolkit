# Habit 模块

## 📋 概述

Habit 模块负责管理用户的习惯养成功能，采用分层架构设计。

## 🏗️ 架构设计

### 分层结构
```
HabitController → HabitService → HabitStatusService → HabitRepository → Entity
```

### 各层职责
- **HabitController**: HTTP 请求处理、参数验证、响应格式化
- **HabitService**: 业务逻辑编排、事务管理、跨模块调用
- **HabitStatusService**: 状态管理业务逻辑、状态转换规则
- **HabitRepository**: 数据库操作、Entity ↔ DTO 转换

## 📁 文件结构

```
habit/
├── entities/                    # 实体层
├── dto/                        # 数据传输对象层
├── mapper/                     # 对象映射层
├── habit.controller.ts         # 控制器层
├── habit.service.ts            # 业务服务层
├── habit.repository.ts         # 数据访问层
├── habit-status.service.ts     # 状态管理特性服务
└── habit.module.ts             # 模块定义
```

## 🔧 主要功能

### CRUD 操作
- 创建、更新、删除习惯
- 根据ID查询、列表查询、分页查询

### 状态管理
- 标记完成、放弃、恢复、暂停、恢复习惯
- 批量状态操作

### 关联查询
- 根据目标ID查询习惯
- 获取习惯相关的待办事项和统计分析

## 🚀 特性

- **分层架构**: 职责分离，便于维护和测试
- **状态管理**: 专门的状态服务处理复杂的状态转换逻辑
- **数据访问**: Repository 模式统一数据访问接口
- **业务编排**: Service 层专注于业务逻辑编排
- **向后兼容**: 保持 API 接口不变 