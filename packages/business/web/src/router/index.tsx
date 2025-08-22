import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import PageLayout from '../layout/layout';
import lazyload from '../utils/lazyload';
import useRouter, { FlattenRoute, RouterContext } from './useRouter';

function Router() {
  const router = useRouter();

  function renderRouteComponent(routes: FlattenRoute[]) {
    return routes.map((route) => {
      return (
        route.component && (
          <Route
            key={route.fullPath}
            path={`${route.key}`}
            element={<route.component />}
          >
            {route.children && renderRouteComponent(route.children)}
          </Route>
        )
      );
    });
  }

  return (
    <RouterContext.Provider value={{ router }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PageLayout />}>
          {renderRouteComponent(
            router.flattenRoutes.filter((r) => /^\//.test(r.key) && r.fullPath)
          )}
          {/* {flattenRoutes.map((route) => {
          return (
            <Route
              key={route.key}
              path={`/${route.key}`}
              element={<route.component />}
            >
              {route.children?.map((child) => {
                return (
                  child.component && (
                    <Route
                      key={child.key}
                      path={`/${child.key}`}
                      element={<child.component />}
                    />
                  )
                );
              })}
            </Route>
          );
        })} */}
          {/* <Route
          path="/"
          // element={<Navigate to={`/${defaultRoute}`} />}
        /> */}
          <Route
            path="*"
            element={lazyload(() => import('../pages/exception/403'))}
          />
        </Route>
      </Routes>
    </RouterContext.Provider>
  );
}

export default Router;
