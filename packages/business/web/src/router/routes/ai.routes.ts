import { IRoute } from '@/router/routes';

export const aiRoutes: IRoute = {
  name: 'menu.ai',
  key: '/ai',
  onlyMenu: true,
  children: [
    {
      name: 'menu.ai.media',
      key: '/ai/media',
    },
  ],
};

