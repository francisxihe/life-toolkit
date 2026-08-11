import { IRoute } from '@/router/routes';

export const workbenchRoutes: IRoute = {
  name: 'menu.workbench',
  key: '/growth/workbench',
  breadcrumb: true,
};

export const todoRoutes: IRoute = {
  name: 'menu.todo',
  key: '/growth/todo',
  breadcrumb: false,
  redirect: '/growth/todo/todo-today',
  children: [
    {
      name: 'menu.todo.today',
      key: 'todo-today',
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
  ],
};

export const taskRoutes: IRoute = {
  name: 'menu.task',
  key: '/growth/task',
  breadcrumb: false,
  redirect: '/growth/task/task-today',
  children: [
    {
      name: 'menu.task.today',
      key: 'task-today',
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
  breadcrumb: false,
  // redirect: '/growth/goal',
  // children: [
  //   {
  //     name: 'menu.goal.all',
  //     key: 'goal-all',
  //     breadcrumb: true,
  //     ignore: true,
  //   },
  //   {
  //     name: 'menu.goal.mindmap',
  //     key: 'goal-mind-map',
  //     breadcrumb: true,
  //     ignore: true,
  //   },
  //   {
  //     name: 'menu.goal.tree',
  //     key: 'goal-tree-view',
  //     breadcrumb: true,
  //     ignore: true,
  //   },
  // ],
};

export const habitRoutes: IRoute = {
  name: 'menu.habit',
  key: '/growth/habit',
  breadcrumb: true,
  redirect: '/growth/habit/habit-list',
  children: [
    {
      name: 'menu.habit.list',
      key: 'habit-list',
      breadcrumb: true,
      ignore: true,
    },
    {
      name: 'menu.habit.detail',
      key: 'habit-detail/:id',
      breadcrumb: true,
      ignore: true,
    },
  ],
};

export const growthRoutes: IRoute = {
  name: 'menu.growth',
  key: '/growth',
  breadcrumb: false,
  children: [
    workbenchRoutes,
    todoRoutes,
    taskRoutes,
    habitRoutes,
    goalRoutes,
  ],
};
