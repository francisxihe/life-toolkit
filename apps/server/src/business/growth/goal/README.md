# Goal 模块

## 📋 概述

Goal 模块是 Life Toolkit 中的目标管理模块，提供目标的创建、查询、更新、删除以及状态管理功能。该模块支持树形结构的目标层级关系。

## 🏗️ 架构设计

### 分层架构
```
Controller (路由层)
    ↓
Service (业务逻辑层)
    ↓
Repository (数据访问层)
    ↓
Entity (数据实体层)
```

### 数据流向
```
VO (前端) ↔ Mapper ↔ DTO (传输) ↔ Service ↔ Repository ↔ Entity (数据库)
```

## 📁 文件结构

```
goal/
├── entities/                  # 实体定义
│   ├── goal.entity.ts        # 目标实体
│   ├── enum.ts               # 枚举定义
│   └── index.ts              # 导出文件
├── dto/                      # 数据传输对象
│   ├── goal-model.dto.ts     # 模型DTO
│   ├── goal-form.dto.ts      # 表单DTO
│   ├── goal-filter.dto.ts    # 过滤DTO
│   └── index.ts              # 导出文件
├── goal.controller.ts        # 控制器
├── goal.service.ts           # 业务服务
├── goal.repository.ts        # 数据仓库
├── goal-tree.service.ts      # 树形结构服务
├── goal.module.ts            # 模块定义
└── README.md                 # 文档
```

## 🔧 核心功能

### 基础CRUD操作
- **创建目标**: `POST /goal`
- **查询目标**: `GET /goal/:id`
- **更新目标**: `PUT /goal/:id`
- **删除目标**: `DELETE /goal/:id`
- **分页查询**: `GET /goal`

### 状态管理
- **完成目标**: `POST /goal/:id/done`
- **放弃目标**: `POST /goal/:id/abandon`
- **恢复目标**: `POST /goal/:id/restore`
- **批量完成**: `POST /goal/batch/done`

### 树形结构
- 支持父子目标关系
- 级联删除子目标
- 树形查询过滤

## 📊 数据模型

### 目标状态 (GoalStatus)
- `active`: 活跃状态
- `in_progress`: 进行中
- `completed`: 已完成
- `cancelled`: 已取消

### 目标类型 (GoalType)
- `objective`: 目标
- `key_result`: 关键结果

### 目标优先级 1-5

## 🔄 业务规则

### 状态转换规则
```
active/in_progress → completed (完成)
active/in_progress → cancelled (放弃)
cancelled → active (恢复)
```

### 验证规则
- 目标名称不能为空
- 重要程度和紧急程度范围：1-5
- 开始时间不能晚于结束时间

## 🛠️ 使用示例

### 创建目标
```typescript
const createVo: GoalVO.CreateGoalVo = {
  name: "学习TypeScript",
  description: "深入学习TypeScript高级特性",
  type: GoalType.OBJECTIVE,
  importance: 4,
  startAt: "2024-01-01 09:00:00",
  endAt: "2024-03-31 18:00:00",
  parentId: "parent-goal-id"
};

const result = await goalController.create(createVo);
```

### 查询目标
```typescript
// 分页查询
const filter: GoalPageFiltersDto = {
  pageNum: 1,
  pageSize: 10,
  status: GoalStatus.ACTIVE,
  keyword: "学习"
};

const pageResult = await goalController.page(filter);

// 根据ID查询
const goal = await goalController.findById("goal-id");
```

### 状态操作
```typescript
// 完成目标
await goalController.done("goal-id");

// 批量完成
await goalController.doneBatch({ includeIds: ["id1", "id2"] });
```

## 🔍 API 接口

### RESTful 路由
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/goal` | 创建目标 |
| GET | `/goal` | 分页查询目标 |
| GET | `/goal/:id` | 查询单个目标 |
| PUT | `/goal/:id` | 更新目标 |
| DELETE | `/goal/:id` | 删除目标 |

### 状态操作路由
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/goal/:id/done` | 完成目标 |
| POST | `/goal/:id/abandon` | 放弃目标 |
| POST | `/goal/:id/restore` | 恢复目标 |
| POST | `/goal/batch/done` | 批量完成 |

## 🧪 测试

### 单元测试
```bash
# 运行目标模块测试
pnpm test goal

# 运行特定测试文件
pnpm test goal.service.spec.ts
```

### 集成测试
```bash
# 运行API集成测试
pnpm test:e2e goal
```

## 📝 开发规范

### 代码规范
- 遵循 v2.0 架构规范
- 使用 TypeScript 严格模式
- 添加完整的类型注解
- 编写单元测试

### 提交规范
- feat: 新功能
- fix: 修复bug
- refactor: 重构代码
- docs: 更新文档

## 🔮 未来规划

- [ ] 添加目标模板功能
- [ ] 支持目标标签分类
- [ ] 实现目标进度跟踪
- [ ] 添加目标提醒功能
- [ ] 支持目标分享协作 