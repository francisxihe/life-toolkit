'use client';

import { Outlet } from 'react-router-dom';

import { TodoProvider } from './todo-dashboard/context';

export function TodoLayout({ children }: { children: React.ReactNode }) {
  return <TodoProvider>{children}</TodoProvider>;
}

export default function TodoPage() {
  return (
    <TodoLayout>
      <Outlet></Outlet>
    </TodoLayout>
  );
}
