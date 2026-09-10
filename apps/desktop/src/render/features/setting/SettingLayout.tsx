import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Flex } from '@sue/design-web-react';
import { ArrowLeft } from 'lucide-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import clsx from 'clsx';
import useLocale from '@/utils/useLocale';
import { settingRoutes } from '@/router/routes/setting.routes';
import locale from './locale';
import { getReturnPath } from './returnPath';
import styles from './SettingLayout.module.less';

function SettingLayout() {
  const t = useLocale(locale);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRoutes = settingRoutes.filter((route) => !route.ignore);

  return (
    <Flex container="full" className={styles.shell}>
      <Flex container="fixed" className={styles.nav}>
        <ProductSurface id={productRef('setting.view.nav')}>
          <Flex vertical className={styles.navInner}>
            <button
              type="button"
              className={styles.back}
              onClick={() => navigate(getReturnPath())}
            >
              <ArrowLeft size={16} />
              {t['setting.nav.back']}
            </button>
            <Flex vertical className={styles.menu} gap={4}>
              {menuRoutes.map((route) => {
                const Icon = route.meta?.icon;
                const active = location.pathname === route.key;

                return (
                  <button
                    key={route.key}
                    type="button"
                    className={clsx(styles.menuItem, active && styles.menuItemActive)}
                    onClick={() => navigate(route.key)}
                  >
                    {Icon ? <Icon size={16} /> : null}
                    {t[route.name] || route.name}
                  </button>
                );
              })}
            </Flex>
          </Flex>
        </ProductSurface>
      </Flex>
      <Flex container="fill" className={styles.main}>
        <Outlet />
      </Flex>
    </Flex>
  );
}

export default SettingLayout;
