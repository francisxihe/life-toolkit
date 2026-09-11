import { pluginPath } from '@true-north/plugin-sdk';

export const GROWTH_PLUGIN_ID = 'growth';
export const GoalDecomposeKey = 'goal.decompose';
export const TaskDecomposeKey = 'task.decompose';

export const growthPaths = {
  root: pluginPath(GROWTH_PLUGIN_ID),
} as const;

export type GrowthArea = 'todo' | 'task' | 'habit' | 'goal';
export type GrowthTab = 'today' | 'calendar' | 'all' | 'list' | 'detail';

export type GrowthView = {
  area?: GrowthArea;
  tab?: GrowthTab;
  id?: string;
  goalId?: string;
};

export function growthHref(view: GrowthView = {}): string {
  const params = new URLSearchParams();
  if (view.area) params.set('area', view.area);
  if (view.tab) params.set('tab', view.tab);
  if (view.id) params.set('id', view.id);
  if (view.goalId) params.set('goalId', view.goalId);
  const query = params.toString();
  return query ? `${growthPaths.root}?${query}` : growthPaths.root;
}
