'use client';

import { TodoProvider } from './context';

export default function TodoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TodoProvider>{children}</TodoProvider>;
}
