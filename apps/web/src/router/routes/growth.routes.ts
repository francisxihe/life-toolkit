import { IRoute } from '@/router/routes';

export const todoRoutes: IRoute = {
  name: 'menu.todo',
  key: '/growth/todo',
  breadcrumb: true,
  redirect: '/growth/todo/todo-today',
  children: [
    {
      name: 'menu.todo.today',
      key: 'todo-today',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.todo.week',
      key: 'todo-week',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.todo.calendar',
      key: 'todo-calendar',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.todo.all',
      key: 'todo-all',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.todo.dashboard',
      key: 'todo-dashboard',
      breadcrumb: true,
      ignore: true,
    },
  ],
};

export const taskRoutes: IRoute = {
  name: 'menu.task',
  key: '/growth/task',
  breadcrumb: true,
  redirect: '/growth/task/task-week',
  children: [
    {
      name: 'menu.task.week',
      key: 'task-week',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.task.calendar',
      key: 'task-calendar',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.task.all',
      key: 'task-all',
      breadcrumb: true,
      ignore: true,
    },
  ],
};

export const goalRoutes: IRoute = {
  name: 'menu.goal',
  key: '/growth/goal',
  breadcrumb: true,
  redirect: '/growth/goal/goal-all',
  children: [
    {
      name: 'menu.goal.all',
      key: 'goal-all',
      breadcrumb: true,
      ignore: true,
    },
  ],
};

export const timerRoutes: IRoute = {
  name: 'menu.timer',
  key: '/timer',
  breadcrumb: true,
};

export const growthRoutes: IRoute = {
  name: 'menu.growth',
  key: '/growth',
  breadcrumb: true,
  children: [todoRoutes, taskRoutes, goalRoutes, timerRoutes],
};
