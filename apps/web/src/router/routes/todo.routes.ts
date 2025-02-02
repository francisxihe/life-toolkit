import { IRoute } from '@/router/routes';

export const todoRoutes: IRoute = {
  name: 'menu.todo',
  key: '/todo',
  breadcrumb: true,
  children: [
    {
      name: 'menu.todo.today',
      key: 'todo-today',
      breadcrumb: true,
    },
    {
      name: 'menu.todo.week',
      key: 'todo-week',
      breadcrumb: true,
    },
    {
      name: 'menu.todo.calendar',
      key: 'todo-calendar',
      breadcrumb: true,
    },
    {
      name: 'menu.todo.all',
      key: 'todo-all',
      breadcrumb: true,
    },
    {
      name: 'menu.todo.dashboard',
      key: 'todo-dashboard',
      breadcrumb: true,
    },
  ],
};
