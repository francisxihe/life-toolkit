'use client';

import { Outlet } from 'react-router-dom';
import { TaskProvider } from './context';

export default function TaskPage() {
  return (
    <TaskProvider>
      <Outlet></Outlet>
    </TaskProvider>
  );
}
