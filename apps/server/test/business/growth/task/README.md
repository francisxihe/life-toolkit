# 任务管理模块测试

## 概述

任务管理模块提供项目任务管理功能的测试，包括任务CRUD操作、任务树结构管理、状态追踪和任务分解。

## 目录结构

```
test/business/growth/task/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── task.service.spec.ts     # 任务服务测试 (待开发)
│   ├── task-tree.service.spec.ts # 任务树服务测试 (待开发)
│   ├── task-status.service.spec.ts # 任务状态服务测试 (待开发)
│   └── task.controller.spec.ts  # 控制器测试 (待开发)
├── integration/                 # 集成测试
│   └── task.integration.spec.ts # 集成测试 (待开发)
└── utils/                       # 测试工具
    └── task.factory.ts          # 测试数据工厂 (待开发)
```

## 当前状态

### 📋 计划中
- **测试数据工厂**: TaskTestFactory设计和实现
- **单元测试**: 所有服务和控制器的单元测试
- **集成测试**: 端到端任务管理测试
- **树结构测试**: 任务层级关系测试

## 功能覆盖计划

### 基础任务管理
- [ ] **创建任务**: 创建新的任务
- [ ] **查询任务**: 按条件查询任务
- [ ] **更新任务**: 修改任务信息
- [ ] **删除任务**: 删除任务及子任务
- [ ] **批量操作**: 批量创建、更新、删除

### 任务树结构
- [ ] **父子关系**: 建立任务父子关系
- [ ] **层级查询**: 查询任务层级结构
- [ ] **子任务管理**: 子任务的增删改查
- [ ] **树形遍历**: 任务树的遍历和搜索
- [ ] **层级限制**: 任务层级深度限制

### 任务状态管理
- [ ] **状态流转**: 任务状态变更
- [ ] **状态同步**: 父子任务状态同步
- [ ] **状态统计**: 按状态统计任务
- [ ] **进度计算**: 基于子任务的进度计算

### 任务分解
- [ ] **任务拆分**: 将任务分解为子任务
- [ ] **模板应用**: 使用任务模板创建任务
- [ ] **依赖关系**: 任务间依赖关系管理
- [ ] **里程碑**: 重要任务节点标记

## 服务层分析

### TaskService (主服务)
```typescript
// 主要功能测试
describe('TaskService', () => {
  // 任务CRUD操作
  // 任务分解逻辑
  // 任务依赖管理
  // 进度计算
});
```

### TaskTreeService (树结构服务)
```typescript
// 树结构测试
describe('TaskTreeService', () => {
  // 父子关系建立
  // 层级查询
  // 树形遍历
  // 层级限制
});
```

### TaskStatusService (状态服务)
```typescript
// 状态管理测试
describe('TaskStatusService', () => {
  // 状态流转
  // 状态同步
  // 状态验证
});
```

## 测试工具计划

### TaskTestFactory (待开发)
提供任务管理测试数据的创建方法：

```typescript
// 创建基础任务DTO
const taskDto = TaskTestFactory.createBasicTaskDto();

// 创建任务实体
const task = TaskTestFactory.createTaskEntity();

// 创建父任务
const parentTask = TaskTestFactory.createParentTask();

// 创建子任务
const childTask = TaskTestFactory.createChildTask(parentId);

// 创建任务树
const taskTree = TaskTestFactory.createTaskTree(3); // 3层深度

// 创建不同状态的任务
const pendingTask = TaskTestFactory.createPendingTask();
const inProgressTask = TaskTestFactory.createInProgressTask();
const completedTask = TaskTestFactory.createCompletedTask();

// 创建不同优先级的任务
const highPriorityTask = TaskTestFactory.createHighPriorityTask();
const lowPriorityTask = TaskTestFactory.createLowPriorityTask();

// 创建批量任务
const tasks = TaskTestFactory.createMultipleTasks(10);

// 创建边界值测试数据
const boundaryData = TaskTestFactory.createBoundaryTestData();
```

## 计划中的测试用例

### 任务服务测试 (TaskService)

#### 基础CRUD测试
```typescript
describe('TaskService', () => {
  describe('create', () => {
    // 创建根任务
    // 创建子任务
    // 验证必填字段
    // 处理层级限制
  });

  describe('findAll', () => {
    // 查询所有任务
    // 按层级查询
    // 条件过滤
    // 分页查询
  });

  describe('findOne', () => {
    // 根据ID查询
    // 包含子任务查询
    // 处理不存在的记录
  });

  describe('update', () => {
    // 更新任务信息
    // 移动任务位置
    // 处理并发更新
  });

  describe('delete', () => {
    // 删除叶子任务
    // 删除父任务及子任务
    // 软删除处理
  });
});
```

#### 任务分解测试
```typescript
describe('TaskDecomposition', () => {
  describe('splitTask', () => {
    // 任务拆分为子任务
    // 保持原任务信息
    // 分配工作量
  });

  describe('mergeTask', () => {
    // 合并子任务
    // 数据聚合
    // 状态同步
  });

  describe('calculateProgress', () => {
    // 基于子任务计算进度
    // 权重计算
    // 状态影响
  });
});
```

### 任务树服务测试 (TaskTreeService)

#### 树结构操作测试
```typescript
describe('TaskTreeService', () => {
  describe('buildTree', () => {
    // 构建任务树
    // 处理循环依赖
    // 层级深度限制
  });

  describe('moveTask', () => {
    // 移动任务到新父级
    // 验证移动合法性
    // 更新层级关系
  });

  describe('getChildren', () => {
    // 获取直接子任务
    // 获取所有后代任务
    // 按条件过滤
  });

  describe('getAncestors', () => {
    // 获取父级路径
    // 根节点查找
    // 层级计算
  });
});
```

