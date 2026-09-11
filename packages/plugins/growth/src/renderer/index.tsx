import type { ReactNode } from 'react';
import { Clock, Sprout } from 'lucide-react';
import { Tooltip } from '@sue/design-web-react';
import type { PluginRendererContribution } from '@true-north/plugin-sdk';
import { growthHref } from '../contract';
import { growthLocales } from './locales';
import { growthWorkbenchTools } from './pages/workbench/ai-decomposition/tools';
import { createGrowthEntitySources } from './pages/ai/entity-sources';
import { FocusTimerProvider, useFocusTimer } from './pages/focus-timer';
import { TaskDrawerHost } from './pages/task/detail/TaskDrawer';
import GoalEditor from './pages/components/goal-detail/GoalEditor';
import GoalCreator from './pages/components/goal-detail/GoalCreator';
import { registerGoalMindMapEditors } from '@/features/mind-map/editors';

function FocusTimerSlot({ children }: { children?: ReactNode }) {
  return <FocusTimerProvider>{children}</FocusTimerProvider>;
}

function TaskDrawerSlot() {
  return <TaskDrawerHost />;
}

function FocusActionSlot() {
  const { open } = useFocusTimer();
  return (
    <Tooltip title="打开专注计时" placement="right">
      <button type="button" aria-label="打开专注计时" onClick={() => open()}>
        <Clock size={16} />
      </button>
    </Tooltip>
  );
}

export function createRenderer(): PluginRendererContribution {
  registerGoalMindMapEditors({ GoalEditor, GoalCreator } as never);
  return {
    nameKey: 'menu.growth',
    icon: Sprout,
    descriptionKey: 'growth.hub.description',
    categoryKey: 'plugins.category.builtin',
    keywords: ['todo', 'task', 'habit', 'goal', '待办', '任务', '习惯', '目标'],
    order: 10,
    load: () => import('./pages/index'),
    workbenchTools: growthWorkbenchTools,
    locales: [growthLocales],
    entitySources: createGrowthEntitySources,
    shellSlots: [
      { slot: 'app-providers', pluginId: 'growth', id: 'focus-timer', order: 30, render: FocusTimerSlot },
      { slot: 'page-overlay', pluginId: 'growth', id: 'task-drawer', order: 10, render: TaskDrawerSlot },
      { slot: 'aside-actions', pluginId: 'growth', id: 'focus-action', order: 10, render: FocusActionSlot },
    ],
    entityPresenters: [
      { pluginId: 'growth', entityType: 'todo', kindLabel: '待办', openPath: () => growthHref({ area: 'todo' }) },
      { pluginId: 'growth', entityType: 'task', kindLabel: '任务', openPath: () => growthHref({ area: 'task' }) },
      { pluginId: 'growth', entityType: 'habit', kindLabel: '习惯', openPath: (id) => growthHref({ area: 'habit', tab: 'detail', id }) },
      { pluginId: 'growth', entityType: 'goal', kindLabel: '目标', openPath: () => growthHref({ area: 'goal' }) },
    ],
  };
}
