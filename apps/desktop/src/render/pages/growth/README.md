# 技术设计文档 (TDD)

## 1. 前端技术栈

### 1.1 核心框架

- **React 18**: UI 框架
- **TypeScript**: 类型安全
- **React Router v6**: 路由管理

### 1.2 UI 组件库

- **Arco Design**: 主要 UI 组件库
- **自定义组件**: 业务特定组件

### 1.3 样式方案

- **CSS Modules**: 样式隔离
- **Less**: CSS 预处理器
- **Tailwind CSS**: 快速样式开发

### 1.4 工具库

- **dayjs**: 日期处理
- **ECharts**: 数据图表
- **clsx**: 类名管理

## 2. 状态管理

### 2.1 全局状态管理

使用自定义的 `createInjectState` 工具进行状态管理:

```typescript
// 示例: Goal Context
export const [GoalProvider, useGoalContext] = createInjectState<{
  PropsType: {
    children: React.ReactNode;
  };
  ContextType: {
    loading: boolean;
    goalTree: GoalVo[];
    selectedGoal: GoalVo | null;
    fetchGoalTree: () => Promise<void>;
    // ... 其他状态和方法
  };
}>(() => {
  // 状态定义和逻辑
});
```

**特点**:

- 每个模块独立的 Context Provider
- 通过 custom hooks 访问状态
- 类型安全

### 2.2 局部状态管理

- **组件内部**: 使用 `useState`
- **表单状态**: 使用 Arco Design 的 `Form` 组件
- **异步状态**: 使用 `useEffect` + `useState`
- **复杂状态**: 考虑使用 `useReducer`

## 3. 组件架构

### 3.1 组件分层

```
页面级组件 (Page Components)
  ├── TodoPage, TaskPage, GoalPage, HabitPage
  └── 提供 Provider 和路由出口

视图级组件 (View Components)
  ├── 各个子路由页面组件
  └── 实现具体的业务逻辑

共享组件 (Shared Components)
  ├── GoalDetail, TaskDetail, TodoDetail
  ├── GoalTreeSelector, IconSelector
  └── TrackTime

复用组件 (Reusable Components)
  ├── TabsPage
  └── Flex（@sue/design-web-react，container=full|fixed|fill；默认横向，旧 FlexibleContainer 默认栈式布局迁移时须加 vertical；fixed 在列父容器加 w-full、在行父容器加 h-full）
```

### 3.1.1 Flex 与控件迁移约定

- `Flex` 包裹 Fragment 或多个直接子节点时，必须显式声明实际排列方向；旧 `FlexibleContainer.Fixed` 本身不创建 flex 格式化上下文，不能直接按新 `Flex` 的默认横向行为推断。
- `Input` 与 `Input.TextArea` 的 `onChange` 接收原生事件，文本值使用 `event.target.value`；`Checkbox` 使用 `event.target.checked`。
- `DatePicker` 与 `RangePicker` 的 `onChange` 参数顺序为 `(date, dateString)`；`Select`、`InputNumber`、`Switch` 保持直接接收组件值。
- `Calendar` 在 Popover、Drawer 等紧凑容器中必须显式使用 `fullscreen={false}`；旧 Arco 的 `panel`、`panelWidth` 属性不适用于新组件。
- 编辑型 `Input` / `TextArea` 使用 `variant="borderless"` 控制无边框外观，不依赖外层 Tailwind 类覆盖组件内部输入节点。
- 今日待办采用单栏工作清单：顶部 Tab 栏右侧常驻“新建待办”，页面工具栏只负责标题与日期信息，列表按状态分组并显示数量。
- 待办新增和编辑 Drawer 使用标准纵向 `Form`，字段包括名称、描述、计划日期、时间范围、重要程度、紧急程度、标签和重复设置；提交成功后才关闭 Drawer 并刷新当前列表。快速创建 Popover 保持紧凑交互，不复用 Drawer 表单。
- 待办日历使用 `Calendar` 的 `value`、`mode`、`onPanelChange` 与 `fullCellRender`；旧 `pageShowDate`、`dateRender` 不会驱动当前组件库。切换面板后按可见日期范围重新查询待办。
- 待办名称和描述在写入 `TodoFormData` 前必须是字符串；输入组件读取 `event.target.value`，不允许将原生事件或其他对象传入服务层。

### 3.2 组件设计原则

- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 提取通用逻辑到共享组件
- **可测试性**: 组件逻辑易于测试
- **性能优化**: 使用 `memo`, `useCallback`, `useMemo`

## 4. 数据模型

### 4.1 目标数据模型 (GoalVo)

```typescript
interface GoalVo {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type?: GoalType;
  importance?: Importance;
  difficulty?: Difficulty;
  status: GoalStatus;
  parentId?: string;
  startAt?: string;
  endAt?: string;
  doneAt?: string;
  abandonedAt?: string;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  children?: GoalVo[];
  tasks?: TaskVo[];
  hasChildren?: boolean;
}
```

### 4.2 任务数据模型 (TaskVo)

