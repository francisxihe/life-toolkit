import { IRoute } from '@/router/routes';

export const habitRoutes: IRoute = {
  name: 'menu.habit',
  key: '/growth/habit',
  breadcrumb: true,
  children: [
    {
      name: 'menu.habit.list',
      key: 'habit-list',
      breadcrumb: true,
    },
    {
      name: 'menu.habit.detail',
      key: 'habit-detail',
      breadcrumb: true,
    },
    {
      name: 'menu.habit.statistics',
      key: 'habit-statistics',
      breadcrumb: true,
    },
  ],
};

export default habitRoutes;
