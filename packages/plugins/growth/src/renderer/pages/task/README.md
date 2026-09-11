# 任务管理 - 技术设计文档 (TDD)

> 当前实现快照（2026-08-07）：桌面端只保留“当前任务、任务日历、全部任务”三个入口。当前任务使用 `DayAgendaDateProvider` 选择日期，并按过期、当日、已完成、已放弃分组；任务详情通过 `TaskDetailDrawer` 打开。独立本周视图和任务统计页已移除，以下旧版分组说明仅作为历史设计参考，不是当前路由契约。

## 1. 数据模型

### 1.1 任务数据模型

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
```

### 1.2 时间跟踪数据模型

```typescript
interface TrackTimeVo {
  id?: string;
  startTime: string;
  endTime?: string;
  remark?: string;
}
```

## 2. 约束规则实现

### 2.1 二选一关联规则

```typescript
// 创建模式下,如果有父任务id或目标id,则不显示是否子任务开关
const isCreateMode = !currentTask?.id;
const shouldHideSubTaskSwitch = isCreateMode && (
  taskFormData?.parentId || taskFormData?.goalId
);

// 根据 isSubTask 显示不同的表单字段
{taskFormData.isSubTask ? (
  <Item label="父任务" name="parentId">
    <Select options={taskList.map((task) => ({
      label: task.name,
      value: task.id,
    }))} />
  </Item>
) : (
  <Item label="目标" name="goalId">
    <GoalTreeSelector
      placeholder="请选择父级目标"
      excludeId={currentTask?.goalId}
    />
  </Item>
)}
```

### 2.2 时间约束

```typescript
const { allowedDateRange } = useTaskFormConstraints(
  parentTask,
  parentGoal
);

<RangePicker
  className="w-full rounded-md"
  allowClear
  showTime
  disabledDate={(current) => {
    if (!allowedDateRange) return false;
    const [minDate, maxDate] = allowedDateRange;
    return (
      current.isBefore(dayjs(minDate)) ||
      current.isAfter(dayjs(maxDate))
    );
  }}
  placeholder={
    allowedDateRange
      ? [`最早: ${allowedDateRange[0]}`, `最晚: ${allowedDateRange[1]}`]
      : ['开始时间', '结束时间']
  }
/>

{(parentTask || parentGoal) && allowedDateRange && (
  <div className="text-xs text-orange-600 mt-1">
    <span>
      {parentTask ? '父任务' : '目标'}时间范围限制：
      {allowedDateRange[0]} ~ {allowedDateRange[1]}
    </span>
  </div>
)}
```

### 2.3 重要程度约束

```typescript
const { allowedImportance } = useTaskFormConstraints(
  parentTask,
  parentGoal
);

<Select
  placeholder="请选择重要程度"
  options={[...IMPORTANCE_MAP.entries()].map(([key, value]) => ({
    label: value.label,
    value: key,
    disabled: !allowedImportance.includes(key),
  }))}
/>

{(parentTask || parentGoal) &&
  allowedImportance.length < [...IMPORTANCE_MAP.keys()].length && (
    <div className="text-xs text-orange-600 mt-1">
      <span>⚠️ 重要程度不能高于{parentTask ? '父任务' : '目标'}：
        {IMPORTANCE_MAP.get((parentTask || parentGoal).importance)?.label}
      </span>
    </div>
  )}
```

### 2.4 约束规则 Hook

```typescript
function useTaskFormConstraints(parentTask, parentGoal) {
  // 计算允许的日期范围
  const allowedDateRange = useMemo(() => {
    const parent = parentTask || parentGoal;
    if (!parent) return null;

    const [startTime, endTime] = parent.planTimeRange || [
      parent.startAt,
      parent.endAt,
    ];
    if (!startTime && !endTime) return null;

    return [startTime, endTime];
  }, [parentTask, parentGoal]);

  // 计算允许的重要程度
  const allowedImportance = useMemo(() => {
    const parent = parentTask || parentGoal;
    if (!parent?.importance) {
      return [...IMPORTANCE_MAP.keys()];
    }
    return [...IMPORTANCE_MAP.keys()].filter((key) => key <= parent.importance);
  }, [parentTask, parentGoal]);

  // 根据约束更新表单值
  const updateByConstraints = useCallback(
    (formData) => {
      const updates = {};

      // 时间约束检查
      if (allowedDateRange && formData.planTimeRange) {
        // 检查并调整时间范围
      }

      // 重要程度约束检查
      if (
        formData.importance &&
        !allowedImportance.includes(formData.importance)
      ) {
        updates.importance = Math.max(...allowedImportance);
      }

      return updates;
    },
    [allowedDateRange, allowedImportance],
  );

  return {
    allowedDateRange,
    allowedImportance,
    updateByConstraints,
  };
}
```

## 3. 本周分组与过期规则

- 日期以客户端本地日历日计算，格式为 `YYYY-MM-DD`；本周边界沿用 `dayjs().startOf('week')` 和 `dayjs().endOf('week')`，即周日至周六。
- 待办以计划日期 `planDate` 判断；任务以计划结束时间 `endAt` 所在日期判断。
- “已过期”仅包含 `TODO` 状态且日期早于当天的事项：待办满足 `planDate <= 昨天`，任务满足 `endAt <= 昨天 23:59:59`。
- 日期为今天、本周后续日期或未来日期的未完成事项不属于“已过期”。没有结束时间的任务不自动标记为过期。
- “本周”仅展示结束日期落在本周内的 `TODO` 状态任务；已完成和已放弃任务分别按 `doneAt`、`abandonedAt` 落在本周内分组，且不会进入“已过期”。

## 4. API 接口

### 4.1 任务服务

```typescript
// 获取任务详情
TaskService.find(id: string): Promise<TaskVo>

// 筛选查询
TaskService.findByFilter(filter: TaskFilter): Promise<PagedResult<TaskVo>>

// 创建任务
TaskService.create(data: CreateTaskDto): Promise<TaskVo>

// 更新任务
TaskService.update(id: string, data: UpdateTaskDto): Promise<TaskVo>

// 删除任务
TaskService.delete(id: string): Promise<void>
```

## 5. 组件架构

### 5.1 页面组件

```
TaskPage
  └── TabsPage
      ├── TaskWeek      # 当前任务
      ├── TaskCalendar  # 任务日历
      └── TaskAll       # 全部任务
```

### 5.2 共享组件

- `TaskDetail`: 任务详情组件
  - `TaskCreator`: 创建任务
  - `TaskEditor`: 编辑任务
  - `TaskForm`: 任务表单
  - `TaskChildren`: 子任务列表
  - `TodoList`: 待办列表

- `TrackTime`: 时间跟踪组件
  - 时间记录列表
  - 添加时间记录
  - 总时间统计

---

**维护者**: True North Team  
**最后更新**: 2026-07-30
