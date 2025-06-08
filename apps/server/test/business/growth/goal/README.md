# 目标管理模块测试

## 概述

目标管理模块提供个人和团队目标设定与追踪功能的测试，包括目标CRUD操作、目标树结构管理、进度追踪和目标分解。

## 目录结构

```
test/business/growth/goal/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── goal.service.spec.ts     # 目标服务测试 (待开发)
│   ├── goal-tree.service.spec.ts # 目标树服务测试 (待开发)
│   ├── goal-status.service.spec.ts # 目标状态服务测试 (待开发)
│   └── goal.controller.spec.ts  # 控制器测试 (待开发)
├── integration/                 # 集成测试
│   └── goal.integration.spec.ts # 集成测试 (待开发)
└── utils/                       # 测试工具
    └── goal.factory.ts          # 测试数据工厂 (待开发)
```

## 当前状态

### 📋 计划中
- **测试数据工厂**: GoalTestFactory设计和实现
- **单元测试**: 所有服务和控制器的单元测试
- **集成测试**: 端到端目标管理测试
- **进度追踪测试**: 目标进度计算和更新测试

## 功能覆盖计划

### 基础目标管理
- [ ] **创建目标**: 创建新的目标
- [ ] **查询目标**: 按条件查询目标
- [ ] **更新目标**: 修改目标信息
- [ ] **删除目标**: 删除目标及子目标
- [ ] **批量操作**: 批量创建、更新、删除

### 目标树结构
- [ ] **父子关系**: 建立目标父子关系
- [ ] **层级查询**: 查询目标层级结构
- [ ] **子目标管理**: 子目标的增删改查
- [ ] **目标分解**: 大目标分解为小目标
- [ ] **层级限制**: 目标层级深度限制

### 进度追踪
- [ ] **进度更新**: 手动和自动进度更新
- [ ] **进度计算**: 基于子目标的进度计算
- [ ] **里程碑**: 目标里程碑设定和追踪
- [ ] **完成度统计**: 目标完成度统计分析

### 目标状态管理
- [ ] **状态流转**: 目标状态变更
- [ ] **状态同步**: 父子目标状态同步
- [ ] **状态统计**: 按状态统计目标
- [ ] **状态历史**: 状态变更历史记录

## 服务层分析

### GoalService (主服务)
```typescript
// 主要功能测试
describe('GoalService', () => {
  // 目标CRUD操作
  // 目标分解逻辑
  // 进度计算
  // 目标达成判断
});
```

### GoalTreeService (树结构服务)
```typescript
// 树结构测试
describe('GoalTreeService', () => {
  // 父子关系建立
  // 层级查询
  // 目标分解
  // 层级限制
});
```

### GoalStatusService (状态服务)
```typescript
// 状态管理测试
describe('GoalStatusService', () => {
  // 状态流转
  // 状态同步
  // 状态验证
});
```

## 测试工具计划

### GoalTestFactory (待开发)
提供目标管理测试数据的创建方法：

```typescript
// 创建基础目标DTO
const goalDto = GoalTestFactory.createBasicGoalDto();

// 创建目标实体
const goal = GoalTestFactory.createGoalEntity();

// 创建长期目标
const longTermGoal = GoalTestFactory.createLongTermGoal();

// 创建短期目标
const shortTermGoal = GoalTestFactory.createShortTermGoal();

// 创建目标树
const goalTree = GoalTestFactory.createGoalTree(3); // 3层深度

// 创建不同类型的目标
const personalGoal = GoalTestFactory.createPersonalGoal();
const careerGoal = GoalTestFactory.createCareerGoal();
const healthGoal = GoalTestFactory.createHealthGoal();

// 创建不同状态的目标
const activeGoal = GoalTestFactory.createActiveGoal();
const completedGoal = GoalTestFactory.createCompletedGoal();
const pausedGoal = GoalTestFactory.createPausedGoal();

// 创建批量目标
const goals = GoalTestFactory.createMultipleGoals(10);

// 创建边界值测试数据
const boundaryData = GoalTestFactory.createBoundaryTestData();
```

## 计划中的测试用例

### 目标服务测试 (GoalService)

#### 基础CRUD测试
```typescript
describe('GoalService', () => {
  describe('create', () => {
    // 创建根目标
    // 创建子目标
    // 验证必填字段
    // 处理目标期限
  });

  describe('findAll', () => {
    // 查询所有目标
    // 按类型查询
    // 按状态过滤
    // 分页查询
  });

  describe('findOne', () => {
    // 根据ID查询
    // 包含子目标查询
    // 处理不存在的记录
  });

  describe('update', () => {
    // 更新目标信息
    // 更新进度
    // 处理并发更新
  });

  describe('delete', () => {
    // 删除叶子目标
    // 删除父目标及子目标
    // 软删除处理
  });
});
```

#### 进度管理测试
```typescript
describe('ProgressManagement', () => {
  describe('updateProgress', () => {
    // 手动更新进度
    // 自动计算进度
    // 进度验证
  });

  describe('calculateProgress', () => {
    // 基于子目标计算进度
    // 权重计算
    // 完成度统计
  });

  describe('checkCompletion', () => {
    // 目标完成检查
    // 自动状态更新
    // 完成通知
  });
});
```

### 目标树服务测试 (GoalTreeService)

#### 树结构操作测试
```typescript
describe('GoalTreeService', () => {
  describe('buildTree', () => {
    // 构建目标树
    // 处理循环依赖
    // 层级深度限制
  });

  describe('decomposeGoal', () => {
    // 目标分解为子目标
    // 分解规则验证
    // 进度权重分配
  });

  describe('getChildren', () => {
    // 获取直接子目标
    // 获取所有后代目标
    // 按条件过滤
  });

  describe('getAncestors', () => {
    // 获取父级路径
    // 根目标查找
    // 层级计算
  });
});
```

