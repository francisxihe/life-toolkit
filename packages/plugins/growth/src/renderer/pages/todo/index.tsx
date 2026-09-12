'use client';

import { TabsPage } from '@true-north/plugin-ui';
import { CreateButton } from '@true-north/plugin-ui';
import { useTodoDetail } from '../components';
import { AgendaProvider, useAgendaDate } from '../components/day-agenda/context';
import { growthHref } from '@true-north/plugin-growth/contract';
import type { GrowthTab } from '@true-north/plugin-growth/contract';
import TodoToday from './todo-today';
import TodoCalendar from './todo-calendar';
import TodoAll from './todo-all';

function TodoPageContent({ tab }: { tab: GrowthTab }) {
  const { openCreateDrawer } = useTodoDetail();
  const { selectedDate } = useAgendaDate();
  const currentTab = tab === 'calendar' || tab === 'all' ? tab : 'today';

  return (
    <TabsPage
      tabs={[
        { name: '当前待办', href: growthHref({ area: 'todo', tab: 'today' }), active: currentTab === 'today' },
        { name: '待办日历', href: growthHref({ area: 'todo', tab: 'calendar' }), active: currentTab === 'calendar' },
        { name: '全部待办', href: growthHref({ area: 'todo', tab: 'all' }), active: currentTab === 'all' },
      ]}
      extra={
        <CreateButton
          onClick={() => {
            openCreateDrawer({
              contentProps: {
                initialFormData: {
                  planDate: selectedDate.format('YYYY-MM-DD'),
                },
              },
            });
          }}
        >
          新建待办
        </CreateButton>
      }
    >
      {currentTab === 'calendar' ? <TodoCalendar /> : null}
      {currentTab === 'all' ? <TodoAll /> : null}
      {currentTab === 'today' ? <TodoToday /> : null}
    </TabsPage>
  );
}

export default function TodoPage({ tab }: { tab: GrowthTab }) {
  return (
    <AgendaProvider>
      <TodoPageContent tab={tab} />
    </AgendaProvider>
  );
}
