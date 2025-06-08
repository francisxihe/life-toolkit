# Life Toolkit 服务端测试文档

## 概述

本项目为 Life Toolkit 应用提供完整的测试覆盖，包括单元测试、集成测试和端到端测试。

## 测试架构

### 目录结构

```
test/
├── README.md                    # 测试总文档
├── SUMMARY.md                   # 测试总结报告
├── run-all-tests.ts            # 测试运行脚本
├── setup.ts                    # 测试环境设置
├── global-setup.ts             # 全局测试设置
├── global-teardown.ts          # 全局测试清理
└── business/                   # 业务模块测试
    ├── growth/                 # 成长模块
    │   └── habit/             # 习惯管理
    ├── users/                  # 用户模块
    ├── expenses/               # 支出管理模块
    ├── auth/                   # 认证模块
    ├── calendar/               # 日历模块
    ├── ai/                     # AI模块
    └── excel/                  # Excel模块
```

每个业务模块包含：
- `unit/` - 单元测试
- `integration/` - 集成测试
- `utils/` - 测试工具和工厂
- `README.md` - 模块专门文档

## 运行测试

### 运行所有测试
```bash
# 使用测试运行器
npx ts-node test/run-all-tests.ts

# 或直接使用npm
npm test
```

### 运行特定模块测试
```bash
# 运行用户模块测试
npx ts-node test/run-all-tests.ts users

# 运行习惯模块测试
npx ts-node test/run-all-tests.ts growth/habit

# 运行支出模块测试
npx ts-node test/run-all-tests.ts expenses
```

### 生成覆盖率报告
```bash
# 生成覆盖率报告
npx ts-node test/run-all-tests.ts --coverage

# 或直接使用Jest
npm test -- --coverage
```

### 运行特定测试文件
```bash
# 运行用户服务测试
npm test -- test/business/users/unit/user.service.spec.ts

# 运行习惯控制器测试
npm test -- test/business/growth/habit/unit/habit.controller.spec.ts
```

## 测试配置

### Jest 配置
项目使用 Jest 作为测试框架，配置文件位于 `jest.config.js`：

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 测试环境设置
- **数据库**: 使用内存数据库进行测试
- **模拟服务**: 使用 Jest mocks 模拟外部依赖
- **数据隔离**: 每个测试用例都有独立的数据环境

## 测试最佳实践

### 1. 测试命名规范
- 使用描述性的测试名称
- 遵循 "should [expected behavior] when [condition]" 格式
- 使用中文描述复杂业务逻辑

### 2. 测试数据管理
- 使用工厂模式创建测试数据
- 提供默认值和可覆盖的参数
- 创建边界值和异常情况的测试数据

### 3. 模拟和存根
- 模拟外部依赖（数据库、API等）
- 使用 Jest mocks 进行依赖注入
- 确保测试的独立性和可重复性

### 4. 断言策略
- 使用具体的断言而不是通用的 toBeTruthy
- 验证返回值的结构和内容
- 检查副作用（如数据库更新）

## 持续集成

测试集成到 CI/CD 流程中：

1. **代码提交时**: 运行相关模块的单元测试
2. **Pull Request**: 运行完整的测试套件
3. **部署前**: 运行所有测试并生成覆盖率报告

## 贡献指南

### 添加新的测试模块
1. 在 `test/business/` 下创建模块目录
2. 创建 `unit/`, `integration/`, `utils/` 子目录
3. 实现测试工厂类
4. 编写单元测试和集成测试
5. 创建模块专门的 README.md 文档
6. 更新 `run-all-tests.ts` 中的模块列表
7. 更新 `SUMMARY.md` 总结报告

### 测试代码规范
- 遵循项目的 TypeScript 规范
- 使用 ESLint 和 Prettier 格式化代码
- 添加适当的注释和文档
- 确保测试覆盖率达到 80% 以上

## 故障排除

### 常见问题

1. **模块路径错误**
   - 检查 `moduleNameMapper` 配置
   - 确认相对路径的正确性

2. **TypeORM 测试问题**
   - 使用 `getRepositoryToken` 进行依赖注入
   - 正确模拟 Repository 方法

3. **异步测试问题**
   - 使用 `async/await` 处理异步操作
   - 正确处理 Promise 的 resolve/reject

4. **内存泄漏**
   - 在 `afterEach` 中清理模拟数据
   - 正确关闭数据库连接

## 联系方式

如有测试相关问题，请联系开发团队或在项目仓库中提交 Issue。 