import type { ReactNode } from 'react';
import { Clock, Sprout } from 'lucide-react';
import { Tooltip } from '@sue/design-web-react';
import { defineRendererImplementation } from '@true-north/plugin-sdk';
import { useHostActions } from '@true-north/plugin-sdk/renderer';
import { useEffect } from 'react';
import { growthManifest } from '../plugin';
import { growthHref } from '../contract';
import { growthLocales } from './locales';
import { growthWorkbenchTools } from './pages/workbench/ai-decomposition/tools';
import { createGrowthEntitySources } from './pages/ai/entity-sources';
import { FocusTimerProvider, useFocusTimer } from './pages/focus-timer';
import { TaskDrawerHost } from './pages/task/detail/TaskDrawer';
import { bindPluginIpc } from '../client';

function FocusTimerSlot({ children }: { children?: ReactNode }) {
  return <FocusTimerProvider>{children}</FocusTimerProvider>;
}

function TaskDrawerSlot() {
  return <TaskDrawerHost />;
}

function FocusActionSlot() {
  const { open } = useFocusTimer();
  const hostActions = useHostActions();
  useEffect(() => hostActions.register('growth.open-focus', (input) => open(input as never)), [hostActions, open]);
  return (
    <Tooltip title="打开专注计时" placement="right">
      <button type="button" aria-label="打开专注计时" onClick={() => open()}>
        <Clock size={16} />
      </button>
    </Tooltip>
  );
}

export function createRenderer() {
  return defineRendererImplementation(growthManifest, {
    activate(ctx) {
      bindPluginIpc(ctx.ipc);
      return {
        icon: Sprout,
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
    },
  });
}
