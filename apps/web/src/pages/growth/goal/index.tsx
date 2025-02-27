'use client';

import { Outlet } from 'react-router-dom';
import { GoalProvider } from './context';

export default function GoalPage() {
  return (
    <GoalProvider>
      <Outlet></Outlet>
    </GoalProvider>
  );
}
