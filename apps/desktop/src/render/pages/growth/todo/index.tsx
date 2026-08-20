'use client';

import { Outlet } from 'react-router-dom';
import TabsPage from '@/components/Layout/TabsPage';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTodoDetail } from '../components';
import { DayAgendaDateProvider, useDayAgendaDate } from '../components/DayAgenda/context';

function TodoPageContent() {
  const { openCreateDrawer } = useTodoDetail();
  const { selectedDate } = useDayAgendaDate();

  return (
    <TabsPage
      tabs={[
        { name: '当前待办', path: '/growth/todo/todo-today' },
        { name: '待办日历', path: '/growth/todo/todo-calendar' },
        { name: '全部待办', path: '/growth/todo/todo-all' },
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
      <Outlet />
    </TabsPage>
  );
}

export default function TodoPage() {
  return (
    <DayAgendaDateProvider>
      <TodoPageContent />
    </DayAgendaDateProvider>
  );
}
