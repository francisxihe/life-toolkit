import { IRoute } from '@/router/routes';
import lazyload from '@/utils/lazyload';
import { isArray } from 'lodash-es';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/store';
import useRoute from '@/router/routes';
import { useMemo } from 'react';
import NProgress from 'nprogress';
import { useNavigate } from 'react-router-dom';
import { createContext } from 'react';
import { getComponentModule } from './helpers';

export const RouterContext = createContext(null);

export interface FlattenRoute extends IRoute {
  component?: any;
}

export default function useRouter() {
  const navigate = useNavigate();

  const { userInfo } = useSelector((state: GlobalState) => state);

  const [routes, defaultRoute] = useRoute(userInfo?.permissions);

  const { flattenRoutes, fullPathRoutes } = useMemo(
    () => getFlattenRoutes(routes),
    [routes]
  );

  console.log('fullPathRoutes', fullPathRoutes);
  console.log('flattenRoutes', flattenRoutes);

  function routerTo(key) {
    console.log('key', key);
    const currentRoute = flattenRoutes.find((r) => r.fullPath === key);
    const component = currentRoute.component;
    const preload = component.preload();
    NProgress.start();
    preload.then(() => {
      console.log('currentRoute', currentRoute);
      navigate(currentRoute.fullPath ? currentRoute.fullPath : `/${key}`);
      NProgress.done();
    });
  }

  return {
    flattenRoutes,
    fullPathRoutes,
    to: routerTo,
    defaultRoute,
  };
}

export function getFlattenRoutes(routes: IRoute[]) {
  const flattenRoutes = [];
  function travel(_routes: IRoute[], parentPath?: string) {
    return _routes.map((route) => {
      const flattenRoute: FlattenRoute = { ...route };

      try {
        flattenRoute.fullPath = undefined;
        if (flattenRoute.key) {
          if (/^\//.test(flattenRoute.key)) {
            flattenRoute.fullPath = flattenRoute.key;
          } else if (parentPath) {
            flattenRoute.fullPath = `${parentPath}/${flattenRoute.key}`;
          }
        }
        if (flattenRoute.fullPath && !flattenRoute.onlyMenu) {
          flattenRoute.component = lazyload(
            getComponentModule(flattenRoute.fullPath)
          );
        }
      } catch (e) {
        // console.log(flattenRoute.key);
        // console.error(e);
      }

      if (isArray(flattenRoute.children) && flattenRoute.children.length) {
        flattenRoute.children = travel(flattenRoute.children, flattenRoute.key);
      }
      flattenRoutes.push(flattenRoute);
      return flattenRoute;
    });
  }

  const fullPathRoutes = travel(routes, '');

  return {
    flattenRoutes,
    fullPathRoutes,
  };
}
