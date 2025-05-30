# Goal 目标管理模块

## 概述

Goal 模块是 Life Toolkit 项目中的目标管理功能模块，提供了完整的目标创建、查看、筛选和管理功能。该模块基于四象限优先级管理理论，帮助用户更好地规划和追踪个人目标。

## 功能特性

- 📋 **目标列表管理** - 查看和管理所有目标
- 🔍 **智能筛选** - 支持多维度筛选目标
- ⭐ **优先级管理** - 基于重要性和紧急性的四象限分类
- ➕ **目标创建** - 快速创建新目标
- 📊 **目标详情** - 查看和编辑目标详细信息

## 目录结构

```
goal/
├── index.tsx           # 主入口文件，提供 GoalProvider 上下文
├── context.ts          # 全局状态管理
├── constants.ts        # 常量定义（重要性、紧急性映射）
├── README.md          # 本文档
└── goal-all/          # 目标列表子模块
    ├── index.tsx      # 目标列表页面主组件
    ├── context.tsx    # 目标列表状态管理
    ├── GoalTable.tsx  # 目标表格组件
    └── GoalFilters.tsx # 目标筛选组件
```

## 核心组件

### 1. GoalPage (index.tsx)
主入口组件，提供全局的 `GoalProvider` 上下文，使用 React Router 的 `Outlet` 渲染子路由。

### 2. GoalAllLayout (goal-all/index.tsx)
目标列表页面的主布局组件，包含：
- 页面标题
- 筛选器组件
- 新建目标按钮
- 目标表格

### 3. GoalTable (goal-all/GoalTable.tsx)
目标数据表格组件，展示目标列表数据。

### 4. GoalFilters (goal-all/GoalFilters.tsx)
目标筛选组件，提供多维度筛选功能。

## 优先级系统

模块使用四象限优先级管理系统：

### 重要性等级 (IMPORTANCE_MAP)
- **1 - 非常重要** (红色标识)
- **2 - 重要** (橙色标识)
- **3 - 一般** (绿色标识)
- **null - 无** (灰色标识)

### 紧急性等级 (URGENCY_MAP)
- **1 - 非常紧急** (红色标识)
- **2 - 紧急** (橙色标识)
- **3 - 一般** (绿色标识)
- **null - 无** (灰色标识)

### 四象限分类
通过 `getPriorityQuadrant` 函数将目标分为：
- **紧急且重要** - 需要立即处理
- **重要** - 重要但不紧急，需要规划
- **紧急** - 紧急但不重要，可以委托
- **常规** - 既不紧急也不重要，可以删除或延后

## 状态管理

### 全局状态 (context.ts)
使用 `createInjectState` 工具创建全局状态管理，目前为基础结构。

### 局部状态 (goal-all/context.tsx)
管理目标列表页面的状态，包括：
- 目标数据获取
- 筛选条件管理
- 分页状态

## 使用方式

### 基本使用
```tsx
import GoalPage from '@/pages/growth/goal';

// 在路由中使用
<Route path="/goal" element={<GoalPage />}>
  <Route path="all" element={<GoalAllLayout />} />
</Route>
```

### 获取目标数据
```tsx
import { useGoalAllContext } from './goal-all/context';

function MyComponent() {
  const { getGoalPage } = useGoalAllContext();
  
  // 获取目标数据
  useEffect(() => {
    getGoalPage();
  }, []);
}
```

### 使用优先级常量
```tsx
import { IMPORTANCE_MAP, URGENCY_MAP, getPriorityQuadrant } from './constants';

// 获取重要性标签和颜色
const importance = IMPORTANCE_MAP.get(1); // { color: 'danger', label: '非常重要' }

// 获取优先级象限
const quadrant = getPriorityQuadrant('high', 'high'); // '紧急且重要'
```

## 依赖关系

- **React Router** - 路由管理
- **自定义组件**:
  - `FlexibleContainer` - 布局容器
  - `CreateButton` - 创建按钮
  - `GoalDetail` - 目标详情组件
- **工具函数**:
  - `createInjectState` - 状态管理工具

## 开发指南

### 添加新的筛选条件
1. 在 `GoalFilters.tsx` 中添加新的筛选器组件
2. 在 `goal-all/context.tsx` 中更新状态管理逻辑
3. 更新 `GoalTable.tsx` 中的数据展示逻辑

### 扩展优先级系统
1. 在 `constants.ts` 中添加新的映射关系
2. 更新 `getPriorityQuadrant` 函数逻辑
3. 在相关组件中使用新的优先级配置

### 添加新的目标操作
1. 在 `GoalTable.tsx` 中添加操作按钮
2. 在对应的 context 中添加操作方法
3. 集成 `GoalDetail` 组件进行详情操作

## 注意事项

- 所有组件都使用 `'use client'` 指令，确保在客户端渲染
- 状态管理采用 Context + Provider 模式，避免 prop drilling
- 优先级系统的颜色标识需要与设计系统保持一致
- 新建目标后会自动刷新目标列表数据

## 未来规划

- [ ] 添加目标进度跟踪功能
- [ ] 支持目标分类和标签
- [ ] 添加目标统计和分析功能
- [ ] 支持目标导入导出
- [ ] 添加目标提醒和通知功能 