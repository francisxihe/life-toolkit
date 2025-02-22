import { IRoute } from '@/router/routes';

export const expensesRoutes: IRoute = {
  name: 'menu.expense',
  key: '/expense',
  breadcrumb: true,
  children: [
    {
      name: 'menu.expense.transaction',
      key: 'transaction',
      breadcrumb: true,
    },
    {
      name: 'menu.expense.budget',
      key: 'budget',
      breadcrumb: true,
    },
    {
      name: 'menu.expense.overview',
      key: 'overview',
      breadcrumb: true,
    },
  ],
};
