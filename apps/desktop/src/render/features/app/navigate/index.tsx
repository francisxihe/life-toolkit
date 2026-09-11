import { Menu } from '@sue/design-web-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IRoute } from '@/router/routes';
import useRouter from '@/router/useRouter';
import styles from '../Layout.module.less';

interface NavigateProps {
  collapsed: boolean;
  locale: string;
  'data-product-ref'?: string;
}

type MenuItem = {
  key: string;
  label: React.ReactNode;
  className?: string;
  children?: MenuItem[];
};

const Navigate: React.FC<NavigateProps> = ({ collapsed, locale, 'data-product-ref': productRefAttr }) => {
  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map());
  const menuMap = useRef<
    Map<string, { menuItem?: boolean; subMenu?: boolean }>
  >(new Map());

  const location = useLocation();
  const pathname = location.pathname;
  const { fullPathRoutes, to, defaultRoute } = useRouter();

  // 根据当前路径找到匹配的菜单项；ignore 子路由高亮最近的可见祖先
  const matchMenuKey = (pathname: string) => {
    if (pathname === '/') {
      return defaultRoute || '/ai';
    }

    const findMatch = (
      routes: IRoute[],
      ancestors: IRoute[] = [],
    ): { route: IRoute; ancestors: IRoute[] } | null => {
      let best: { route: IRoute; ancestors: IRoute[] } | null = null;
      let bestMatchLength = 0;

      for (const route of routes) {
        const routePath = route.fullPath;
        if (!routePath) continue;

        const matches =
          pathname === routePath || pathname.startsWith(`${routePath}/`);
        if (!matches) continue;

        const nextAncestors = [...ancestors, route];
        if (route.children?.length) {
          const childMatch = findMatch(route.children, nextAncestors);
          if (childMatch) return childMatch;
        }

        if (routePath.length > bestMatchLength) {
          best = { route, ancestors: nextAncestors };
          bestMatchLength = routePath.length;
        }
      }

      return best;
    };

    const found = findMatch(fullPathRoutes);
    if (!found) return defaultRoute;

    for (let i = found.ancestors.length - 1; i >= 0; i -= 1) {
      const candidate = found.ancestors[i];
      if (!candidate.ignore && candidate.fullPath) {
        return candidate.fullPath;
      }
    }

    return found.route.fullPath || defaultRoute;
  };

  const matchingKey = matchMenuKey(pathname);
  const defaultSelectedKeys = [matchingKey];

  // 构建默认展开的父级菜单
  const toOpenKeys = (key: string) => {
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

  const defaultOpenKeys = toOpenKeys(matchingKey);

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
          const Icon = route.meta?.icon;
          const titleDom = (
            <span className="inline-flex items-center gap-2">
              {Icon ? (
                <Icon size={16} className={styles.icon} />
              ) : (
                <div className={styles['icon-empty']} />
              )}

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
    const matchingKey = matchMenuKey(pathname);
    const newSelectedKeys = [matchingKey];

    setSelectedKeys(newSelectedKeys);
    if (!collapsed) {
      // 构建需要展开的父级菜单
      const newOpenKeys = toOpenKeys(matchingKey);
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
      data-product-ref={productRefAttr}
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
