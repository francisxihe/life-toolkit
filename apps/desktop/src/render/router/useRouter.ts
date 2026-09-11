import { IRoute } from '@/router/routes';
import lazyload from '@/utils/lazyload';
import { isArray } from 'lodash-es';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/store';
import useRoute from '@/router/routes';
import { useMemo } from 'react';
import 'nprogress/nprogress.css';
import NProgress from 'nprogress';
import { useNavigate } from 'react-router-dom';
import { createContext } from 'react';

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
    [routes],
  );

  // console.log('fullPathRoutes', fullPathRoutes);
  // console.log('flattenRoutes', flattenRoutes);

  function routerTo(key) {
    const currentRoute = flattenRoutes.find((r) => r.fullPath === key);
    if (!currentRoute) return;

    const go = () => {
      let path = currentRoute.fullPath || `/${key}`;
      if (currentRoute.redirect) {
        path = currentRoute.redirect;
      }
      navigate(path);
    };

    if (!currentRoute.component?.preload) {
      go();
      return;
    }

    NProgress.start();
    currentRoute.component.preload().then(() => {
      go();
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
          if (flattenRoute.component) {
            // already loaded
          } else if (flattenRoute.loader) {
            flattenRoute.component = lazyload(flattenRoute.loader);
          }
        }
      } catch (e) {
        // console.log(flattenRoute.key);
        // console.error(e);
      }

      if (isArray(flattenRoute.children) && flattenRoute.children.length) {
        flattenRoute.children = travel(flattenRoute.children, flattenRoute.fullPath || flattenRoute.key);
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
