'use client';

import { Outlet } from 'react-router-dom';
import { TodoProvider } from './context';
import Tabs, { Tab } from '@life-toolkit/tabs/src/index';
import { useState } from 'react';

console.log(Tabs);

export default function TodoPage() {
  const [activeKey, setActiveKey] = useState('tab-1');
  return (
    <TodoProvider>
      <Outlet></Outlet>
    </TodoProvider>
  );
}
