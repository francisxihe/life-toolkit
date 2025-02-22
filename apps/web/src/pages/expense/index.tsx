'use client';

import { Tabs } from '@arco-design/web-react';
import { ExpensesProvider } from './context';
import { Outlet } from 'react-router-dom';

const TabPane = Tabs.TabPane;

export default function ExpensesPage() {
  return (
    <ExpensesProvider>
      <Outlet></Outlet>
    </ExpensesProvider>
  );
}
