import { useEffect, useMemo } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Login from '@/features/login';
import PageLayout from '@/features/app/Layout';
import SettingLayout from '@/features/setting/SettingLayout';
import lazyload from '../utils/lazyload';
import useRouter, { FlattenRoute, RouterContext, getFlattenRoutes } from './useRouter';
import { HostProviders } from '@/features/app/HostProviders';
import { rememberReturnPath } from '@/features/setting/returnPath';
import { settingRoutes } from './routes/setting.routes';
import { PluginsShell } from '@/plugin/PluginsShell';
import PluginsHome from '@/plugin/PluginsHome';
import { LegacyPluginPathRedirect, PluginStage } from '@/plugin/PluginStage';

const ForbiddenPage = lazyload(() => import('@/features/app/exception/403'));

function LegacyToPlugins({ prefix }: { prefix: string }) {
  const location = useLocation();
  const rest = location.pathname.startsWith(prefix)
    ? location.pathname.slice(prefix.length)
    : location.pathname;
  return <Navigate to={`/plugins${prefix}${rest}${location.search}${location.hash}`} replace />;
}

function ActivityToPlugins() {
  const location = useLocation();
  if (location.pathname === '/activity' || location.pathname === '/activity/') {
    return <Navigate to="/plugins" replace />;
  }
  if (location.pathname.startsWith('/activity/growth')) {
    return <Navigate to={location.pathname.replace('/activity/growth', '/plugins/growth') + location.search + location.hash} replace />;
  }
  if (location.pathname.startsWith('/activity/expense')) {
    return <Navigate to={location.pathname.replace('/activity/expense', '/plugins/expense') + location.search + location.hash} replace />;
  }
  if (location.pathname.startsWith('/activity/purchase')) {
    return <Navigate to={location.pathname.replace('/activity/purchase', '/plugins/purchase') + location.search + location.hash} replace />;
  }
  if (location.pathname.startsWith('/activity/library')) {
    return <Navigate to={location.pathname.replace('/activity/library', '/plugins/library') + location.search + location.hash} replace />;
  }
  return <Navigate to={`/plugins${location.search}${location.hash}`} replace />;
}

function Router() {
  const router = useRouter();
  const location = useLocation();
  const { flattenRoutes: settingFlattenRoutes } = useMemo(
    () => getFlattenRoutes(settingRoutes),
    [],
  );

  useEffect(() => {
    rememberReturnPath(location.pathname);
  }, [location.pathname]);

  function renderRouteComponent(routes: FlattenRoute[]) {
    return routes.map((route) => {
      const nested = (route.children || []).filter((child) => !/^\//.test(child.key));
      return (
        route.component && (
          <Route
            key={route.fullPath}
            path={`${route.key}`}
            element={<route.component />}
          >
            {route.redirect && nested.length ? (
              <Route index element={<Navigate to={route.redirect} replace />} />
            ) : null}
            {nested.length ? renderRouteComponent(nested) : null}
          </Route>
        )
      );
    });
  }

  return (
    <RouterContext.Provider value={{ router }}>
      <HostProviders>
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
            <Route path="plugins/activity" element={<Navigate to="/plugins" replace />} />
            <Route path="plugins/activity/*" element={<Navigate to="/plugins" replace />} />
            {renderRouteComponent(
              router.flattenRoutes.filter(
                (route) => /^\//.test(route.key) && route.fullPath && route.fullPath !== '/plugins',
              ),
            )}
            <Route path="plugins" element={<PluginsShell />}>
              <Route index element={<PluginsHome />} />
              <Route path=":pluginKey" element={<PluginStage />} />
              <Route path=":pluginKey/*" element={<LegacyPluginPathRedirect />} />
            </Route>
            <Route path="activity/*" element={<ActivityToPlugins />} />
            <Route path="growth/*" element={<LegacyToPlugins prefix="/growth" />} />
            <Route path="expense/*" element={<LegacyToPlugins prefix="/expense" />} />
            <Route path="purchase" element={<LegacyToPlugins prefix="/purchase" />} />
            <Route path="purchase/*" element={<LegacyToPlugins prefix="/purchase" />} />
            <Route path="library" element={<LegacyToPlugins prefix="/library" />} />
            <Route path="library/*" element={<LegacyToPlugins prefix="/library" />} />
            <Route path="*" element={<ForbiddenPage />} />
          </Route>
        </Routes>
      </HostProviders>
    </RouterContext.Provider>
  );
}

export default Router;
