'use client';

import { Outlet } from 'react-router-dom';
import TabsPage from '@/components/Layout/TabsPage';
import { CreateButton } from '@/components/Button/CreateButton';
import { useTaskDetail } from '../components';
import { DayAgendaDateProvider, useDayAgendaDate } from '../components/DayAgenda/context';

function TaskPageContent() {
  const { openCreateDrawer } = useTaskDetail();
  const { selectedDate } = useDayAgendaDate();

  return (
    <TabsPage
      tabs={[
        { name: '当前任务', path: '/growth/task/task-today' },
        { name: '任务日历', path: '/growth/task/task-calendar' },
        { name: '全部任务', path: '/growth/task/task-all' },
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
      <Outlet />
    </TabsPage>
  );
}

export default function TaskPage() {
  return (
    <DayAgendaDateProvider>
      <TaskPageContent />
    </DayAgendaDateProvider>
  );
}
