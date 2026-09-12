import { Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { useRendererPlatform } from '@true-north/plugin-sdk/renderer';
import useLocale from '@/utils/useLocale';
import { pluginPaths } from './paths';
import styles from './PluginsShell.module.less';

export function PluginsShell() {
  const t = useLocale();
  const navigate = useNavigate();
  const { pluginKey } = useParams();
  const current = useRendererPlatform().plugins.find((entry) => entry.pluginId === pluginKey);
  const Icon = current?.icon;

  if (!pluginKey) {
    return (
      <Flex vertical container="full" className={styles.hub}>
        <Flex container="fill" className={styles.stage}>
          <Outlet />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex vertical container="full" className={styles.hub}>
      <ProductSurface id={productRef('plugins.view.hub-nav')}>
        <Flex gap={8} className={styles.nav}>
          <button type="button" className={styles.back} onClick={() => navigate(pluginPaths.root)}>
            <ArrowLeft size={16} />
            <span>{t['menu.plugins']}</span>
          </button>
          {current ? (
            <span className={styles.current}>
              {Icon ? <Icon size={16} strokeWidth={1.75} /> : null}
              <span>{t[current.nameKey] || current.nameKey}</span>
            </span>
          ) : null}
        </Flex>
      </ProductSurface>
      <Flex container="fill" className={styles.stage}>
        <Outlet />
      </Flex>
    </Flex>
  );
}
