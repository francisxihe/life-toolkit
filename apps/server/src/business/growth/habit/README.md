# Habit 模块

## 📋 概述

Habit 模块负责管理用户的习惯养成功能，采用分层架构设计，按照新的 `server-specification.mdc` 规范重构，提高代码的可维护性、可测试性和可扩展性。

## 🏗️ 架构设计

### 分层结构

```
┌─────────────────────────────────────┐
│           控制器层                   │
│        HabitController              │
│  • 路由处理                         │
│  • 参数验证                         │
│  • VO ↔ DTO 转换                   │
│  • 响应格式化                       │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           业务服务层                 │
│         HabitService                │
│  • 业务逻辑编排                     │
│  • 事务管理                         │
│  • 跨模块调用                       │
│  • 复杂业务规则                     │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           特性服务层                 │
│       HabitStatusService            │
│  • 状态管理业务逻辑                 │
│  • 状态转换规则                     │
│  • 批量状态操作                     │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           数据访问层                 │
│        HabitRepository              │
│  • 基础 CRUD 操作                  │
│  • 数据库查询                       │
│  • Entity ↔ DTO 转换               │
│  • 数据持久化                       │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│           数据存储层                 │
│         Habit Entity                │
│  • 数据模型定义                     │
│  • 关系映射                         │
│  • 数据验证                         │
│  • 数据库约束                       │
└─────────────────────────────────────┘
```

### 各层职责

#### HabitController (控制器层)

- **职责**: HTTP 请求处理、参数验证、响应格式化
- **主要方法**:
  - `create()` - 创建习惯
  - `update()` - 更新习惯
  - `delete()` - 删除习惯
  - `findWithRelations()` - 根据ID查询
  - `list()` - 列表查询
  - `page()` - 分页查询
  - `done()`, `abandon()`, `restore()` - 状态操作

#### HabitService (业务服务层)

- **职责**: 业务逻辑编排、事务管理、跨模块调用
- **主要功能**:
  - 业务规则验证
  - 数据预处理和后处理
  - 权限检查
  - 委托状态操作给 StatusService
  - 委托数据操作给 Repository

#### HabitStatusService (特性服务层)

- **职责**: 专门处理习惯状态相关的业务逻辑
- **主要功能**:
  - 状态转换规则验证
  - 批量状态操作
  - 状态相关的业务规则

#### HabitRepository (数据访问层)

- **职责**: 数据库操作、Entity ↔ DTO 转换
- **主要功能**:
  - 基础 CRUD 操作
  - 复杂查询构建
  - 数据持久化
  - 关联数据处理

## 📁 文件结构

```
habit/
├── entities/                    # 实体层
│   ├── habit.entity.ts         # Habit 实体定义
│   └── index.ts                # 导出文件
├── dto/                        # 数据传输对象层
│   ├── habit-model.dto.ts      # 基础模型 DTO
│   ├── habit-form.dto.ts       # 表单操作 DTO
│   ├── habit-filter.dto.ts     # 过滤查询 DTO
│   └── index.ts                # 导出文件
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

## 📊 数据流向

```
Client Request
    ↓
HabitController (参数验证 + VO→DTO)
    ↓
HabitService (业务逻辑编排)
    ↓
HabitStatusService (状态业务逻辑)
    ↓
HabitRepository (数据访问)
    ↓
TypeORM Entity (数据持久化)
    ↓
Database
    ↓
Entity → DTO → VO
    ↓
Client Response
```

## 🚀 架构优势

### 1. **职责分离**

- 每一层都有明确的职责边界
- 业务逻辑与数据访问逻辑分离
- 状态管理逻辑独立成特性服务

### 2. **可测试性**

- 每一层都可以独立进行单元测试
- 依赖注入便于 Mock 测试
- 业务逻辑测试不依赖数据库

### 3. **可维护性**

- 代码组织清晰，便于理解和维护
- 修改某一层不影响其他层
- 新增功能时有明确的放置位置

### 4. **可扩展性**

- Repository 可以被多个 Service 复用
- StatusService 可以被其他模块复用
- 便于添加新的特性服务

### 5. **符合规范**

- 完全符合 `server-specification.mdc` 规范
- 与其他模块保持一致的架构风格
- 便于团队协作和代码审查

## 🎯 最佳实践

### 1. **依赖注入顺序**

```typescript
constructor(
  private readonly habitRepository: HabitRepository,
  private readonly habitStatusService: HabitStatusService,
  @InjectRepository(Todo)
  private readonly todoRepository: Repository<Todo>,
) {}
```

### 2. **错误处理**

- Repository 层抛出 `NotFoundException`
- Service 层抛出 `BadRequestException`
- Controller 层使用 `@Response()` 装饰器统一处理

### 3. **事务管理**

- 在 Service 层使用 `@Transactional()` 装饰器
- Repository 层不处理事务，由上层控制

### 4. **权限检查**

- 在 Service 层的 `checkPermission()` 方法中实现
- 可以根据需要在不同的方法中调用

## 🔄 重构说明

### 主要变更

1. **新增 HabitRepository**: 将原 Service 中的数据访问逻辑迁移到 Repository
2. **新增 HabitStatusService**: 将状态相关的业务逻辑独立出来
3. **重构 HabitService**: 专注于业务逻辑编排，委托具体操作给其他层
4. **保持 HabitController**: 接口保持不变，确保向后兼容

### 向后兼容性

- 所有 API 接口保持不变
- 返回数据格式保持不变
- 业务逻辑行为保持不变

## 📝 后续优化建议

1. **添加缓存层**: 在 Repository 和 Service 之间添加缓存
2. **事件驱动**: 使用事件系统处理状态变更通知
3. **审计日志**: 在 Service 层添加操作日志记录
4. **性能监控**: 添加方法执行时间监控
5. **批量操作优化**: 优化批量操作的性能
