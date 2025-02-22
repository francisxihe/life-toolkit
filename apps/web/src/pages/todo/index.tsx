'use client';

import { Outlet } from 'react-router-dom';
import { TodoProvider } from './todo-dashboard/context';

export default function TodoPage() {
  return (
    <TodoProvider>
      <Outlet></Outlet>
    </TodoProvider>
  );
}
