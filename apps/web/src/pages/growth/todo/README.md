# Todo 待办事项模块

## 概述

Todo模块是Life Toolkit项目中的核心功能模块，提供完整的待办事项管理解决方案。该模块支持任务的创建、编辑、状态管理、时间规划以及数据统计分析等功能。

## 功能特性

### 🎯 核心功能
- **任务管理**: 创建、编辑、删除、完成、放弃待办任务
- **时间规划**: 支持按日期规划任务，包括今日、本周、历史任务管理
- **状态跟踪**: 支持待办、已完成、已放弃等多种任务状态
- **优先级管理**: 基于重要性和紧急性的四象限任务分类
- **日历视图**: 直观的日历界面查看和管理任务

### 📊 数据分析
- **任务统计**: 完成率、高优先级任务统计
- **趋势分析**: 任务完成趋势图表
- **时间分析**: 平均完成时间统计
- **数据看板**: 综合数据展示面板

### 🔍 高级功能
- **智能搜索**: 支持任务内容、标签、日期等多维度搜索
- **过滤筛选**: 按状态、优先级、日期范围等条件筛选
- **批量操作**: 支持批量修改任务状态
- **过期提醒**: 自动识别和展示过期任务

## 目录结构

```
todo/
├── index.tsx                 # 主入口文件，提供路由出口和全局状态
├── context.tsx              # 全局状态管理，提供日期相关上下文
├── style.module.less        # 全局样式文件
├── todo-today/              # 今日待办模块
│   ├── index.tsx           # 今日任务主页面
│   └── style.module.less   # 今日模块样式
├── todo-week/               # 本周待办模块
│   ├── index.tsx           # 本周任务主页面
│   └── style.module.less   # 本周模块样式
├── todo-dashboard/          # 数据看板模块
│   ├── index.tsx           # 看板主页面
│   ├── context.tsx         # 看板状态管理
│   ├── overview.tsx        # 数据概览组件
│   ├── TodoStats.tsx       # 统计组件
│   ├── assets/             # 静态资源
│   ├── style/              # 样式文件
│   └── locale/             # 国际化文件
├── todo-calendar/           # 日历视图模块
│   ├── index.tsx           # 日历主页面
│   ├── context.tsx         # 日历状态管理
│   ├── CalendarCell.tsx    # 日历单元格组件
│   ├── CalendarHeader.tsx  # 日历头部组件
│   ├── SearchBar.tsx       # 搜索栏组件
│   ├── utils.ts            # 日历工具函数
│   └── style.module.less   # 日历样式
└── todo-all/                # 全部任务模块
    ├── index.tsx           # 全部任务主页面
    ├── context.tsx         # 状态管理
    ├── TodoTable.tsx       # 任务表格组件
    └── TodoFilters.tsx     # 过滤器组件
```

## 技术架构

### 状态管理
- 使用自定义的 `createInjectState` 工具进行状态管理
- 每个子模块都有独立的context管理局部状态
- 全局context提供日期相关的共享状态

### 组件设计
- 采用模块化设计，每个功能独立成模块
- 使用React Router进行路由管理
- 组件间通过props和context进行数据传递

### 样式方案
- 使用CSS Modules进行样式隔离
- 采用Less预处理器
- 结合Tailwind CSS进行快速样式开发

## 使用方法

### 基本使用

```tsx
import TodoPage from './todo';

// 在路由中使用
<Route path="/todo" element={<TodoPage />}>
  <Route path="today" element={<TodoToday />} />
  <Route path="week" element={<TodoWeek />} />
  <Route path="dashboard" element={<TodoDashboard />} />
  <Route path="calendar" element={<TodoCalendar />} />
  <Route path="all" element={<TodoAll />} />
</Route>
```

### 状态使用

```tsx
import { useTodoContext } from './context';

function MyComponent() {
  const { today, yesterday, weekStart, weekEnd } = useTodoContext();
  
  // 使用日期状态
  console.log('今天:', today);
  console.log('昨天:', yesterday);
  console.log('本周开始:', weekStart);
  console.log('本周结束:', weekEnd);
}
```

## 子模块说明

### 1. Todo Today (今日待办)
- **功能**: 专注于今日任务管理
- **特性**: 
  - 显示今日计划任务
  - 展示已过期任务
  - 今日完成和放弃的任务
  - 快速创建新任务
  - 任务详情编辑

### 2. Todo Week (本周待办)
- **功能**: 本周任务规划和管理
- **特性**:
  - 按周显示任务
  - 周度任务统计
  - 周计划制定

### 3. Todo Dashboard (数据看板)
- **功能**: 任务数据分析和统计
- **特性**:
  - 任务完成趋势
  - 优先级分布
  - 效率统计
  - 可视化图表

### 4. Todo Calendar (日历视图)
- **功能**: 日历形式的任务管理
- **特性**:
  - 月度日历视图
  - 任务日期可视化
  - 拖拽调整任务日期
  - 日期范围搜索

### 5. Todo All (全部任务)
- **功能**: 所有任务的列表管理
- **特性**:
  - 表格形式展示
  - 高级筛选功能
  - 批量操作
  - 排序功能

## 依赖说明

### 核心依赖
- `react`: React框架
- `react-router-dom`: 路由管理
- `dayjs`: 日期处理
- `@arco-design/web-react`: UI组件库

### 内部依赖
- `@life-toolkit/vo/growth`: 数据模型定义
- `@life-toolkit/tabs`: 自定义标签组件
- `../../components`: 共享组件
- `../../service`: 数据服务层

## 开发指南

### 添加新功能
1. 在对应子模块中添加新组件
2. 更新context如需要新的状态
3. 添加相应的样式文件
4. 更新路由配置

### 样式开发
- 使用CSS Modules避免样式冲突
- 遵循BEM命名规范
- 优先使用Tailwind CSS类名
- 复杂样式使用Less编写

### 状态管理
- 局部状态使用useState
- 跨组件状态使用context
- 异步状态使用useEffect + useState
- 复杂状态考虑使用useReducer

## 注意事项

1. **性能优化**: 大量任务时注意列表渲染性能
2. **数据同步**: 确保各模块间数据状态同步
3. **错误处理**: 添加适当的错误边界和加载状态
4. **可访问性**: 确保键盘导航和屏幕阅读器支持
5. **响应式**: 确保在不同屏幕尺寸下的良好体验

## 未来规划

- [ ] 添加任务模板功能
- [ ] 支持任务标签系统
- [ ] 添加任务协作功能
- [ ] 集成提醒通知
- [ ] 支持任务导入导出
- [ ] 添加任务时间追踪
- [ ] 支持子任务功能
- [ ] 添加任务评论系统 