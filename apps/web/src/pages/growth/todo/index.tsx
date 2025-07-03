'use client';

import { Outlet } from 'react-router-dom';
import { TodoProvider } from './context';
import Tabs, { Tab } from '@life-toolkit/tabs/src/index';
import { useState } from 'react';
import clsx from 'clsx';
import styles from './style.module.less';
import TabsPage from '@/components/Layout/TabsPage';

export default function TodoPage() {
  // const [activeKey, setActiveKey] = useState('tab-1');

  // const handleTabClick = (id: string) => {
  //   setActiveKey(id);
  // };

  // const handleTabDrop = (id: string, index?: number) => {
  //   console.log('Tab dropped:', id, 'at index:', index);
  //   // 这里可以添加处理拖拽后的逻辑
  // };

  return (
    <TodoProvider>
      <TabsPage
        tabs={[
          { name: '今日待办', path: '/growth/todo/todo-today' },
          { name: '本周待办', path: '/growth/todo/todo-week' },
          { name: '待办日历', path: '/growth/todo/todo-calendar' },
          { name: '全部待办', path: '/growth/todo/todo-all' },
          { name: '待办统计', path: '/growth/todo/todo-dashboard' },
        ]}
      >
        <Outlet></Outlet>
      </TabsPage>
    </TodoProvider>
  );
}
