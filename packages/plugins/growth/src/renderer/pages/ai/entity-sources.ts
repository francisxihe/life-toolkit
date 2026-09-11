import type { NavigateFunction } from 'react-router-dom';
import { GoalService, TaskService } from '@true-north/web-service';
import { openTaskDrawer } from '../task/detail/TaskDrawer';
import { growthHref } from '@true-north/plugin-growth/contract';
import type { AiEntitySource } from '@true-north/plugin-sdk';

export function createGrowthEntitySources(navigate: NavigateFunction): AiEntitySource[] {
  return [
    {
      type: 'goal',
      kindLabel: '目标',
      boundKindLabel: '目标',
      searchParam: 'goalId',
      async list() {
        const result = await GoalService.findByFilter({});
        return (result?.list || []).map((goal) => ({ type: 'goal', id: goal.id, label: goal.name }));
      },
      async find(id: string) {
        try {
          const goal = await GoalService.find(id);
          return goal?.id ? { type: 'goal', id: goal.id, label: goal.name } : null;
        } catch {
          return null;
        }
      },
      open(id: string) {
        navigate(growthHref({ area: 'goal', goalId: id }));
      },
    },
    {
      type: 'task',
      kindLabel: '任务',
      boundKindLabel: '任务',
      searchParam: 'taskId',
      async list() {
        const result = await TaskService.findByFilter({});
        return (result?.list || []).map((task) => ({ type: 'task', id: task.id, label: task.name }));
      },
      async find(id: string) {
        try {
          const task = await TaskService.find(id);
          return task?.id ? { type: 'task', id: task.id, label: task.name } : null;
        } catch {
          return null;
        }
      },
      open(id: string) {
        openTaskDrawer({ taskId: id });
      },
    },
  ];
}
