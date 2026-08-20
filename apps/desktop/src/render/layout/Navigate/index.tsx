import { Menu } from '@sue/design-web-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IRoute } from '@/router/routes';
import useRouter from '@/router/useRouter';
import { getIconFromKey } from './helpers';

interface NavigateProps {
  collapsed: boolean;
  locale: string;
}

type MenuItem = {
  key: string;
  label: React.ReactNode;
  className?: string;
  children?: MenuItem[];
};

const Navigate: React.FC<NavigateProps> = ({ collapsed, locale }) => {
  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map());
  const menuMap = useRef<
    Map<string, { menuItem?: boolean; subMenu?: boolean }>
  >(new Map());

  const location = useLocation();
  const pathname = location.pathname;
  const { fullPathRoutes, to, defaultRoute } = useRouter();

  // 根据当前路径找到匹配的菜单项
  const findMatchingMenuKey = (pathname: string) => {
    // 如果是根路径，直接返回默认路由
    if (pathname === '/') {
      return defaultRoute;
    }

    // 遍历所有路由，找到最匹配的菜单项
    const findInRoutes = (routes: any[], parentPath = ''): string | null => {
      let bestMatch: string | null = null;
      let bestMatchLength = 0;

      for (const route of routes) {
        const routePath =
          route.fullPath || `${parentPath}/${route.key}`.replace(/\/+/g, '/');

        // 精确匹配
        if (pathname === routePath) {
          // 如果当前路由是 ignore 的，返回父路由的 fullPath
          if (route.ignore && parentPath) {
            return parentPath;
          }
          return routePath;
        }

        // 如果当前路径以路由路径开头
        if (
          pathname.startsWith(routePath + '/') ||
          pathname.startsWith(routePath)
        ) {
          if (route.children) {
            const childMatch = findInRoutes(route.children, routePath);
            if (childMatch) {
              return childMatch;
            }
            // 如果子路由都是 ignore 的，返回父路由的 fullPath
            const hasVisibleChildren = route.children.some(
              (child) => !child.ignore,
            );
            if (!hasVisibleChildren && routePath.length > bestMatchLength) {
              bestMatch = routePath;
              bestMatchLength = routePath.length;
            }
          } else if (routePath.length > bestMatchLength) {
            // 没有子路由的情况下，记录最长匹配
            bestMatch = routePath;
            bestMatchLength = routePath.length;
          }
        }
      }

      return bestMatch;
    };

    const result = findInRoutes(fullPathRoutes);
    return result || defaultRoute;
  };

  const matchingKey = findMatchingMenuKey(pathname);
  const defaultSelectedKeys = [matchingKey];

  // 构建默认展开的父级菜单
  const buildDefaultOpenKeys = (key: string) => {
    const openKeys: string[] = [];
    const parts = key.replace(/^\//, '').split('/');

    for (let i = 1; i < parts.length; i++) {
      const parentPath = '/' + parts.slice(0, i).join('/');
      if (menuMap.current.get(parentPath)?.subMenu) {
        openKeys.push(parentPath);
      }
    }

    return openKeys;
  };

  const defaultOpenKeys = buildDefaultOpenKeys(matchingKey);

  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(defaultSelectedKeys);
  const [inlineOpenKeys, setInlineOpenKeys] = useState<string[]>(defaultOpenKeys);
  const [popupOpenKeys, setPopupOpenKeys] = useState<string[]>([]);

  const menuItems = useMemo(() => {
    routeMap.current.clear();
    menuMap.current.clear();

    const travel = (
      _routes: IRoute[],
      level: number,
      parentNode: React.ReactNode[] = [],
    ): MenuItem[] => {
      return _routes
        .map((route) => {
          const { breadcrumb = true, ignore } = route;
          const titleDom = (
            <span className="inline-flex items-center gap-2">
              {getIconFromKey(route.fullPath)}

              {collapsed && level === 1
                ? null
                : locale[route.name] || route.name}
            </span>
          );

          routeMap.current.set(
            `/${route.fullPath}`,
            breadcrumb ? [...parentNode, route.name] : [],
          );

          const visibleChildren = (route.children || []).filter((child) => {
            const { ignore, breadcrumb = true } = child;
            if (ignore || route.ignore) {
              routeMap.current.set(
                `/${child.fullPath}`,
                breadcrumb ? [...parentNode, route.name, child.name] : [],
              );
            }

            return !ignore;
          });

          if (ignore || !route.fullPath) {
            return null;
          }

          if (visibleChildren.length > 0) {
            menuMap.current.set(route.fullPath, { subMenu: true });
            return {
              key: route.fullPath,
              label: titleDom,
              className: collapsed && level === 1 ? '!pr-3' : '',
              children: travel(visibleChildren, level + 1, [
                ...parentNode,
                route.name,
              ]),
            } as MenuItem;
          }

          menuMap.current.set(route.fullPath, { menuItem: true });
          return {
            key: route.fullPath,
            label: titleDom,
            className: collapsed && level === 1 ? '!pr-3' : '',
          } as MenuItem;
        })
        .filter(Boolean) as MenuItem[];
    };

    return travel(fullPathRoutes, 1);
  }, [fullPathRoutes, locale, collapsed]);

  function updateMenuStatus() {
    const matchingKey = findMatchingMenuKey(pathname);
    const newSelectedKeys = [matchingKey];

    setSelectedKeys(newSelectedKeys);
    if (!collapsed) {
      // 构建需要展开的父级菜单
      const newOpenKeys = buildDefaultOpenKeys(matchingKey);
      setInlineOpenKeys((currentKeys) => [
        ...new Set([...currentKeys, ...newOpenKeys]),
      ]);
    }
  }

  useEffect(() => {
    if (fullPathRoutes.length > 0) {
      updateMenuStatus();
    }
  }, [pathname, fullPathRoutes.length, menuItems]);

  return (
    <Menu
      mode="inline"
      inlineCollapsed={collapsed}
      items={menuItems}
      triggerSubMenuAction="click"
      onClick={({ key }) => {
        if (collapsed) {
          setPopupOpenKeys([]);
        }
        to(String(key));
      }}
      selectedKeys={selectedKeys}
      openKeys={collapsed ? popupOpenKeys : inlineOpenKeys}
      onOpenChange={(keys) => {
        const nextKeys = keys as string[];
        if (collapsed) {
          setPopupOpenKeys(nextKeys);
          return;
        }
        setInlineOpenKeys(nextKeys);
      }}
    />
  );
};

export default Navigate;
