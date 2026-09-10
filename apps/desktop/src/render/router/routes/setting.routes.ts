import { Palette } from 'lucide-react';
import { IRoute } from '@/router/routes';

export const settingRoutes: IRoute[] = [
  {
    name: 'setting.appearance',
    key: '/setting/appearance',
    meta: { icon: Palette },
  },
];
