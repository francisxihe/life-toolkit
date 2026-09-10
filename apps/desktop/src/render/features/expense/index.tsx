'use client';

import { ExpensesProvider } from './context';
import { Outlet } from 'react-router-dom';

export default function ExpensesPage() {
  return (
    <ExpensesProvider>
      <Outlet></Outlet>
    </ExpensesProvider>
  );
}
