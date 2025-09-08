---
trigger: model_decision
description: Controller层开发规范总览
globs:
---
# Controller 层开发规范 - 分层架构总览

## 📋 概述

Controller 层采用新的分层架构设计，将核心业务逻辑与适配层分离，提高代码复用性和可维护性。

## 🏗️ 分层架构

### 架构层次
```
Client Request (Web/Desktop)
    ↓
Adapter Controller (胶水层)
    ↓
Business Controller (核心业务层)
    ↓
Service (业务逻辑)
    ↓
Repository (数据访问)
    ↓
Database
    ↓
Client Response
```

### 层次职责

#### 1. Adapter Controller (胶水层)
**位置**: `apps/server/src/business/` 和 `apps/desktop/src/database/growth/`

**职责**:
- 适配不同平台的接口差异
- 平台特定的参数验证和转换
- 调用核心业务控制器
- 处理平台特定的异常和响应格式

#### 2. Business Controller (核心业务层)
**位置**: `packages/business/server/src/`

**职责**:
- 核心业务逻辑处理
- 统一的VO↔DTO数据转换
- 标准化的异常处理
- 业务规则验证

#### 3. Service & Repository (数据层)
**位置**: `packages/business/server/src/`

**职责**:
- 业务逻辑实现
- 数据访问和持久化
- 事务管理

## 🎯 模板体系

### 三个层次的模板

#### 1. Business Controller Template (核心业务层)
- **位置**: `packages/business/server/src/{module}/{module}.controller.ts`
- **职责**: 核心业务逻辑、VO↔DTO转换、异常处理
- **详细规范**: 参见 [`controller-business.mdc`](./controller-business.mdc)

#### 2. Server Adapter Controller Template (Server适配层)
- **位置**: `apps/server/src/business/{module}/{module}.controller.ts`
- **职责**: HTTP接口适配、路由定义、参数验证
- **详细规范**: 参见 [`controller-server.mdc`](./controller-server.mdc)

#### 3. Desktop Adapter Controller Template (Desktop适配层)
- **位置**: `apps/desktop/src/database/growth/{module}.controller.ts`
- **职责**: IPC接口适配、Electron异步处理
- **详细规范**: 参见 [`controller-desktop.mdc`](./controller-desktop.mdc)

### 模板选择指南

| 开发场景 | 推荐模板 | 说明 |
|---------|---------|-----|
| 核心业务逻辑开发 | Business Controller | 实现业务规则、数据转换 |
| Web API开发 | Server Adapter Controller | 提供HTTP REST接口 |
| 桌面应用开发 | Desktop Adapter Controller | 处理IPC异步调用 |
| 跨平台功能开发 | Business + Adapter | 先开发核心，再适配平台 |

## 📁 文件结构总览

```
packages/business/server/src/{module}/
├── {module}.controller.ts         # 核心业务控制器
├── {module}.service.ts           # 业务服务
├── dto/                          # DTO 类包含内置映射方法
└── {module}.repository.ts        # 数据仓储

apps/server/src/business/{module}/
├── {module}.controller.ts        # Server适配控制器
└── {module}.module.ts           # NestJS模块定义

apps/desktop/src/database/growth/
├── {module}.controller.ts       # Desktop适配控制器
└── index.ts                     # 模块导出和IPC注册
```

## 📝 开发流程

### 开发步骤总览

1. **分析需求** - 确定功能是否需要跨平台支持
2. **设计VO/DTO** - 定义数据传输对象
3. **开发Business Controller** - 实现核心业务逻辑
4. **开发Server Adapter** - 提供HTTP REST API
5. **开发Desktop Adapter** - 提供IPC异步接口
6. **配置依赖注入** - 注册控制器和服务
7. **测试验证** - 确保各层功能正常

### 最佳实践

#### 1. 优先开发核心业务
```typescript
// 推荐：先开发核心业务逻辑
export class TodoController {
  async create(createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoWithoutRelationsVo> {
    // 核心业务逻辑
    const createDto = CreateTodoDto.importVo(createVo);
    const dto = await this.todoService.create(createDto);
    return dto.exportVo();
  }
}
```

#### 2. 适配层职责单一
```typescript
// 适配层只做适配，不做业务逻辑
@Controller("todo")
export class TodoServerController {
  @Post("create")
  async create(@Body() createVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoWithoutRelationsVo> {
    // 直接调用核心业务控制器
    return await this.todoController.create(createVo);
  }
}
```

## 📚 相关文档

- **[`controller-business.mdc`](./controller-business.mdc)** - Business Controller 开发规范
- **[`controller-server.mdc`](./controller-server.mdc)** - Server Adapter Controller 开发规范
- **[`controller-desktop.mdc`](./controller-desktop.mdc)** - Desktop Adapter Controller 开发规范

## 🔄 架构优势

### 分层架构的好处

1. **代码复用**: 核心业务逻辑可以被多个平台共享
2. **职责分离**: 各层职责清晰，易于维护和测试
3. **平台适配**: 轻松适配不同平台的接口差异
4. **版本管理**: 核心逻辑与适配层独立演进

### 开发流程优化

1. **并行开发**: 核心业务与平台适配可以并行开发
2. **统一测试**: 核心逻辑的测试可以被复用
3. **快速扩展**: 新平台只需开发适配层即可

### 部署灵活性

1. **独立部署**: 各层可以独立部署和扩展
2. **版本兼容**: 适配层可以平滑升级而不影响核心逻辑
3. **故障隔离**: 某一层的故障不会影响整个系统

---

## 📋 版本信息

- **模板版本**: v3.0 (分层架构)
- **适配NestJS版本**: ^10.0.0
- **适配Electron版本**: ^25.0.0
- **TypeScript版本**: ^5.0.0

*此文档为分层架构Controller开发规范总览，详细模板请参考各子文档。*