### 目标状态服务测试 (GoalStatusService)

#### 状态管理测试
```typescript
describe('GoalStatusService', () => {
  describe('changeStatus', () => {
    // 单个目标状态变更
    // 父子目标状态同步
    // 状态变更权限
  });

  describe('syncChildrenStatus', () => {
    // 子目标状态同步
    // 状态冲突处理
    // 批量状态更新
  });

  describe('getStatusStatistics', () => {
    // 状态统计
    // 按时间统计
    // 按类型统计
  });
});
```

### 控制器测试 (GoalController)

#### API端点测试
```typescript
describe('GoalController', () => {
  describe('POST /goals', () => {
    // 创建目标接口
    // 参数验证
    // 权限验证
  });

  describe('GET /goals', () => {
    // 查询目标接口
    // 树形结构返回
    // 分页和过滤
  });

  describe('GET /goals/:id/tree', () => {
    // 获取目标树接口
    // 层级深度控制
    // 子目标展开
  });

  describe('PUT /goals/:id/progress', () => {
    // 更新进度接口
    // 进度验证
    // 自动计算
  });

  describe('POST /goals/:id/decompose', () => {
    // 目标分解接口
    // 分解规则验证
    // 子目标创建
  });

  describe('DELETE /goals/:id', () => {
    // 删除目标接口
    // 级联删除确认
    // 权限验证
  });
});
```

## 测试数据设计

### 基础测试数据
- **标题**: "测试目标"
- **描述**: "这是一个测试目标"
- **类型**: personal
- **状态**: active
- **开始时间**: 当前时间
- **目标期限**: 3个月后
- **当前进度**: 0%
- **目标值**: 100

### 目标类型
- **personal**: 个人目标
- **career**: 职业目标
- **health**: 健康目标
- **financial**: 财务目标
- **learning**: 学习目标
- **relationship**: 人际关系目标

### 目标状态
- **draft**: 草稿
- **active**: 进行中
- **completed**: 已完成
- **paused**: 已暂停
- **cancelled**: 已取消
- **overdue**: 已逾期

### 目标优先级
- **low**: 低优先级
- **medium**: 中优先级
- **high**: 高优先级
- **critical**: 关键目标

## 业务逻辑测试

### 目标树结构规则
1. **层级限制**: 最大支持4层目标嵌套
2. **循环检测**: 防止目标间循环依赖
3. **分解规则**: 子目标总和不超过父目标
4. **时间约束**: 子目标期限不晚于父目标

### 进度计算规则
1. **权重计算**: 基于子目标权重计算总进度
2. **自动更新**: 子目标完成时自动更新父目标进度
3. **完成判断**: 进度达到100%时自动标记完成
4. **逾期处理**: 超过期限未完成的目标标记逾期

### 状态同步规则
1. **向上同步**: 所有子目标完成时，父目标自动完成
2. **向下同步**: 父目标暂停时，子目标自动暂停
3. **状态冲突**: 处理状态变更冲突情况
4. **历史记录**: 记录所有状态变更历史

## 性能测试计划

### 查询性能
- **单目标查询**: < 10ms
- **目标树查询**: < 100ms (4层深度)
- **复杂查询**: < 200ms (多条件过滤)
- **统计查询**: < 150ms

### 进度计算性能
- **单目标进度**: < 5ms
- **树形进度计算**: < 50ms (100个子目标)
- **批量进度更新**: < 200ms (1000个目标)

## 运行测试

```bash
# 运行目标模块所有测试
npm test -- test/business/growth/goal

# 运行特定服务测试
npm test -- test/business/growth/goal/unit/goal.service.spec.ts
npm test -- test/business/growth/goal/unit/goal-tree.service.spec.ts

# 运行控制器测试
npm test -- test/business/growth/goal/unit/goal.controller.spec.ts

# 运行集成测试
npm test -- test/business/growth/goal/integration

# 生成覆盖率报告
npm test -- test/business/growth/goal --coverage
```

## 开发优先级

### 高优先级 (第1周)
1. **GoalTestFactory**: 创建测试数据工厂
2. **GoalService测试**: 基础CRUD操作测试
3. **进度计算测试**: 进度更新和计算逻辑测试

### 中优先级 (第2周)
1. **GoalTreeService测试**: 目标树结构测试
2. **GoalStatusService测试**: 状态管理测试
3. **GoalController测试**: API端点测试

### 低优先级 (第3周)
1. **复杂业务逻辑测试**: 目标分解和同步测试
2. **性能测试**: 大数据量和复杂树结构测试
3. **集成测试**: 端到端目标管理测试

## 注意事项

1. **数据一致性**: 确保目标树结构和进度的数据一致性
2. **时间处理**: 正确处理目标期限和时区问题
3. **进度精度**: 确保进度计算的精确性
4. **并发安全**: 多用户同时操作目标的安全性
5. **状态同步**: 确保父子目标状态同步的准确性

## 扩展计划

### 高级功能测试
- [ ] **目标模板**: 目标模板功能测试
- [ ] **目标提醒**: 目标提醒和通知测试
- [ ] **目标分析**: 目标达成分析测试
- [ ] **目标报告**: 目标进度报告测试

### 集成功能测试
- [ ] **与Task模块集成**: 目标分解为任务测试
- [ ] **与Habit模块集成**: 目标关联习惯测试
- [ ] **与Calendar模块集成**: 目标时间规划测试

---

*最后更新时间: 2024年12月*