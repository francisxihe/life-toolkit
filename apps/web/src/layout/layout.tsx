import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Layout, Breadcrumb, Spin } from '@arco-design/web-react';
import cs from 'clsx';
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-react/icon';
import { useSelector } from 'react-redux';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import useLocale from '../utils/useLocale';
import getUrlParams from '../utils/getUrlParams';
import { GlobalState } from '../store';
import styles from './layout.module.less';
import Navigate from './Navigate';
import { GlobalDrawer } from './Drawer';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';

const { Fixed, Shrink } = FlexibleContainer;

const Aside = Layout.Sider;

import { RouterContext } from '@/router/useRouter';

function PageLayout() {
  useContext(RouterContext);
  const urlParams = getUrlParams();
  const location = useLocation();
  const pathname = location.pathname;
  const locale = useLocale();
  const { settings, userLoading } = useSelector((state: GlobalState) => state);

  const [breadcrumb, setBreadCrumb] = useState([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map());

  const navbarHeight = 60;
  const menuWidth = collapsed ? 48 : settings.menuWidth;

  const showNavbar = settings.navbar && urlParams.navbar !== false;
  const showMenu = settings.menu && urlParams.menu !== false;
  const showFooter = settings.footer && urlParams.footer !== false;

  function toggleCollapse() {
    setCollapsed((collapsed) => !collapsed);
  }

  useEffect(() => {
    const routeConfig = routeMap.current.get(pathname);
    setBreadCrumb(routeConfig || []);
  }, [pathname]);

  return (
    <FlexibleContainer>
      <Fixed
        className={cs(styles['layout-navbar'], {
          [styles['layout-navbar-hidden']]: !showNavbar,
        })}
      >
        <Navbar show={showNavbar} />
      </Fixed>
      <Shrink direction="vertical">
        {userLoading ? (
          <Spin className={styles['spin']} />
        ) : (
          <>
            {showMenu && (
              <Fixed>
                <Aside
                  className={styles['layout-sider']}
                  width={menuWidth}
                  collapsed={collapsed}
                  onCollapse={setCollapsed}
                  trigger={null}
                  collapsible
                  breakpoint="xl"
                >
                  <div className={styles['menu-wrapper']}>
                    <Navigate collapsed={collapsed} locale={locale} />
                  </div>
                  <div
                    className={styles['collapse-btn']}
                    onClick={toggleCollapse}
                  >
                    {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
                  </div>
                </Aside>
              </Fixed>
            )}
            <Shrink className={styles['layout-content']} direction="vertical">
              {!!breadcrumb.length && (
                <Fixed className={styles['layout-breadcrumb']}>
                  <Breadcrumb>
                    {breadcrumb.map((node, index) => (
                      <Breadcrumb.Item key={index}>
                        {typeof node === 'string' ? locale[node] || node : node}
                      </Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </Fixed>
              )}
              <Shrink>
                <Outlet />
              </Shrink>
              {/* {showFooter && <Footer />} */}
            </Shrink>
          </>
        )}
      </Shrink>
      <GlobalDrawer />
    </FlexibleContainer>
  );
}

export default PageLayout;
