import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Layout, Breadcrumb, Spin } from '@arco-design/web-react';
import cs from 'classnames';
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

const Sider = Layout.Sider;
const Content = Layout.Content;

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

  const paddingLeft = showMenu ? { paddingLeft: menuWidth } : {};
  const paddingTop = showNavbar ? { paddingTop: navbarHeight } : {};
  const paddingStyle = { ...paddingLeft, ...paddingTop };

  useEffect(() => {
    const routeConfig = routeMap.current.get(pathname);
    setBreadCrumb(routeConfig || []);
  }, [pathname]);

  return (
    <Layout className={styles.layout}>
      <div
        className={cs(styles['layout-navbar'], {
          [styles['layout-navbar-hidden']]: !showNavbar,
        })}
      >
        <Navbar show={showNavbar} />
      </div>
      {userLoading ? (
        <Spin className={styles['spin']} />
      ) : (
        <Layout>
          {showMenu && (
            <Sider
              className={styles['layout-sider']}
              width={menuWidth}
              collapsed={collapsed}
              onCollapse={setCollapsed}
              trigger={null}
              collapsible
              breakpoint="xl"
              style={paddingTop}
            >
              <div className={styles['menu-wrapper']}>
                <Navigate collapsed={collapsed} locale={locale} />
              </div>
              <div className={styles['collapse-btn']} onClick={toggleCollapse}>
                {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
              </div>
            </Sider>
          )}
          <Layout className={styles['layout-content']} style={paddingStyle}>
            <div className={styles['layout-content-wrapper']}>
              {!!breadcrumb.length && (
                <div className={styles['layout-breadcrumb']}>
                  <Breadcrumb>
                    {breadcrumb.map((node, index) => (
                      <Breadcrumb.Item key={index}>
                        {typeof node === 'string' ? locale[node] || node : node}
                      </Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </div>
              )}
              <Content className={'h-full w-full'}>
                <Outlet />
              </Content>
            </div>
            {/* {showFooter && <Footer />} */}
          </Layout>
        </Layout>
      )}
      <GlobalDrawer />
    </Layout>
  );
}

export default PageLayout;
