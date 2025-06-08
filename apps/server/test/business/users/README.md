# 用户模块测试

## 目录结构

```
test/business/users/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── user.service.spec.ts     # 用户服务测试
│   └── user.controller.spec.ts  # 用户控制器测试
├── integration/                 # 集成测试
└── utils/                       # 测试工具
    └── user.factory.ts          # 用户测试数据工厂
```

## 功能覆盖

### 用户服务 (UserService)
- ✅ 创建用户
- ✅ 查询所有用户
- ✅ 根据ID查询用户
- ✅ 更新用户信息
- ✅ 删除用户
- ✅ 边界值测试
- ✅ 性能测试

### 用户控制器 (UserController)
- ✅ POST /users - 创建用户
- ✅ GET /users - 获取所有用户
- ✅ GET /users/:id - 根据ID获取用户
- ✅ PUT /users/:id - 更新用户
- ✅ DELETE /users/:id - 删除用户
- ✅ 错误处理测试

## 测试工具

### UserTestFactory
提供用户测试数据的创建方法：

```typescript
// 创建基础用户DTO
const userDto = UserTestFactory.createBasicUserDto();

// 创建用户实体
const user = UserTestFactory.createUserEntity();

// 创建更新用户DTO
const updateDto = UserTestFactory.createUpdateUserDto();

// 创建多个用户
const users = UserTestFactory.createMultipleUsers(5);

// 创建边界值测试数据
const boundaryData = UserTestFactory.createBoundaryTestData();
```

## 运行测试

```bash
# 运行用户模块所有测试
npm test -- test/business/users

# 运行用户服务测试
npm test -- test/business/users/unit/user.service.spec.ts

# 运行用户控制器测试
npm test -- test/business/users/unit/user.controller.spec.ts

# 生成覆盖率报告
npm test -- test/business/users --coverage
```

## 测试数据

### 基础测试数据
- 用户名: testuser
- 密码: password123
- 姓名: 测试用户

### 边界值测试
- 最小长度字段
- 最大长度字段
- 特殊字符处理

### 性能测试
- 大量用户创建测试 (1000个用户)
- 执行时间验证 (< 1秒)

## 注意事项

1. **数据隔离**: 每个测试用例都会清理用户数据
2. **模拟服务**: 控制器测试使用模拟的UserService
3. **边界测试**: 包含最小值、最大值和特殊字符测试
4. **性能考虑**: 验证大量数据处理的性能表现 