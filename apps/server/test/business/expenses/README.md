# 支出管理模块测试

## 概述

支出管理模块提供完整的财务管理功能测试，包括交易管理、预算管理和统计分析。

## 目录结构

```
test/business/expenses/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   └── expenses.service.spec.ts # 支出服务测试
├── integration/                 # 集成测试
└── utils/                       # 测试工具
    └── expenses.factory.ts      # 支出测试数据工厂
```

## 功能覆盖

### 交易管理 (Transaction Management)
- ✅ **创建交易**: 收入和支出交易创建
- ✅ **查询交易**: 按日期排序的交易列表
- ✅ **交易类型**: 支持收入(income)和支出(expense)
- ✅ **预算关联**: 支出交易自动更新相关预算

### 预算管理 (Budget Management)
- ✅ **创建预算**: 按分类创建预算计划
- ✅ **查询预算**: 获取所有预算信息
- ✅ **预算更新**: 支出时自动更新已用金额
- ✅ **预算状态**: 跟踪预算使用情况

### 统计分析 (Statistics)
- ✅ **收支统计**: 总收入、总支出、净收入计算
- ✅ **分类统计**: 按支出分类汇总
- ✅ **空数据处理**: 无交易时的统计处理
- ✅ **单一类型**: 仅收入或仅支出的统计

## 测试工具

### ExpensesTestFactory
提供支出管理测试数据的创建方法：

```typescript
// 创建基础交易DTO
const transactionDto = ExpensesTestFactory.createBasicTransactionDto();

// 创建支出交易
const expenseTransaction = ExpensesTestFactory.createExpenseTransaction();

// 创建收入交易
const incomeTransaction = ExpensesTestFactory.createIncomeTransaction();

// 创建预算DTO
const budgetDto = ExpensesTestFactory.createBasicBudgetDto();

// 创建预算实体
const budget = ExpensesTestFactory.createBudgetEntity();

// 创建边界值测试数据
const boundaryData = ExpensesTestFactory.createBoundaryTestData();
```

## 测试用例详情

### 服务层测试 (ExpensesService)

#### 交易相关测试
```typescript
describe('createTransaction', () => {
  // 基础交易创建
  // 支出交易创建并更新预算
  // 收入交易创建不更新预算
});

describe('findAllTransactions', () => {
  // 按日期排序返回所有交易
  // 无交易时返回空数组
});
```

#### 预算相关测试
```typescript
describe('createBudget', () => {
  // 创建新预算
  // 使用自定义数据创建预算
});

describe('findAllBudgets', () => {
  // 返回所有预算
  // 无预算时返回空数组
});
```

#### 统计相关测试
```typescript
describe('getStats', () => {
  // 计算正确的统计数据
  // 处理空交易情况
  // 处理仅收入交易
  // 处理仅支出交易
});
```

## 运行测试

```bash
# 运行支出模块所有测试
npm test -- test/business/expenses

# 运行支出服务测试
npm test -- test/business/expenses/unit/expenses.service.spec.ts

# 生成覆盖率报告
npm test -- test/business/expenses --coverage

# 运行特定测试套件
npm test -- test/business/expenses --testNamePattern="createTransaction"
```

## 测试数据

### 基础测试数据
- **交易金额**: 100.00
- **交易描述**: "测试交易"
- **交易分类**: "食物"
- **交易类型**: expense/income

### 预算测试数据
- **预算分类**: "食物"
- **预算金额**: 500.00
- **已用金额**: 0.00

### 边界值测试
- **最小金额**: 0.01
- **最大金额**: 999999.99
- **特殊字符**: 描述中的特殊字符处理
- **空值处理**: 可选字段的空值测试

## 业务逻辑验证

### 预算更新逻辑
1. **支出交易**: 创建支出交易时，自动查找对应分类的预算
2. **预算更新**: 将交易金额累加到预算的已用金额
3. **收入交易**: 创建收入交易时，不影响预算

### 统计计算逻辑
1. **总收入**: 所有income类型交易金额之和
2. **总支出**: 所有expense类型交易金额之和
3. **净收入**: 总收入 - 总支出
4. **分类统计**: 按category分组统计支出金额

## 错误处理测试

### Repository错误处理
- ✅ **数据库连接错误**: 模拟Repository抛出异常
- ✅ **数据保存失败**: 验证错误传播机制
- ✅ **查询失败**: 处理查询异常情况

### 数据验证
- ✅ **金额验证**: 负数和零值处理
- ✅ **类型验证**: 无效的交易类型
- ✅ **必填字段**: 缺少必要字段的处理

## 性能测试

### 大数据量处理
- **批量交易**: 处理大量交易数据的性能
- **统计计算**: 大数据集的统计计算效率
- **内存使用**: 避免内存泄漏和过度使用

### 执行时间基准
- **单个交易创建**: < 10ms
- **统计计算**: < 50ms
- **批量查询**: < 100ms

## 注意事项

1. **数据隔离**: 每个测试用例都会清理交易和预算数据
2. **模拟服务**: 使用模拟的Repository进行单元测试
3. **异步处理**: 正确处理Promise和async/await
4. **边界测试**: 包含金额边界值和特殊情况测试
5. **业务逻辑**: 验证预算更新和统计计算的正确性

## 扩展计划

### 待添加功能测试
- [ ] **控制器测试**: ExpensesController的API测试
- [ ] **集成测试**: 端到端的财务管理流程测试
- [ ] **并发测试**: 多用户同时操作的并发安全性
- [ ] **数据导入导出**: CSV/Excel文件处理测试

### 性能优化测试
- [ ] **查询优化**: 大数据量查询性能测试
- [ ] **缓存测试**: 统计数据缓存机制测试
- [ ] **分页测试**: 大量交易数据的分页处理

---

*最后更新时间: 2024年12月* 