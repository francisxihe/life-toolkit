'use client';

import { Outlet } from 'react-router-dom';
import TodoLayout from './layout';

export default function TodoPage() {
  return (
    <TodoLayout>
      <Outlet></Outlet>
    </TodoLayout>
  );
}
