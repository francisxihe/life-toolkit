import { useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { Bell, Loader2, Power, Settings, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '@/assets/logo.svg';
import MessageBox from '@/components/MessageBox';
import { useRendererPlatformOptional } from '@true-north/plugin-sdk/renderer';
import { generatePermission } from '@/router/routes';
import { GlobalState } from '@/store';
import useLocale from '@/utils/useLocale';
import useStorage from '@/utils/useStorage';
import { SessionList } from '@/features/ai/features/SessionList';
import { WorkbenchToggle } from '@/features/workbench';
import styles from './AppAside.module.less';
import Navigate from './navigate';

export function AppAside() {
  const t = useLocale();
  const navigate = useNavigate();
  const { userInfo, userLoading } = useSelector((state: GlobalState) => state);
  const dispatch = useDispatch();
  const [, setUserStatus] = useStorage('userStatus');
  const [role] = useStorage('userRole', 'admin');
  const runtime = useRendererPlatformOptional();
  const actionSlots = [...(runtime?.shellSlots || [])]
    .filter((slot) => slot.slot === 'aside-actions')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  useEffect(() => {
    dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          ...userInfo,
          permissions: generatePermission(role),
        },
      },
    });
  }, [role]);

  function logout() {
    setUserStatus('logout');
    window.location.href = '/login';
  }

  const userMenu = {
    items: [
      {
        key: 'user',
        label: (
          <span>
            <User size={16} className={styles.dropdownIcon} />
            {t['menu.user']}
          </span>
        ),
      },
      {
        key: 'setting',
        label: (
          <span>
            <Settings size={16} className={styles.dropdownIcon} />
            {t['menu.setting']}
          </span>
        ),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: (
          <span>
            <Power size={16} className={styles.dropdownIcon} />
            {t['navbar.logout']}
          </span>
        ),
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') logout();
      else if (key === 'setting') navigate('/setting');
      else if (key === 'user') navigate('/user');
    },
  };

  const actionButtonStyle = { display: 'inline-flex' } as CSSProperties;

  return (
    <ProductSurface id={productRef('app-shell.view.aside')}>
      <Flex vertical className={`${styles.aside} h-full`}>
        <Flex className={styles.brand} align="center" justify="space-between" gap={8}>
          <Flex align="center" className={styles.brandMark} gap={8}>
            <Logo />
            <span className={styles.brandName}>{t['title']}</span>
          </Flex>
          <MessageBox>
            <button type="button" className={styles.actionBtn} aria-label={t['today.title']}>
              <Bell size={16} />
            </button>
          </MessageBox>
        </Flex>

        <ProductSurface id={productRef('app-shell.view.nav')}>
          <div className={styles.nav}>
            <Navigate collapsed={false} locale={t} />
          </div>
        </ProductSurface>

        <Flex container="fill" className={styles.sessions}>
          <ProductSurface id={productRef('app-shell.view.sessions')}>
            <SessionList />
          </ProductSurface>
        </Flex>

        <ProductSurface id={productRef('app-shell.view.actions')}>
          <Flex className={styles.actions} align="center" justify="space-between" gap={8}>
            {userInfo ? (
              <Dropdown menu={userMenu} placement="topRight" disabled={userLoading}>
                <Avatar size={32} style={{ cursor: 'pointer' }}>
                  {userLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <img alt="avatar" src={userInfo.avatar} />
                  )}
                </Avatar>
              </Dropdown>
            ) : (
              <span />
            )}
            <Flex align="center" gap={4} style={actionButtonStyle} className={styles.pluginActions}>
              {actionSlots.map((slot) => {
                const Slot = slot.render;
                return (
                  <span key={`${slot.pluginId}:${slot.id}`} className={styles.actionBtn}>
                    <Slot />
                  </span>
                );
              })}
              <span className={styles.actionBtn}>
                <WorkbenchToggle />
              </span>
            </Flex>
          </Flex>
        </ProductSurface>
      </Flex>
    </ProductSurface>
  );
}
