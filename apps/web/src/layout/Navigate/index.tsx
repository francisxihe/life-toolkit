import { Menu } from '@arco-design/web-react';
import qs from 'query-string';
import { useEffect, useRef, useState } from 'react';
import {
  IconDashboard,
  IconList,
  IconSettings,
  IconFile,
  IconApps,
  IconCheckCircle,
  IconExclamationCircle,
  IconUser,
} from '@arco-design/web-react/icon';
import styles from '../layout.module.less';
import { IRoute } from '@/router/routes';
import useRouter from '@/router/useRouter';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

interface NavigateProps {
  collapsed: boolean;
  locale: string;
}

const Navigate: React.FC<NavigateProps> = ({ collapsed, locale }) => {
  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map());
  const menuMap = useRef<
    Map<string, { menuItem?: boolean; subMenu?: boolean }>
  >(new Map());

  const pathname = location.pathname;
  const currentComponent = qs.parseUrl(pathname).url.slice(1);
  const { fullPathRoutes, to, defaultRoute } = useRouter();

  const defaultSelectedKeys = [currentComponent || defaultRoute];
  const paths = (currentComponent || defaultRoute).split('/');
  const defaultOpenKeys = paths.slice(0, paths.length - 1);

  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(defaultSelectedKeys);
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  function renderRoutes(locale) {
    routeMap.current.clear();
    return function travel(_routes: IRoute[], level, parentNode = []) {
      return _routes.map((route) => {
        const { breadcrumb = true, ignore } = route;
        const iconDom = getIconFromKey(route.fullPath);
        const titleDom = (
          <>
            {iconDom} {locale[route.name] || route.name}
          </>
        );

        routeMap.current.set(
          `/${route.fullPath}`,
          breadcrumb ? [...parentNode, route.name] : []
        );

        const visibleChildren = (route.children || []).filter((child) => {
          const { ignore, breadcrumb = true } = child;
          if (ignore || route.ignore) {
            routeMap.current.set(
              `/${child.fullPath}`,
              breadcrumb ? [...parentNode, route.name, child.name] : []
            );
          }

          return !ignore;
        });

        if (ignore) {
          return null;
        }
        if (visibleChildren.length) {
          menuMap.current.set(route.fullPath, { subMenu: true });
          return (
            route.fullPath && (
              <SubMenu key={route.fullPath} title={titleDom}>
                {travel(visibleChildren, level + 1, [
                  ...parentNode,
                  route.name,
                ])}
              </SubMenu>
            )
          );
        }
        menuMap.current.set(route.fullPath, { menuItem: true });
        return <MenuItem key={route.fullPath}>{titleDom}</MenuItem>;
      });
    };
  }

  function updateMenuStatus() {
    const pathKeys = pathname.split('/');
    const newSelectedKeys: string[] = [];
    const newOpenKeys: string[] = [...openKeys];
    while (pathKeys.length > 0) {
      const currentRouteKey = pathKeys.join('/');
      const menuKey = currentRouteKey.replace(/^\//, '');
      const menuType = menuMap.current.get(menuKey);
      if (menuType && menuType.menuItem) {
        newSelectedKeys.push(menuKey);
      }
      if (menuType && menuType.subMenu && !openKeys.includes(menuKey)) {
        newOpenKeys.push(menuKey);
      }
      pathKeys.pop();
    }
    setSelectedKeys(newSelectedKeys);
    setOpenKeys(newOpenKeys);
  }

  useEffect(() => {
    updateMenuStatus();
  }, [pathname]);

  return (
    <Menu
      collapse={collapsed}
      onClickMenuItem={(fullPath) => {
        to(fullPath);
      }}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onClickSubMenu={(_, openKeys) => {
        setOpenKeys(openKeys);
      }}
    >
      {renderRoutes(locale)(fullPathRoutes, 1)}
    </Menu>
  );
};

function getIconFromKey(key) {
  switch (key) {
    case '/dashboard':
      return <IconDashboard className={styles.icon} />;
    case '/list':
      return <IconList className={styles.icon} />;
    case '/form':
      return <IconSettings className={styles.icon} />;
    case '/profile':
      return <IconFile className={styles.icon} />;
    case '/visualization':
      return <IconApps className={styles.icon} />;
    case '/result':
      return <IconCheckCircle className={styles.icon} />;
    case '/exception':
      return <IconExclamationCircle className={styles.icon} />;
    case '/user':
      return <IconUser className={styles.icon} />;
    default:
      return <div className={styles['icon-empty']} />;
  }
}

export default Navigate;
