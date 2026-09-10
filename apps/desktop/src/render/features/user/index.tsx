import { useSelector } from 'react-redux';
import { Avatar, Empty, Flex } from '@sue/design-web-react';
import { Loader2 } from 'lucide-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import DefaultPage from '@/components/Layout/DefaultPage';
import { GlobalState } from '@/store';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style.module.less';

function UserPage() {
  const t = useLocale(locale);
  const { userInfo, userLoading } = useSelector((state: GlobalState) => state);

  return (
    <DefaultPage title={t['menu.user']}>
      <Flex vertical gap={32}>
        <ProductSurface id={productRef('user.view.identity')}>
          <Flex vertical className={styles.section} gap={16}>
            <div className={styles.sectionTitle}>{t['user.identity.title']}</div>
            <Flex align="center" gap={16}>
              <Avatar size={64}>
                {userLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : userInfo?.avatar ? (
                  <img alt="" src={userInfo.avatar} />
                ) : null}
              </Avatar>
              <Flex vertical gap={4}>
                <div className={styles.name}>{userInfo?.name || '—'}</div>
                <div className={styles.hint}>{t['user.identity.hint']}</div>
              </Flex>
            </Flex>
          </Flex>
        </ProductSurface>
        <ProductSurface id={productRef('user.view.transfer')}>
          <Flex vertical className={styles.section} gap={16}>
            <div className={styles.sectionTitle}>{t['user.transfer.title']}</div>
            <Flex className={styles.transfer} align="center">
              <Empty description={t['user.transfer.empty']} />
            </Flex>
          </Flex>
        </ProductSurface>
      </Flex>
    </DefaultPage>
  );
}

export default UserPage;
