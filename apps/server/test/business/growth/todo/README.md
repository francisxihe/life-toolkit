# 待办事项模块测试

## 概述

待办事项模块提供任务管理和待办事项功能的测试，包括基础CRUD操作、状态管理、重复任务和优先级处理。

## 目录结构

```
test/business/growth/todo/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── todo.service.spec.ts     # 待办服务测试 (待开发)
│   ├── todo-base.service.spec.ts # 基础服务测试 (待开发)
│   ├── todo-status.service.spec.ts # 状态服务测试 (待开发)
│   ├── todo-repeat.service.spec.ts # 重复服务测试 (待开发)
│   └── todo.controller.spec.ts  # 控制器测试 (待开发)
├── integration/                 # 集成测试
│   └── todo.integration.spec.ts # 集成测试 (待开发)
└── utils/                       # 测试工具
    └── todo.factory.ts          # 测试数据工厂 (待开发)
```

## 当前状态

### 📋 计划中
- **测试数据工厂**: TodoTestFactory设计和实现
- **单元测试**: 所有服务和控制器的单元测试
- **集成测试**: 端到端待办事项管理测试
- **状态流转测试**: 待办事项状态变更测试

## 功能覆盖计划

### 基础CRUD操作
- [ ] **创建待办**: 创建新的待办事项
- [ ] **查询待办**: 按条件查询待办事项
- [ ] **更新待办**: 修改待办事项信息
- [ ] **删除待办**: 删除待办事项
- [ ] **批量操作**: 批量创建、更新、删除

### 状态管理
- [ ] **状态流转**: 待办事项状态变更
- [ ] **状态验证**: 状态变更规则验证
- [ ] **状态统计**: 按状态统计待办事项
- [ ] **状态历史**: 状态变更历史记录

### 重复任务
- [ ] **重复规则**: 设置重复规则
- [ ] **重复生成**: 自动生成重复任务
- [ ] **重复修改**: 修改重复规则
- [ ] **重复停止**: 停止重复任务

### 优先级和分类
- [ ] **优先级设置**: 设置任务优先级
- [ ] **分类管理**: 任务分类和标签
- [ ] **排序功能**: 按优先级、时间等排序
- [ ] **过滤功能**: 按条件过滤待办事项

## 服务层分析

### TodoService (主服务)
```typescript
// 主要功能测试
describe('TodoService', () => {
  // 基础CRUD操作
  // 业务逻辑处理
  // 数据验证
});
```

### TodoBaseService (基础服务)
```typescript
// 基础功能测试
describe('TodoBaseService', () => {
  // 数据库操作
  // 基础查询
  // 数据转换
});
```

### TodoStatusService (状态服务)
```typescript
// 状态管理测试
describe('TodoStatusService', () => {
  // 状态流转
  // 状态验证
  // 状态统计
});
```

### TodoRepeatService (重复服务)
```typescript
// 重复任务测试
describe('TodoRepeatService', () => {
  // 重复规则处理
  // 重复任务生成
  // 重复任务管理
});
```

## 测试工具计划

### TodoTestFactory (待开发)
提供待办事项测试数据的创建方法：

```typescript
// 创建基础待办事项DTO
const todoDto = TodoTestFactory.createBasicTodoDto();

// 创建待办事项实体
const todo = TodoTestFactory.createTodoEntity();

// 创建重复待办事项
const repeatTodo = TodoTestFactory.createRepeatTodo();

// 创建不同状态的待办事项
const pendingTodo = TodoTestFactory.createPendingTodo();
const completedTodo = TodoTestFactory.createCompletedTodo();
const cancelledTodo = TodoTestFactory.createCancelledTodo();

// 创建不同优先级的待办事项
const highPriorityTodo = TodoTestFactory.createHighPriorityTodo();
const lowPriorityTodo = TodoTestFactory.createLowPriorityTodo();

// 创建批量待办事项
const todos = TodoTestFactory.createMultipleTodos(10);

// 创建边界值测试数据
const boundaryData = TodoTestFactory.createBoundaryTestData();
```

## 计划中的测试用例

### 基础服务测试 (TodoBaseService)

#### CRUD操作测试
```typescript
describe('TodoBaseService', () => {
  describe('create', () => {
    // 创建基础待办事项
    // 验证必填字段
    // 处理数据验证错误
  });

  describe('findAll', () => {
    // 查询所有待办事项
    // 分页查询
    // 条件过滤
  });

  describe('findOne', () => {
    // 根据ID查询
    // 处理不存在的记录
  });

  describe('update', () => {
    // 更新待办事项
    // 部分字段更新
    // 处理并发更新
  });

  describe('delete', () => {
    // 删除待办事项
    // 软删除处理
    // 级联删除
  });
});
```

### 状态服务测试 (TodoStatusService)

#### 状态管理测试
```typescript
describe('TodoStatusService', () => {
  describe('changeStatus', () => {
    // 有效状态变更
    // 无效状态变更
    // 状态变更权限
  });

  describe('getStatusHistory', () => {
    // 获取状态历史
    // 状态变更时间
    // 状态变更原因
  });

  describe('getStatusStatistics', () => {
    // 状态统计
    // 按时间统计
    // 按用户统计
  });
});
```

