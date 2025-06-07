# 待办看板 (Todo Dashboard)

## 功能概述

待办看板是一个综合性的任务管理仪表板，提供了对个人待办事项的全面统计和可视化分析。

## 主要功能

### 📊 核心统计卡片
- **总任务数**: 显示所有任务的总数量
- **已完成**: 显示已完成任务数量和完成率
- **待处理**: 显示待处理任务数量，包含逾期提醒
- **高优先级**: 显示紧急重要任务数量

### 📈 今日和本周统计
- **今日完成**: 当天完成的任务数量
- **本周完成**: 最近7天完成的任务数量

### 📉 任务趋势图表
- 显示最近7天的任务创建和完成趋势
- 使用双线图展示任务的变化情况
- 支持交互式图表操作

### 🎯 优先级矩阵
基于艾森豪威尔矩阵的四象限分类：
- **紧急重要**: 立即处理的任务
- **紧急不重要**: 可委托他人的任务
- **不紧急重要**: 需要计划安排的任务
- **不紧急不重要**: 有空再做的任务

### 📋 最近任务
- **最近完成**: 显示最近7天完成的任务
- **即将到期**: 显示按计划日期排序的待办任务
- 支持逾期任务高亮显示

## 技术特性

### 组件架构
```
todo-dashboard/
├── index.tsx              # 主页面组件
├── context.tsx            # 数据上下文管理
├── TodoChart.tsx          # 趋势图表组件
├── TodoPriorityMatrix.tsx # 优先级矩阵组件
├── RecentTodos.tsx        # 最近任务组件
├── demo-data.ts           # 演示数据生成器
└── style/                 # 样式文件
    ├── index.module.less
    └── priority-matrix.module.less
```

### 数据管理
- 使用 React Context 进行状态管理
- 支持加载状态和错误处理
- 集成 TodoService 获取真实数据

### 样式设计
- 响应式布局设计
- 使用 Arco Design 组件库
- 支持深色/浅色主题切换

## 使用方式

### 基本使用
```tsx
import TodoDashboardPage from './todo-dashboard';

function App() {
  return <TodoDashboardPage />;
}
```

### 数据源配置
```tsx
// 在 context.tsx 中的数据加载逻辑
async function loadTodoList(params?: TodoListFiltersVo) {
  try {
    setLoading(true);
    const res = await TodoService.getTodoList(params);
    setTodoList(res.list);
  } catch (error) {
    console.error('Failed to load todo list:', error);
  } finally {
    setLoading(false);
  }
}
```

## 数据来源

看板数据来源于 TodoService，包含：
- 所有状态的任务（待办、已完成、已放弃）
- 完整的任务属性（优先级、标签、时间等）
- 实时的任务统计和分析

## 扩展功能

### 计划中的功能
- [ ] 任务快速操作（标记完成、删除等）
- [ ] 更多图表类型（饼图、柱状图等）
- [ ] 时间范围筛选
- [ ] 标签统计分析
- [ ] 导出功能
- [ ] 个性化配置

### 自定义扩展
可以通过以下方式扩展功能：
1. 添加新的统计维度
2. 创建自定义图表组件
3. 扩展优先级矩阵逻辑
4. 添加新的筛选条件

## 性能优化

- 使用 `useMemo` 优化计算密集型操作
- 组件懒加载和代码分割
- 图表组件按需渲染
- 合理的数据缓存策略 