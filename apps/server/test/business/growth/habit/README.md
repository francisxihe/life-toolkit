# 习惯功能测试

## 目录结构

```
test/business/growth/habit/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── habit.simple.spec.ts     # 基础功能测试
│   ├── habit.controller.spec.ts # 控制器测试
│   ├── habit-log.controller.spec.ts # 日志控制器测试
│   └── habit.service.enhanced.spec.ts # 增强服务测试
├── integration/                 # 集成测试
│   └── habit.integration.spec.ts # 集成测试
└── utils/                       # 测试工具
    ├── habit.factory.ts         # 测试数据工厂
    ├── habit.test-utils.ts      # 测试工具类
    └── run-tests.ts             # 测试运行脚本
```

## 运行测试

### 运行所有习惯相关测试
```bash
npm test -- test/business/growth/habit
```

### 运行单元测试
```bash
npm test -- test/business/growth/habit/unit
```

### 运行集成测试
```bash
npm test -- test/business/growth/habit/integration
```

### 运行特定测试文件
```bash
npm test -- test/business/growth/habit/unit/habit.simple.spec.ts
```

### 运行测试并生成覆盖率报告
```bash
npm test -- test/business/growth/habit --coverage
```

### 使用测试运行脚本
```bash
# 运行所有测试
node test/business/growth/habit/utils/run-tests.ts

# 只运行单元测试
node test/business/growth/habit/utils/run-tests.ts --type=unit

# 只运行集成测试
node test/business/growth/habit/utils/run-tests.ts --type=integration

# 生成覆盖率报告
node test/business/growth/habit/utils/run-tests.ts --coverage
```

## 测试文件说明

### 单元测试

#### habit.simple.spec.ts
- 测试工厂类和工具类的基础功能
- 验证测试数据生成的正确性
- 边界值测试和性能测试

#### habit.controller.spec.ts
- 测试习惯控制器的所有端点
- 验证请求参数处理和响应格式
- 测试错误处理和异常情况

#### habit-log.controller.spec.ts
- 测试习惯日志控制器功能
- 验证日志的CRUD操作
- 测试日期范围查询和过滤

#### habit.service.enhanced.spec.ts
- 测试习惯服务的高级功能
- 验证业务逻辑和数据处理
- 测试与其他模块的交互

### 集成测试

#### habit.integration.spec.ts
- 端到端的API测试
- 验证完整的请求-响应流程
- 测试数据库操作和事务

### 测试工具

#### habit.factory.ts
- 提供测试数据生成工厂方法
- 支持创建各种类型的习惯和日志数据
- 支持批量数据生成和自定义配置

#### habit.test-utils.ts
- 提供测试辅助工具和断言方法
- 包含模拟对象创建和配置
- 提供性能测试和清理工具

#### run-tests.ts
- 自定义测试运行脚本
- 支持分类运行和报告生成
- 提供测试环境管理

## 最佳实践

### 1. 测试隔离
- 每个测试用例都应该独立运行
- 使用 `beforeEach` 和 `afterEach` 进行环境清理
- 避免测试之间的数据依赖

### 2. 模拟对象
- 使用工厂类生成一致的测试数据
- 合理使用 Mock 对象避免外部依赖
- 保持模拟对象的简单和可维护

### 3. 断言策略
- 使用具体的断言而不是通用的 `toBeTruthy`
- 验证关键字段而不是整个对象
- 提供清晰的错误消息

### 4. 性能考虑
- 避免在测试中进行真实的网络请求
- 使用内存数据库进行集成测试
- 合理控制测试数据的规模

### 5. 维护性
- 保持测试代码的简洁和可读性
- 定期更新测试用例以反映业务变化
- 使用描述性的测试名称

## 故障排除

### 常见问题

1. **导入路径错误**
   - 检查相对路径是否正确
   - 确认文件是否存在于预期位置

2. **模拟对象未正确配置**
   - 验证 Mock 方法的返回值设置
   - 检查异步操作的处理

3. **测试数据冲突**
   - 确保每个测试使用独立的数据
   - 检查测试清理是否完整

4. **超时问题**
   - 检查异步操作的等待时间
   - 验证数据库连接和清理

### 调试技巧

1. 使用 `--verbose` 参数获取详细输出
2. 添加 `console.log` 进行调试（记得清理）
3. 使用 `--detectOpenHandles` 检查资源泄漏
4. 单独运行失败的测试用例

## 贡献指南

### 添加新测试

1. 确定测试类型（单元/集成）
2. 选择合适的目录放置测试文件
3. 使用现有的工厂类和工具类
4. 遵循现有的命名和结构约定
5. 更新相关文档

### 修改现有测试

1. 理解测试的目的和覆盖范围
2. 保持向后兼容性
3. 更新相关的工具类和工厂方法
4. 验证所有相关测试仍然通过

### 代码审查

1. 检查测试覆盖率是否充分
2. 验证测试的独立性和可重复性
3. 确认错误处理和边界情况
4. 检查性能和资源使用

---

## 更新日志

- **2024-06-08**: 重新组织测试目录结构，分离单元测试和集成测试
- **2024-06-08**: 修复导入路径问题，确保测试可以正常运行
- **2024-06-08**: 创建测试文档和使用指南 