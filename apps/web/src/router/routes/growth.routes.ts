import { IRoute } from '@/router/routes';

export const todoRoutes: IRoute = {
  name: 'menu.todo',
  key: '/growth/todo',
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

export const taskRoutes: IRoute = {
  name: 'menu.task',
  key: '/growth/task',
  breadcrumb: true,
  children: [
    {
      name: 'menu.task.week',
      key: 'task-week',
      breadcrumb: true,
    },
    {
      name: 'menu.task.calendar',
      key: 'task-calendar',
      breadcrumb: true,
    },
    {
      name: 'menu.task.all',
      key: 'task-all',
      breadcrumb: true,
    },
  ],
};

export const goalRoutes: IRoute = {
  name: 'menu.goal',
  key: '/growth/goal',
  breadcrumb: true,
  children: [
    {
      name: 'menu.goal.all',
      key: 'goal-all',
      breadcrumb: true,
    },
  ],
};
