import type { ComponentType, SVGProps } from 'react';
import { User } from 'lucide-react';
import auth, { AuthParams } from '@/utils/authentication';
import { useEffect, useMemo, useState } from 'react';
import { attachPageLoaders, pluginRoutes } from '@/plugin/catalog';

export type RouteIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export type IRouteMeta = {
  icon?: RouteIcon;
};

export type IRoute = AuthParams & {
  name: string;
  key: string;
  fullPath?: string;
  /** 页面组件在 features 下的路径，默认等于 fullPath */
  componentPath?: string;
  component?: any;
  loader?: () => Promise<{ default: any }>;
  redirect?: string;
  children?: IRoute[];
  breadcrumb?: boolean;
  ignore?: boolean;
  onlyMenu?: boolean;
  meta?: IRouteMeta;
};

export const userRoute: IRoute = {
  name: 'menu.user',
  key: '/user',
  ignore: true,
  breadcrumb: true,
  meta: { icon: User },
};

export const routes: IRoute[] = [];

function currentRoutes(): IRoute[] {
  return [...attachPageLoaders(pluginRoutes()), userRoute];
}

export const getName = (path: string, routes) => {
  return routes.find((item) => {
    const itemPath = `/${item.key}`;
    if (path === itemPath) {
      return item.name;
    } else if (item.children) {
      return getName(path, item.children);
    }
  });
};

export const generatePermission = (role: string) => {
  const actions = role === 'admin' ? ['*'] : ['read'];
  const result = {};
  currentRoutes().forEach((item) => {
    if (item.children) {
      item.children.forEach((child) => {
        result[child.name] = actions;
      });
    }
  });
  return result;
};

const useRoute = (userPermission): [IRoute[], string] => {
  const filterRoute = (routes: IRoute[], arr = []): IRoute[] => {
    if (!routes.length) {
      return [];
    }
    for (const route of routes) {
      const { requiredPermissions, oneOfPerm } = route;
      let visible = true;
      if (requiredPermissions) {
        visible = auth({ requiredPermissions, oneOfPerm }, userPermission);
      }

      if (!visible) {
        continue;
      }
      if (route.children && route.children.length) {
        const newRoute = { ...route, children: [] };
        filterRoute(route.children, newRoute.children);
        if (newRoute.children.length) {
          arr.push(newRoute);
        }
      } else {
        arr.push({ ...route });
      }
    }

    return arr;
  };

  const [permissionRoute, setPermissionRoute] = useState<IRoute[]>([]);

  useEffect(() => {
    const newRoutes = filterRoute(currentRoutes());
    setPermissionRoute(newRoutes);
  }, [JSON.stringify(userPermission)]);

  const defaultRoute = useMemo(() => {
    const first = permissionRoute[0];
    if (first) {
      const firstRoute = first?.children?.[0]?.key || first.key;
      return firstRoute;
    }
    return '';
  }, [permissionRoute]);

  return [permissionRoute, defaultRoute];
};

export default useRoute;
