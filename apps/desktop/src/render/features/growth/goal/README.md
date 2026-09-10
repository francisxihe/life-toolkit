# 目标管理 - 技术设计文档 (TDD)

## 1. 数据模型

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

## 2. 约束规则实现

### 2.1 时间约束

```typescript
// 计算允许的日期范围
const allowedDateRange = useMemo(() => {
  if (!parentGoal) return null;
  return [
    parentGoal.startAt || null,
    parentGoal.endAt || null
  ];
}, [parentGoal]);

// 禁用不符合约束的日期
disabledDate={(current) => {
  if (!allowedDateRange) return false;
  const [minDate, maxDate] = allowedDateRange;
  return (
    current.isBefore(dayjs(minDate)) ||
    current.isAfter(dayjs(maxDate))
  );
}}
```

### 2.2 重要程度约束

```typescript
// 计算允许的重要程度
const allowedImportance = useMemo(() => {
  if (!parentGoal?.importance) {
    return [...IMPORTANCE_MAP.keys()];
  }
  return [...IMPORTANCE_MAP.keys()].filter(
    key => key <= parentGoal.importance
  );
}, [parentGoal]);

// 禁用不符合约束的选项
options={[...IMPORTANCE_MAP.entries()].map(([key, value]) => ({
  label: value.label,
  value: key,
  disabled: !allowedImportance.includes(key),
}))}
```

## 3. API 接口

### 3.1 目标服务

```typescript
// 获取根目标
GoalService.findRoots(): Promise<GoalVo[]>

// 获取子目标
GoalService.findChildren(parentId: string): Promise<GoalVo[]>

// 获取目标详情
GoalService.find(id: string): Promise<GoalVo>

// 筛选查询
GoalService.findByFilter(filter: GoalFilter): Promise<PagedResult<GoalVo>>

// 创建目标
GoalService.create(data: CreateGoalDto): Promise<GoalVo>

// 更新目标
GoalService.update(id: string, data: UpdateGoalDto): Promise<GoalVo>

// 删除目标
GoalService.delete(id: string): Promise<void>
```

### 3.2 筛选参数

```typescript
interface GoalFilter {
  keyword?: string; // 关键词搜索
  status?: GoalStatus[]; // 状态筛选
  type?: GoalType; // 类型筛选
  importance?: Importance; // 重要程度筛选
  difficulty?: Difficulty; // 难度筛选
  startDateStart?: string; // 开始时间范围-起
  startDateEnd?: string; // 开始时间范围-止
}
```

## 4. 状态管理

### 4.1 Context 定义

```typescript
export const [GoalProvider, useGoalContext] = createInjectState<{
  PropsType: {
    children: React.ReactNode;
  };
  ContextType: {
    searchValue: string;
    setSearchValue: (value: string) => void;

    filters: GoalFilters;
    setFilters: (filters: GoalFilters) => void;
    clearFilters: () => void;

    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;

    loading: boolean;
    goalTree: GoalVo[];
    selectedGoal: GoalVo | null;
    selectedGoalId: string | null;
    setSelectedGoalId: (goalId: string | null) => void;

    fetchGoalTree: () => Promise<void>;
    fetchGoalDetail: (goalId: string) => Promise<void>;
    loadChildren: (parentId: string) => Promise<void>;
    refreshData: () => Promise<void>;
  };
}>(() => {
  // 状态实现
});
```

### 4.2 懒加载实现

```typescript
// 获取目标树数据 - 只获取根节点
const fetchGoalTree = useCallback(async () => {
  setLoading(true);
  try {
    if (searchValue || Object.keys(filters).length > 0) {
      // 有筛选条件时,使用 findByFilter
      const response = await GoalService.findByFilter(filterParams);
      setGoalTree(response?.list || []);
    } else {
      // 没有筛选条件时,只获取根节点
      const rootGoals = await GoalService.findRoots();
      const treeData = rootGoals.map((goal) => ({
        ...goal,
        children: [],
        hasChildren: true,
      }));
      setGoalTree(treeData);
    }
  } catch (error) {
    Message.error('获取目标数据失败');
  } finally {
    setLoading(false);
  }
}, [searchValue, filters]);

// 异步加载子节点
const loadChildren = useCallback(async (parentId: string) => {
  try {
    const children = await GoalService.findChildren(parentId);
    // 更新树形数据
    setGoalTree((prevTree) => updateTreeWithChildren(prevTree));
  } catch (error) {
    Message.error('加载子节点失败');
  }
}, []);
```

## 5. 组件架构

### 5.1 页面组件

```
GoalPage
  └── GoalTreeView
      ├── GoalAside
      │   ├── GoalFilters
      │   ├── GoalTree
      │   └── CreateButton
      └── GoalMain
          ├── GoalMainHeader
          ├── GoalForm
          └── GoalForeign
              ├── GoalChildren
              └── TaskList
```

### 5.2 共享组件

- `GoalDetail`: 目标详情组件
  - `GoalCreator`: 创建目标
  - `GoalEditor`: 编辑目标
  - `GoalForm`: 目标表单
  - `GoalForeign`: 关联信息

- `GoalTreeSelector`: 目标树选择器(用于其他模块选择目标)

---

**维护者**: True North Team  
**最后更新**: 2025-12-22