### 任务状态服务测试 (TaskStatusService)

#### 状态管理测试
```typescript
describe('TaskStatusService', () => {
  describe('changeStatus', () => {
    // 单个任务状态变更
    // 父子任务状态同步
    // 状态变更权限
  });

  describe('syncChildrenStatus', () => {
    // 子任务状态同步
    // 状态冲突处理
    // 批量状态更新
  });

  describe('calculateParentStatus', () => {
    // 基于子任务计算父任务状态
    // 状态权重计算
    // 自动状态更新
  });
});
```

### 控制器测试 (TaskController)

#### API端点测试
```typescript
describe('TaskController', () => {
  describe('POST /tasks', () => {
    // 创建任务接口
    // 参数验证
    // 权限验证
  });

  describe('GET /tasks', () => {
    // 查询任务接口
    // 树形结构返回
    // 分页和过滤
  });

  describe('GET /tasks/:id/tree', () => {
    // 获取任务树接口
    // 层级深度控制
    // 子任务展开
  });

  describe('PUT /tasks/:id', () => {
    // 更新任务接口
    // 数据验证
    // 权限检查
  });

  describe('POST /tasks/:id/split', () => {
    // 任务分解接口
    // 分解规则验证
    // 子任务创建
  });

  describe('DELETE /tasks/:id', () => {
    // 删除任务接口
    // 级联删除确认
    // 权限验证
  });
});
```

## 测试数据设计

### 基础测试数据
- **标题**: "测试任务"
- **描述**: "这是一个测试任务"
- **优先级**: medium
- **状态**: pending
- **预估工时**: 8小时
- **截止时间**: 一周后
- **创建时间**: 当前时间

### 任务状态类型
- **pending**: 待开始
- **in_progress**: 进行中
- **completed**: 已完成
- **cancelled**: 已取消
- **blocked**: 被阻塞
- **review**: 待审核

### 任务优先级
- **low**: 低优先级
- **medium**: 中优先级
- **high**: 高优先级
- **critical**: 紧急

### 任务类型
- **feature**: 功能开发
- **bug**: 缺陷修复
- **improvement**: 改进优化
- **research**: 研究调研
- **maintenance**: 维护任务

## 业务逻辑测试

### 任务树结构规则
1. **层级限制**: 最大支持5层任务嵌套
2. **循环检测**: 防止任务间循环依赖
3. **移动限制**: 不能将父任务移动到子任务下
4. **删除规则**: 删除父任务时处理子任务

### 状态同步规则
1. **向上同步**: 所有子任务完成时，父任务自动完成
2. **向下同步**: 父任务取消时，子任务自动取消
3. **状态冲突**: 处理状态变更冲突情况
4. **进度计算**: 基于子任务完成度计算父任务进度

### 任务分解规则
1. **工时分配**: 子任务工时总和不超过父任务
2. **截止时间**: 子任务截止时间不晚于父任务
3. **责任人**: 子任务可以分配给不同责任人
4. **依赖关系**: 子任务间可以建立依赖关系

## 性能测试计划

### 查询性能
- **单任务查询**: < 10ms
- **任务树查询**: < 100ms (5层深度)
- **复杂查询**: < 200ms (多条件过滤)
- **统计查询**: < 150ms

### 树操作性能
- **构建任务树**: < 200ms (1000个任务)
- **移动任务**: < 50ms
- **状态同步**: < 100ms (100个子任务)
- **进度计算**: < 50ms

## 运行测试

```bash
# 运行任务模块所有测试
npm test -- test/business/growth/task

# 运行特定服务测试
npm test -- test/business/growth/task/unit/task.service.spec.ts
npm test -- test/business/growth/task/unit/task-tree.service.spec.ts

# 运行控制器测试
npm test -- test/business/growth/task/unit/task.controller.spec.ts

# 运行集成测试
npm test -- test/business/growth/task/integration

# 生成覆盖率报告
npm test -- test/business/growth/task --coverage
```

## 开发优先级

### 高优先级 (第1周)
1. **TaskTestFactory**: 创建测试数据工厂
2. **TaskService测试**: 基础CRUD操作测试
3. **TaskTreeService测试**: 树结构操作测试

### 中优先级 (第2周)
1. **TaskStatusService测试**: 状态管理测试
2. **TaskController测试**: API端点测试
3. **基础集成测试**: 端到端基础功能测试

### 低优先级 (第3周)
1. **复杂业务逻辑测试**: 任务分解和依赖测试
2. **性能测试**: 大数据量和复杂树结构测试
3. **边界情况测试**: 异常情况和错误处理测试

## 注意事项

1. **数据一致性**: 确保任务树结构的数据一致性
2. **循环依赖**: 防止任务间形成循环依赖
3. **并发安全**: 多用户同时操作任务树的安全性
4. **性能优化**: 深层任务树的查询性能优化
5. **状态同步**: 确保父子任务状态同步的准确性

## 扩展计划

### 高级功能测试
- [ ] **任务模板**: 任务模板功能测试
- [ ] **任务依赖**: 任务间依赖关系测试
- [ ] **工时统计**: 任务工时统计测试
- [ ] **甘特图**: 任务甘特图数据测试

### 集成功能测试
- [ ] **与Goal模块集成**: 目标分解为任务测试
- [ ] **与Todo模块集成**: 任务分解为待办事项测试
- [ ] **与Calendar模块集成**: 任务日程安排测试

---

*最后更新时间: 2024年12月* 