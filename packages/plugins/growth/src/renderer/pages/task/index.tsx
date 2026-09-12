'use client';

import { TabsPage } from '@true-north/plugin-ui';
import { CreateButton } from '@true-north/plugin-ui';
import { useTaskDetail } from '../components';
import { AgendaProvider, useAgendaDate } from '../components/day-agenda/context';
import { growthHref } from '@true-north/plugin-growth/contract';
import type { GrowthTab } from '@true-north/plugin-growth/contract';
import TaskToday from './task-today';
import TaskCalendar from './task-calendar';
import TaskAll from './task-all';

function TaskPageContent({ tab }: { tab: GrowthTab }) {
  const { openCreateDrawer } = useTaskDetail();
  const { selectedDate } = useAgendaDate();
  const currentTab = tab === 'calendar' || tab === 'all' ? tab : 'today';

  return (
    <TabsPage
      tabs={[
        { name: '当前任务', href: growthHref({ area: 'task', tab: 'today' }), active: currentTab === 'today' },
        { name: '任务日历', href: growthHref({ area: 'task', tab: 'calendar' }), active: currentTab === 'calendar' },
        { name: '全部任务', href: growthHref({ area: 'task', tab: 'all' }), active: currentTab === 'all' },
      ]}
      extra={
        <CreateButton
          onClick={() => {
            openCreateDrawer({
              contentProps: {
                initialFormData: {
                  planTimeRange: [selectedDate.startOf('day'), selectedDate.endOf('day')],
                },
              },
            });
          }}
        >
          新建任务
        </CreateButton>
      }
    >
      {currentTab === 'calendar' ? <TaskCalendar /> : null}
      {currentTab === 'all' ? <TaskAll /> : null}
      {currentTab === 'today' ? <TaskToday /> : null}
    </TabsPage>
  );
}

export default function TaskPage({ tab }: { tab: GrowthTab }) {
  return (
    <AgendaProvider>
      <TaskPageContent tab={tab} />
    </AgendaProvider>
  );
}