```typescript
interface TaskVo {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  isSubTask: boolean;
  parentId?: string;
  goalId?: string;
  planTimeRange?: [string, string];
  estimateTime?: string;
  trackTimeList?: TrackTimeVo[];
  importance?: Importance;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  children?: TaskVo[];
  todos?: TodoVo[];
}

interface TrackTimeVo {
  id?: string;
  startTime: string;
  endTime?: string;
  remark?: string;
}
```

### 4.3 待办数据模型 (TodoVo)

```typescript
interface TodoVo {
  id: string;
  name: string;
  description?: string;
  status: TodoStatus;
  taskId?: string;
  goalId?: string;
  importance?: Importance;
  urgency?: Urgency;
  plannedAt?: string;
  dueAt?: string;
  doneAt?: string;
  abandonedAt?: string;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  task?: TaskVo;
  goal?: GoalVo;
}
```

### 4.4 习惯数据模型 (HabitVo)

```typescript
interface HabitVo {
  id: string;
  name: string;
  description?: string;
  status: HabitStatus;
  importance?: number;
  difficulty?: Difficulty;
  tags?: string[];
  startAt?: string;
  endAt?: string;
  doneAt?: string;
  abandonedAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  goals?: GoalVo[]; // 必填,至少一个
  recentLogs?: HabitLogVo[];
  statistics?: HabitStatisticsVo;
}

interface HabitLogVo {
  id: string;
  habitId: string;
  logDate: string;
  completionScore: HabitCompletionScore;
  note?: string;
  mood?: number;
  createdAt: string;
  updatedAt: string;
}
```

## 5. 枚举类型定义

### 5.1 状态枚举

#### 5.1.1 目标状态 (GoalStatus)

```typescript
enum GoalStatus {
  Planning = 'Planning', // 规划中
  InProgress = 'InProgress', // 进行中
  Done = 'Done', // 已完成
  Abandoned = 'Abandoned', // 已放弃
  Paused = 'Paused', // 已暂停
}
```

**状态转换**:

```
Planning → InProgress → Done
         → Paused → InProgress
         → Abandoned
```

#### 5.1.2 任务状态 (TaskStatus)

```typescript
enum TaskStatus {
  Todo = 'Todo', // 待办
  InProgress = 'InProgress', // 进行中
  Done = 'Done', // 已完成
  Abandoned = 'Abandoned', // 已放弃
}
```

**状态转换**:

```
Todo → InProgress → Done
     → Abandoned
```

#### 5.1.3 待办状态 (TodoStatus)

```typescript
enum TodoStatus {
  Todo = 'Todo', // 待办
  InProgress = 'InProgress', // 进行中
  Done = 'Done', // 已完成
  Abandoned = 'Abandoned', // 已放弃
}
```

**状态转换**:

```
Todo → InProgress → Done
     → Abandoned → Todo (可恢复)
```

#### 5.1.4 习惯状态 (HabitStatus)

```typescript
enum HabitStatus {
  Active = 'Active', // 活跃中
  Paused = 'Paused', // 已暂停
  Completed = 'Completed', // 已完成
  Abandoned = 'Abandoned', // 已放弃
}
```

**状态转换**:

```
Active → Paused → Active
       → Completed
       → Abandoned
```

### 5.2 分类枚举

#### 5.2.1 目标类型 (GoalType)

```typescript
enum GoalType {
  LongTerm = 'LongTerm', // 长期目标
  ShortTerm = 'ShortTerm', // 短期目标
  Project = 'Project', // 项目目标
  Learning = 'Learning', // 学习目标
  Other = 'Other', // 其他
}
```

### 5.3 评估枚举

#### 5.3.1 重要程度 (Importance)

```typescript
enum Importance {
  Supplementary = 1, // 聊胜于无
  Helpful = 2, // 略有裨益
  Core = 3, // 重要
  Key = 4, // 举足轻重
  Essential = 5, // 不容或缺
}
```

**颜色映射**:

```typescript
export const IMPORTANCE_MAP = new Map([
  [1, { color: 'gray', label: '聊胜于无' }],
  [2, { color: 'green', label: '略有裨益' }],
  [3, { color: 'blue', label: '重要' }],
  [4, { color: 'orange', label: '举足轻重' }],
  [5, { color: 'red', label: '不容或缺' }],
]);
```

#### 5.3.2 难度等级 (Difficulty)

```typescript
enum Difficulty {
  GettingStarted = 'GettingStarted', // 轻而易举
  Skilled = 'Skilled', // 略费手脚
  Challenger = 'Challenger', // 颇费周章
  Master = 'Master', // 千回百转
  Legendary = 'Legendary', // 登峰造极
}
```

**颜色映射**:

```typescript
export const DIFFICULTY_MAP = new Map([
  [Difficulty.GettingStarted, { color: 'gray', label: '轻而易举' }],
  [Difficulty.Skilled, { color: 'green', label: '略费手脚' }],
  [Difficulty.Challenger, { color: 'blue', label: '颇费周章' }],
  [Difficulty.Master, { color: 'orange', label: '千回百转' }],
  [Difficulty.Legendary, { color: 'red', label: '登峰造极' }],
]);
```

#### 5.3.3 紧急程度 (Urgency)

