import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Layout, Breadcrumb, Spin, Flex, MenuFoldOutlined, MenuUnfoldOutlined } from '@sue/design-web-react';
import cs from 'clsx';

import { useSelector } from 'react-redux';
import Navbar from '../components/NavBar';
import useLocale from '../utils/useLocale';
import { GlobalState } from '../store';
import styles from './layout.module.less';
import Navigate from './Navigate';
import { ProductSurface, productRef } from '@true-north/product-wiki';

const Aside = Layout.Sider;

import { RouterContext } from '@/router/useRouter';

function PageLayout() {
  useContext(RouterContext);
  const location = useLocation();
  const pathname = location.pathname;
  const locale = useLocale();
  const { userLoading } = useSelector((state: GlobalState) => state);

  const [breadcrumb, setBreadCrumb] = useState([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map());

  const menuWidth = collapsed ? 48 : 220;

  function toggleCollapse() {
    setCollapsed((collapsed) => !collapsed);
  }

  useEffect(() => {
    const routeConfig = routeMap.current.get(pathname);
    setBreadCrumb(routeConfig || []);
  }, [pathname]);

  return (
    <Flex vertical container="full">
      <Flex container="fixed" className={cs('w-full', styles['layout-navbar'])}>
        <Navbar />
      </Flex>
      <Flex container="fill">
        {userLoading ? (
          <Spin className={styles['spin']} />
        ) : (
          <>
            <Flex container="fixed" className="h-full">
              <Aside
                theme="light"
                className={styles['layout-sider']}
                width={menuWidth}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                trigger={null}
                collapsible
                breakpoint="xl"
              >
                <div className={styles['menu-wrapper']}>
                  <ProductSurface id={productRef('global.overview')}>
                    <Navigate collapsed={collapsed} locale={locale} />
                  </ProductSurface>
                </div>
                <Flex
                  className={styles['collapse-btn']}
                  align="center"
                  justify="center"
                  onClick={toggleCollapse}
                >
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </Flex>
              </Aside>
            </Flex>
            <Flex
              container="fill"
              vertical
              className={styles['layout-content']}
            >
              {!!breadcrumb.length && (
                <Flex
                  container="fixed"
                  className={cs('w-full', styles['layout-breadcrumb'])}
                >
                  <Breadcrumb
                    items={breadcrumb.map((node, index) => ({
                      key: index,
                      title: typeof node === 'string' ? locale[node] || node : node,
                    }))}
                  />
                </Flex>
              )}
              <Flex container="fill" className="overflow-y-auto">
                <Outlet />
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
}

export default PageLayout;
