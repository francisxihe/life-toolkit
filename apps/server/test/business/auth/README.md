# 认证模块测试

## 概述

认证模块提供用户身份验证和授权功能的测试，包括JWT令牌管理和用户验证。

## 目录结构

```
test/business/auth/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   └── auth.service.spec.ts     # 认证服务测试
├── integration/                 # 集成测试
└── utils/                       # 测试工具
    └── auth.factory.ts          # 认证测试数据工厂
```

## 功能覆盖

### JWT令牌管理 (JWT Token Management)
- ✅ **令牌生成**: 生成访问令牌(access token)
- ✅ **令牌验证**: 验证令牌的有效性
- ✅ **令牌解析**: 从令牌中提取用户信息
- ✅ **令牌过期**: 处理过期令牌的情况

### 用户验证 (User Authentication)
- ✅ **用户登录**: 验证用户凭据
- ✅ **密码验证**: 密码哈希和验证
- ✅ **用户授权**: 检查用户权限
- ✅ **会话管理**: 用户会话状态管理

### 错误处理 (Error Handling)
- ✅ **无效凭据**: 处理错误的用户名或密码
- ✅ **令牌错误**: 处理无效或过期的令牌
- ✅ **权限不足**: 处理权限验证失败
- ✅ **服务异常**: 处理认证服务异常

## 测试工具

### AuthTestFactory
提供认证测试数据的创建方法：

```typescript
// 创建基础用户凭据
const credentials = AuthTestFactory.createBasicCredentials();

// 创建JWT载荷
const payload = AuthTestFactory.createJwtPayload();

// 创建访问令牌
const token = AuthTestFactory.createAccessToken();

// 创建用户实体
const user = AuthTestFactory.createUserEntity();

// 创建边界值测试数据
const boundaryData = AuthTestFactory.createBoundaryTestData();
```

## 测试用例详情

### 服务层测试 (AuthService)

#### JWT相关测试
```typescript
describe('generateAccessToken', () => {
  // 生成有效的访问令牌
  // 令牌包含正确的用户信息
  // 令牌具有正确的过期时间
});

describe('validateToken', () => {
  // 验证有效令牌
  // 拒绝无效令牌
  // 处理过期令牌
});
```

#### 用户验证测试
```typescript
describe('validateUser', () => {
  // 验证有效用户凭据
  // 拒绝无效用户名
  // 拒绝错误密码
});

describe('login', () => {
  // 成功登录返回令牌
  // 失败登录抛出异常
  // 记录登录尝试
});
```

## 运行测试

```bash
# 运行认证模块所有测试
npm test -- test/business/auth

# 运行认证服务测试
npm test -- test/business/auth/unit/auth.service.spec.ts

# 生成覆盖率报告
npm test -- test/business/auth --coverage

# 运行特定测试套件
npm test -- test/business/auth --testNamePattern="generateAccessToken"
```

## 测试数据

### 基础测试数据
- **用户名**: testuser
- **密码**: password123
- **用户ID**: 1
- **用户角色**: user

### JWT测试数据
- **密钥**: test-secret-key
- **过期时间**: 1小时
- **算法**: HS256
- **发行者**: life-toolkit

### 边界值测试
- **空用户名**: 处理空字符串用户名
- **空密码**: 处理空密码情况
- **长用户名**: 超长用户名处理
- **特殊字符**: 用户名中的特殊字符

## 安全测试

### 密码安全
- ✅ **密码哈希**: 验证密码正确哈希存储
- ✅ **盐值使用**: 确保使用随机盐值
- ✅ **哈希算法**: 使用安全的哈希算法
- ✅ **密码强度**: 验证密码复杂度要求

### 令牌安全
- ✅ **令牌签名**: 验证令牌正确签名
- ✅ **令牌过期**: 确保令牌有过期时间
- ✅ **令牌撤销**: 支持令牌撤销机制
- ✅ **令牌刷新**: 支持令牌刷新功能

### 攻击防护
- ✅ **暴力破解**: 防止密码暴力破解
- ✅ **令牌重放**: 防止令牌重放攻击
- ✅ **会话固定**: 防止会话固定攻击
- ✅ **CSRF保护**: 跨站请求伪造防护

## 性能测试

### 认证性能
- **令牌生成**: < 5ms
- **令牌验证**: < 3ms
- **密码验证**: < 10ms
- **用户查询**: < 20ms

### 并发测试
- **并发登录**: 支持多用户同时登录
- **令牌验证**: 高并发令牌验证性能
- **缓存效果**: 用户信息缓存性能

## 集成测试计划

### API端点测试
- [ ] **POST /auth/login**: 用户登录接口
- [ ] **POST /auth/logout**: 用户登出接口
- [ ] **POST /auth/refresh**: 令牌刷新接口
- [ ] **GET /auth/profile**: 获取用户信息接口

### 中间件测试
- [ ] **认证中间件**: JWT认证中间件测试
- [ ] **授权中间件**: 权限检查中间件测试
- [ ] **错误处理**: 认证错误处理中间件

## 错误处理测试

### 认证错误
- ✅ **用户不存在**: 处理不存在的用户
- ✅ **密码错误**: 处理错误的密码
- ✅ **账户锁定**: 处理被锁定的账户
- ✅ **账户禁用**: 处理被禁用的账户

### 令牌错误
- ✅ **令牌格式错误**: 处理格式不正确的令牌
- ✅ **令牌过期**: 处理过期的令牌
- ✅ **令牌签名错误**: 处理签名验证失败
- ✅ **令牌被撤销**: 处理已撤销的令牌

## 注意事项

1. **敏感信息**: 测试中不使用真实的密码和密钥
2. **数据隔离**: 每个测试用例都使用独立的测试数据
3. **模拟服务**: 使用模拟的用户服务和数据库
4. **安全测试**: 包含各种安全攻击场景的测试
5. **性能基准**: 验证认证操作的性能要求

## 扩展计划

### 待添加功能测试
- [ ] **多因素认证**: 2FA/MFA功能测试
- [ ] **OAuth集成**: 第三方登录测试
- [ ] **权限管理**: RBAC权限系统测试
- [ ] **审计日志**: 认证操作审计测试

### 安全增强测试
- [ ] **密码策略**: 密码复杂度和过期策略
- [ ] **账户锁定**: 登录失败锁定机制
- [ ] **IP限制**: IP白名单和黑名单
- [ ] **设备管理**: 设备绑定和管理

---

*最后更新时间: 2024年12月* 