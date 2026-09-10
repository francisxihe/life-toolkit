import { useEffect, useMemo } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Login from '@/features/login';
import PageLayout from '@/features/app';
import SettingLayout from '@/features/setting/SettingLayout';
import lazyload from '../utils/lazyload';
import useRouter, { FlattenRoute, RouterContext, getFlattenRoutes } from './useRouter';
import { TaskDetailDrawerHost } from '@/features/growth/task/detail/TaskDetailDrawer';
import { FocusTimerProvider } from '@/features/growth/focus-timer';
import { WorkbenchProvider } from '@/features/workbench';
import { rememberSettingReturnPath } from '@/features/setting/return-path';
import { settingRoutes } from './routes/setting.routes';

const ForbiddenPage = lazyload(() => import('@/features/exception/403'));

function Router() {
  const router = useRouter();
  const location = useLocation();
  const { flattenRoutes: settingFlattenRoutes } = useMemo(
    () => getFlattenRoutes(settingRoutes),
    [],
  );

  useEffect(() => {
    rememberSettingReturnPath(location.pathname);
  }, [location.pathname]);

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
        <WorkbenchProvider>
          <TaskDetailDrawerHost />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setting" element={<SettingLayout />}>
              <Route index element={<Navigate to="appearance" replace />} />
              {renderRouteComponent(
                settingFlattenRoutes.filter((route) => /^\//.test(route.key) && route.fullPath),
              )}
            </Route>
            <Route path="/" element={<PageLayout />}>
              <Route index element={<Navigate to="/ai" replace />} />
              {renderRouteComponent(
                router.flattenRoutes.filter((route) => /^\//.test(route.key) && route.fullPath),
              )}
              <Route path="*" element={<ForbiddenPage />} />
            </Route>
          </Routes>
        </WorkbenchProvider>
      </FocusTimerProvider>
    </RouterContext.Provider>
  );
}

export default Router;