```typescript
enum Urgency {
  Someday = 'Someday', // 来日方长
  Later = 'Later', // 按部就班
  Soon = 'Soon', // 事不宜迟
  Now = 'Now', // 刻不容缓
  ASAP = 'ASAP', // 十万火急
}
```

**颜色映射**:

```typescript
export const URGENCY_MAP = new Map([
  [Urgency.Someday, { color: 'gray', label: '来日方长' }],
  [Urgency.Later, { color: 'green', label: '按部就班' }],
  [Urgency.Soon, { color: 'blue', label: '事不宜迟' }],
  [Urgency.Now, { color: 'orange', label: '刻不容缓' }],
  [Urgency.ASAP, { color: 'red', label: '十万火急' }],
  [null, { color: 'text-3', label: '无' }],
]);
```

#### 5.3.4 习惯完成得分 (HabitCompletionScore)

```typescript
enum HabitCompletionScore {
  Perfect = 'Perfect', // 完美完成
  Good = 'Good', // 良好完成
  Basic = 'Basic', // 基本完成
  Incomplete = 'Incomplete', // 未完成
}
```

## 6. API 服务层

### 6.1 服务模块

```typescript
// 目标服务
GoalService.findRoots(); // 获取根目标
GoalService.findChildren(id); // 获取子目标
GoalService.find(id); // 获取目标详情
GoalService.findByFilter(filter); // 筛选查询
GoalService.create(data); // 创建目标
GoalService.update(id, data); // 更新目标
GoalService.delete(id); // 删除目标

// 任务服务
TaskService.find(id);
TaskService.findByFilter(filter);
TaskService.create(data);
TaskService.update(id, data);
TaskService.delete(id);

// 待办服务
TodoService.find(id);
TodoService.findByFilter(filter);
TodoService.create(data);
TodoService.update(id, data);
TodoService.delete(id);
TodoService.batchUpdateStatus(ids, status);

// 习惯服务
HabitService.getHabitDetail(id);
HabitService.getHabitPage(params);
HabitService.createHabit(data);
HabitService.updateHabit(id, data);
HabitService.deleteHabit(id);
HabitService.doneBatchHabit(params);
HabitService.abandonHabit(id);
```

### 6.2 服务层设计

- **统一接口**: 所有服务遵循统一的接口规范
- **错误处理**: 统一的错误处理机制
- **请求拦截**: 统一的请求/响应拦截器
- **类型安全**: 完整的 TypeScript 类型定义

## 7. 数据流

```
用户操作 → 组件事件处理 → API调用 → 后端服务
                 ↓                        ↓
           本地状态更新 ← 数据响应 ← 数据处理
                 ↓
           UI重新渲染
```

### 7.1 数据流详解

1. **用户操作**: 用户在 UI 上进行操作
2. **事件处理**: 组件捕获事件并调用相应的处理函数
3. **API 调用**: 通过 Service 层调用后端 API
4. **数据处理**: 后端处理请求并返回数据
5. **状态更新**: 更新 Context 或组件本地状态
6. **UI 渲染**: React 重新渲染相关组件

## 8. 性能优化

### 8.1 代码分割与懒加载

- **路由级别代码分割**: 使用 React.lazy 和 Suspense
- **目标树懒加载**: 按需加载子节点,避免一次性加载大量数据

### 8.2 渲染优化

- **React.memo**: 避免不必要的组件重渲染
- **useCallback**: 缓存函数引用
- **useMemo**: 缓存计算结果
- **虚拟滚动**: 大列表使用虚拟滚动(待实现)

### 8.3 网络优化

- **防抖/节流**: 搜索输入防抖、滚动加载节流
- **请求缓存**: Context 缓存数据,避免重复请求
- **批量操作**: 支持批量更新减少网络请求

### 8.4 性能监控

- 关键性能指标监控
- 慢查询分析
- 渲染性能分析

## 9. 错误处理

### 9.1 边界错误处理

- **Error Boundary**: 捕获组件树中的错误
- **友好提示**: 向用户展示友好的错误信息
- **错误上报**: 将错误信息上报到监控系统

### 9.2 API 错误处理

- **统一错误处理**: 在 Service 层统一处理 API 错误
- **错误分类**: 网络错误、业务错误、权限错误等
- **错误提示**: 使用 Message 组件显示错误信息

## 10. 测试策略

### 10.1 单元测试

- 组件单元测试
- 工具函数测试
- Service 层测试

### 10.2 集成测试

- 页面级集成测试
- 用户流程测试

### 10.3 E2E 测试

- 关键业务流程 E2E 测试
- 回归测试

## 11. 构建与部署

### 11.1 构建优化

- Tree Shaking
- 代码压缩
- 资源优化

### 11.2 部署策略

- CI/CD 自动化部署
- 多环境配置
- 版本管理

## 12. 安全性

### 12.1 前端安全

- XSS 防护: 输入验证和输出转义
- CSRF 防护: Token 验证
- 敏感信息保护: 不在前端存储敏感信息

### 12.2 API 安全

- 认证授权
- HTTPS 加密传输
- 请求签名验证

---

**维护者**: True North Team  
**最后更新**: 2025-12-22
