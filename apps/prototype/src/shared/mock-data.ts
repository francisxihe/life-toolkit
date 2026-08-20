import { FolderKanban, Grid2X2, ListTodo, Sparkles, Target, TrendingUp } from 'lucide-react';
import growthFixtures from '../fixtures/growth.json';
import { productEnumValues } from '../product-wiki';
import type { Goal, GoalType, Habit, NavigationItem, Task, Todo } from './types';

export const TODAY = '2026-07-27';
export const NEXT_DAY = '2026-07-28';
export const HOLIDAYS_2026 = new Set(['2026-01-01', '2026-01-02', '2026-01-03', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-04-04', '2026-04-05', '2026-04-06', '2026-05-01', '2026-05-02', '2026-05-03', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07']);

const goalTypeLabels: Record<GoalType, string> = { vision: '规划', result: '指标' };
export const goalTypes: Array<{ value: GoalType; label: string }> = productEnumValues('growth.goal', 'goal', 'type').map((value) => ({ value: value as GoalType, label: goalTypeLabels[value as GoalType] || value }));
export const nav: NavigationItem[] = [
  { id: 'workbench', path: '/workbench', label: '工作台', icon: Grid2X2 },
  { id: 'goal', path: '/goals', label: '目标', icon: Target },
  { id: 'task', path: '/tasks', label: '任务', icon: FolderKanban },
  { id: 'todo', path: '/todos', label: '待办事项', icon: ListTodo },
  { id: 'habit', path: '/habits', label: '习惯', icon: TrendingUp },
  { id: 'ai', path: '/ai', label: 'AI', icon: Sparkles },
];

export const initialGoals = growthFixtures.goals as unknown as Goal[];
export const initialTasks = growthFixtures.tasks as unknown as Task[];
export const initialTodos = growthFixtures.todos as unknown as Todo[];
export const initialHabits = growthFixtures.habits as unknown as Habit[];
