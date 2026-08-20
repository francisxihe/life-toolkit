import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login';
import PageLayout from '../layout/layout';
import lazyload from '../utils/lazyload';
import useRouter, { FlattenRoute, RouterContext } from './useRouter';
import { TaskDetailDrawerHost } from '../pages/growth/task/detail/TaskDetailDrawer';
import { FocusTimerProvider } from '../pages/growth/focus-timer';

const ForbiddenPage = lazyload(() => import('../pages/exception/403'));

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
      <FocusTimerProvider>
        <TaskDetailDrawerHost />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PageLayout />}>
            {renderRouteComponent(
              router.flattenRoutes.filter((r) => /^\//.test(r.key) && r.fullPath),
            )}
            <Route path="*" element={<ForbiddenPage />} />
          </Route>
        </Routes>
      </FocusTimerProvider>
    </RouterContext.Provider>
  );
}

export default Router;