### 重复服务测试 (TodoRepeatService)

#### 重复任务测试
```typescript
describe('TodoRepeatService', () => {
  describe('createRepeatRule', () => {
    // 创建重复规则
    // 验证重复规则
    // 处理无效规则
  });

  describe('generateRepeatTodos', () => {
    // 生成重复任务
    // 按规则生成
    // 处理生成冲突
  });

  describe('updateRepeatRule', () => {
    // 修改重复规则
    // 影响已生成任务
    // 处理规则冲突
  });
});
```

### 控制器测试 (TodoController)

#### API端点测试
```typescript
describe('TodoController', () => {
  describe('POST /todos', () => {
    // 创建待办事项接口
    // 参数验证
    // 权限验证
  });

  describe('GET /todos', () => {
    // 查询待办事项接口
    // 查询参数处理
    // 分页响应
  });

  describe('PUT /todos/:id', () => {
    // 更新待办事项接口
    // 数据验证
    // 权限检查
  });

  describe('DELETE /todos/:id', () => {
    // 删除待办事项接口
    // 权限验证
    // 级联处理
  });

  describe('POST /todos/:id/status', () => {
    // 状态变更接口
    // 状态验证
    // 状态历史
  });
});
```

## 测试数据设计

### 基础测试数据
- **标题**: "测试待办事项"
- **描述**: "这是一个测试待办事项"
- **优先级**: medium
- **状态**: pending
- **截止时间**: 明天
- **创建时间**: 当前时间

### 状态类型
- **pending**: 待处理
- **in_progress**: 进行中
- **completed**: 已完成
- **cancelled**: 已取消
- **paused**: 已暂停

### 优先级类型
- **low**: 低优先级
- **medium**: 中优先级
- **high**: 高优先级
- **urgent**: 紧急

### 重复规则类型
- **daily**: 每日重复
- **weekly**: 每周重复
- **monthly**: 每月重复
- **yearly**: 每年重复
- **custom**: 自定义重复

## 业务逻辑测试

### 状态流转规则
1. **pending → in_progress**: 开始处理
2. **in_progress → completed**: 完成任务
3. **in_progress → paused**: 暂停任务
4. **paused → in_progress**: 恢复任务
5. **任何状态 → cancelled**: 取消任务

### 重复任务逻辑
1. **规则验证**: 重复规则的有效性验证
2. **任务生成**: 按规则自动生成新任务
3. **冲突处理**: 重复任务与现有任务的冲突
4. **规则修改**: 修改规则对已生成任务的影响

## 性能测试计划

### 查询性能
- **单条查询**: < 10ms
- **列表查询**: < 50ms (100条记录)
- **复杂查询**: < 200ms (多条件过滤)
- **统计查询**: < 100ms

### 批量操作性能
- **批量创建**: 100条记录 < 1s
- **批量更新**: 100条记录 < 1s
- **批量删除**: 100条记录 < 500ms

## 运行测试

```bash
# 运行待办模块所有测试
npm test -- test/business/growth/todo

# 运行特定服务测试
npm test -- test/business/growth/todo/unit/todo.service.spec.ts
npm test -- test/business/growth/todo/unit/todo-status.service.spec.ts

# 运行控制器测试
npm test -- test/business/growth/todo/unit/todo.controller.spec.ts

# 运行集成测试
npm test -- test/business/growth/todo/integration

# 生成覆盖率报告
npm test -- test/business/growth/todo --coverage
```

## 开发优先级

### 高优先级 (第1周)
1. **TodoTestFactory**: 创建测试数据工厂
2. **TodoBaseService测试**: 基础CRUD操作测试
3. **TodoService测试**: 主要业务逻辑测试

### 中优先级 (第2周)
1. **TodoStatusService测试**: 状态管理测试
2. **TodoController测试**: API端点测试
3. **基础集成测试**: 端到端基础功能测试

### 低优先级 (第3周)
1. **TodoRepeatService测试**: 重复任务功能测试
2. **复杂集成测试**: 复杂业务场景测试
3. **性能测试**: 大数据量和并发测试

## 注意事项

1. **状态一致性**: 确保状态变更的数据一致性
2. **重复任务**: 重复任务生成的准确性和性能
3. **并发处理**: 多用户同时操作的并发安全
4. **数据完整性**: 删除操作的数据完整性保护
5. **用户体验**: 复杂操作的用户友好性

## 扩展计划

### 高级功能测试
- [ ] **任务依赖**: 任务间依赖关系测试
- [ ] **任务模板**: 任务模板功能测试
- [ ] **任务提醒**: 任务提醒功能测试
- [ ] **任务统计**: 任务完成统计测试

### 集成功能测试
- [ ] **与Task模块集成**: 任务分解为待办事项
- [ ] **与Habit模块集成**: 重复待办转化为习惯
- [ ] **与Calendar模块集成**: 待办事项日历显示

---

*最后更新时间: 2024年12月*