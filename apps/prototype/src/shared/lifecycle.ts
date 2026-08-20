import type { Goal, Habit, Task, Todo } from './types';

export function validateGoalHierarchy(goal: Goal, goals: Goal[]): string | undefined {
  const parent = goals.find((item) => item.id === goal.parentId);
  const children = goals.filter((item) => item.parentId === goal.id);
  if (goal.start > goal.end) return '结束日期不能早于开始日期';
  if (!parent && goal.type !== 'vision') return '无父目标的目标只能选择规划类型';
  if (parent && (goal.start < parent.start || goal.end > parent.end)) return '子目标时间范围必须落入父目标';
  if (parent && (goal.importance > parent.importance || goal.difficulty > parent.difficulty)) {
    return '子目标的重要度和难度不能高于父目标';
  }
  if (parent?.type === 'result' && goal.type !== 'result') return '指标父目标下只能创建指标子目标';
  if (goal.type === 'result' && children.some((child) => child.type !== 'result')) {
    return '指标目标下不能包含规划子目标，请先调整子目标类型';
  }
  if (children.some((child) => child.start < goal.start || child.end > goal.end)) {
    return '调整目标时间前，请先处理超出范围的子目标';
  }
  if (children.some((child) => child.importance > goal.importance || child.difficulty > goal.difficulty)) {
    return '调整目标优先级或难度前，请先处理超出上级约束的子目标';
  }
  return undefined;
}

export function validateTaskHierarchy(task: Task, goals: Goal[], tasks: Task[]): string | undefined {
  if (Boolean(task.goalId) === Boolean(task.parentId)) return '任务必须关联一个目标或一个父任务';
  const parent = task.parentId
    ? tasks.find((item) => item.id === task.parentId)
    : goals.find((item) => item.id === task.goalId);
  if (
    parent &&
    (task.start < parent.start
      || task.end > parent.end
      || task.importance > parent.importance
      || task.difficulty > parent.difficulty)
  ) {
    return '任务的时间、重要度和难度不能超出关联上游';
  }
  if (task.plannedStart > task.plannedEnd) return '计划结束时间不能早于计划开始时间';
  return undefined;
}

export function goalDeleteBlocker(goalId: string, goals: Goal[], tasks: Task[], todos: Todo[], habits: Habit[]): string | undefined {
  const children = goals.filter((item) => item.parentId === goalId).length;
  const relatedTasks = tasks.filter((item) => item.goalId === goalId).length;
  const relatedTodos = todos.filter((item) => item.goalId === goalId).length;
  const relatedHabits = habits.filter((item) => item.goalIds.includes(goalId)).length;
  const impacts = [
    children && `${children} 个子目标`,
    relatedTasks && `${relatedTasks} 个关联任务`,
    relatedTodos && `${relatedTodos} 个关联待办`,
    relatedHabits && `${relatedHabits} 个关联习惯`,
  ].filter(Boolean);
  return impacts.length ? `该目标仍有关联内容：${impacts.join('、')}` : undefined;
}

export function taskDeleteBlocker(taskId: string, tasks: Task[], todos: Todo[]): string | undefined {
  const children = tasks.filter((item) => item.parentId === taskId).length;
  const relatedTodos = todos.filter((item) => item.taskId === taskId).length;
  const impacts = [children && `${children} 个子任务`, relatedTodos && `${relatedTodos} 个关联待办`].filter(Boolean);
  return impacts.length ? `该任务仍有关联内容：${impacts.join('、')}` : undefined;
}

export function taskAncestorIds(taskId: string, tasks: Task[]): string[] {
  const byId = new Map(tasks.map((item) => [item.id, item]));
  const ancestors: string[] = [];
  let current = byId.get(taskId);
  while (current?.parentId) {
    ancestors.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return ancestors;
}

export function taskRootSubtree(taskId: string, tasks: Task[]): Task[] {
  const byId = new Map(tasks.map((item) => [item.id, item]));
  let root = byId.get(taskId);
  const traversed = new Set<string>();
  while (root?.parentId && !traversed.has(root.id)) {
    traversed.add(root.id);
    root = byId.get(root.parentId) || root;
    if (!root.parentId) break;
  }
  if (!root) return [];
  const descendantsByParent = new Map<string, Task[]>();
  tasks.forEach((task) => {
    if (!task.parentId) return;
    const children = descendantsByParent.get(task.parentId) || [];
    children.push(task);
    descendantsByParent.set(task.parentId, children);
  });
  const subtree: Task[] = [];
  const pending = [root];
  const included = new Set<string>();
  while (pending.length) {
    const task = pending.shift()!;
    if (included.has(task.id)) continue;
    included.add(task.id);
    subtree.push(task);
    pending.push(...(descendantsByParent.get(task.id) || []));
  }
  return subtree;
}
