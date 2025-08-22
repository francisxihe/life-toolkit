'use client';

import { Outlet } from 'react-router-dom';
import { GoalProvider } from './context';
import TabsPage from '@/components/Layout/TabsPage';

export default function GoalPage() {
  return (
    <GoalProvider>
      <TabsPage
        tabs={[
          {
            path: '/growth/goal/goal-all',
            name: '目标',
          },
          {
            path: '/growth/goal/goal-mind-map',
            name: '思维导图',
          },
        ]}
      >
        <Outlet></Outlet>
      </TabsPage>
    </GoalProvider>
  );
}
