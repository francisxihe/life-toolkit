import { useMemo } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { getRendererRuntime } from '@true-north/plugin-sdk';
import lazyload from '@/utils/lazyload';
import { pluginPaths } from './paths';

const ForbiddenPage = lazyload(() => import('@/features/app/exception/403'));

export function PluginStage() {
  const { pluginKey } = useParams();
  const plugin = getRendererRuntime().plugins.find((entry) => entry.pluginId === pluginKey);
  const load = plugin?.load;
  const Component = useMemo(() => (load ? lazyload(load) : null), [load]);

  if (!plugin || !Component) {
    return <ForbiddenPage />;
  }

  return <Component />;
}

export function LegacyPluginPathRedirect() {
  const { pluginKey } = useParams();
  const location = useLocation();
  const plugin = getRendererRuntime().plugins.find((entry) => entry.pluginId === pluginKey);
  if (!plugin) {
    return <Navigate to={pluginPaths.root} replace />;
  }
  return <Navigate to={`${plugin.path}${location.search}${location.hash}`} replace />;
}
