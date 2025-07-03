'use client';

import { Outlet } from 'react-router-dom';
import { TaskProvider } from './context';
import TabsPage from '@/components/Layout/TabsPage';

export default function TaskPage() {
  return (
    <TaskProvider>
      <TabsPage
        tabs={[
          { name: '本周任务', path: '/growth/task/task-week' },
          { name: '任务日历', path: '/growth/task/task-calendar' },
          { name: '全部任务', path: '/growth/task/task-all' },
        ]}
      >
        <Outlet></Outlet>
      </TabsPage>
    </TaskProvider>
  );
}
