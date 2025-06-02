# 任务管理模块 (Task Management Module)

## 📋 模块概述

任务管理模块是 Life Toolkit 项目中的核心功能模块，提供了完整的任务管理解决方案。该模块支持多种视图模式，帮助用户高效地管理和跟踪任务进度。

## ✨ 功能特性

### 🎯 核心功能
- **任务创建与编辑**: 支持创建、编辑、删除任务
- **任务状态管理**: 待办、已完成、已放弃等状态切换
- **优先级管理**: 基于重要性和紧急性的四象限优先级分类
- **时间跟踪**: 任务时间记录和统计
- **任务筛选**: 多维度任务筛选和搜索

### 📅 多视图支持
1. **全部任务视图** (`task-all/`)
   - 表格形式展示所有任务
   - 支持筛选、排序、分页
   - 批量操作功能

2. **周视图** (`task-week/`)
   - 本周任务概览
   - 已过期任务提醒
   - 任务完成情况统计
   - 侧边栏任务详情编辑

3. **日历视图** (`task-calendar/`)
   - 日历形式展示任务
   - 按日期组织任务
   - 直观的时间线视图

## 📁 目录结构

```
apps/web/src/pages/growth/task/
├── README.md                 # 本文档
├── index.tsx                 # 模块主入口，提供路由出口
├── context.ts                # 全局任务上下文
├── constants.ts              # 常量定义（优先级、紧急性映射）
├── components/               # 共享组件目录
├── task-all/                 # 全部任务视图
│   ├── index.tsx            # 全部任务页面主组件
│   ├── context.tsx          # 全部任务页面上下文
│   ├── TaskTable.tsx        # 任务表格组件
│   └── TaskFilters.tsx      # 任务筛选组件
├── task-week/               # 周视图
│   ├── index.tsx            # 周视图主组件
│   └── style.module.less    # 周视图样式
└── task-calendar/           # 日历视图
    ├── index.tsx            # 日历视图主组件
    ├── context.tsx          # 日历上下文
    ├── CalendarCell.tsx     # 日历单元格组件
    ├── CalendarHeader.tsx   # 日历头部组件
    ├── SearchBar.tsx        # 搜索栏组件
    ├── utils.ts             # 日历工具函数
    └── style.module.less    # 日历样式
```

## 🚀 使用方法

### 基本使用

```javascript
// 示例：在路由中使用任务管理模块
import TaskPage from '@/pages/growth/task';

// 路由配置示例
const routes = [
  { path: "/task/*", element: <TaskPage /> }
];
```

### 优先级系统

模块使用四象限优先级管理系统：

```javascript
// 示例：优先级配置
// 重要性级别
const IMPORTANCE_MAP = {
  1: { color: 'danger', label: '非常重要' },
  2: { color: 'warning', label: '重要' },
  3: { color: 'success', label: '一般' },
  null: { color: 'text-3', label: '无' }
};

// 紧急性级别
const URGENCY_MAP = {
  1: { color: 'danger', label: '非常紧急' },
  2: { color: 'warning', label: '紧急' },
  3: { color: 'success', label: '一般' },
  null: { color: 'text-3', label: '无' }
};
```

### 上下文使用

```javascript
// 示例：使用任务上下文
import { useTaskContext } from './context';

function MyComponent() {
  const taskContext = useTaskContext();
  // 使用任务上下文
}
```

## 🔧 技术栈

- **React 18**: 前端框架
- **TypeScript**: 类型安全
- **Arco Design**: UI 组件库
- **React Router**: 路由管理
- **Day.js**: 日期处理
- **Less**: 样式预处理器

## 📦 依赖关系

### 内部依赖
- `@/components/Layout/FlexibleContainer`: 布局容器
- `@/components/Button/CreateButton`: 创建按钮
- `@/components/SiteIcon`: 图标组件
- `life-toolkit/vo/growth`: 任务相关类型定义

### 外部依赖
- `@arco-design/web-react`: UI 组件
- `react-router-dom`: 路由
- `dayjs`: 日期处理
- `react-dom`: React DOM 操作

## 🎨 样式规范

模块使用 CSS Modules 和 Less 预处理器：

```less
// 示例样式结构
.custom-calendar {
  // 日历自定义样式
}

.custom-collapse {
  // 折叠面板自定义样式
}
```

## 🔄 状态管理

### 任务状态
- `TODO`: 待办
- `DONE`: 已完成  
- `ABANDONED`: 已放弃

### 上下文结构
```javascript
// 示例：任务上下文接口
interface TaskContext {
  ContextType: Record<string, unknown>;
}
```

## 📝 开发指南

### 添加新视图
1. 在 `task-*` 目录下创建新视图
2. 实现主组件和相关子组件
3. 添加路由配置
4. 更新文档

### 扩展功能
1. 在 `constants.ts` 中添加新的常量定义
2. 在相应的上下文中添加状态管理
3. 实现对应的 UI 组件
4. 添加相关的工具函数

## 🐛 常见问题

### Q: 如何自定义任务优先级？
A: 修改 `constants.ts` 中的 `IMPORTANCE_MAP` 和 `URGENCY_MAP` 配置。

### Q: 如何添加新的任务状态？
A: 需要同时修改前端状态定义和后端 API 接口。

### Q: 日历视图不显示任务？
A: 检查日期格式和 API 数据返回是否正确。