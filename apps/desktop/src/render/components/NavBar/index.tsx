import { ClockCircleOutlined, CompassOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Avatar, Dropdown, LoadingOutlined, NotificationOutlined, PoweroffOutlined, SettingOutlined, UserOutlined, Flex } from '@sue/design-web-react';

import { useSelector, useDispatch } from 'react-redux';
import { GlobalState } from '@/store';
import useLocale from '@/utils/useLocale';
import Logo from '@/assets/logo.svg';
import MessageBox from '@/components/MessageBox';
import IconButton from './IconButton';
import styles from './style/index.module.less';
import useStorage from '@/utils/useStorage';
import { generatePermission } from '@/router/routes';
import { useFocusTimer } from '@/pages/growth/focus-timer';
import { useWorkbenchOptional } from '@/pages/workbench';

function Navbar() {
  const t = useLocale();
  const navigate = useNavigate();
  const { userInfo, userLoading } = useSelector((state: GlobalState) => state);
  const dispatch = useDispatch();

  const [_, setUserStatus] = useStorage('userStatus');
  const [role] = useStorage('userRole', 'admin');

  const { open: openFocusTimer } = useFocusTimer();
  const workbench = useWorkbenchOptional();

  function logout() {
    setUserStatus('logout');
    window.location.href = `/login`;
  }

  function onMenuItemClick(key: string) {
    if (key === 'logout') {
      logout();
    } else if (key === 'setting') {
      navigate('/setting');
    } else if (key === 'user') {
      navigate('/user');
    }
  }

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

  const userMenu = {
    items: [
      {
        key: 'user',
        label: (
          <span>
            <UserOutlined className={styles['dropdown-icon']} />
            {t['menu.user']}
          </span>
        ),
      },
      {
        key: 'setting',
        label: (
          <span>
            <SettingOutlined className={styles['dropdown-icon']} />
            {t['menu.setting']}
          </span>
        ),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: (
          <span>
            <PoweroffOutlined className={styles['dropdown-icon']} />
            {t['navbar.logout']}
          </span>
        ),
      },
    ],
    onClick: ({ key }: { key: string }) => onMenuItemClick(key),
  };

  return (
    <Flex className={styles.navbar} justify="space-between">
      <Flex align="center">
        <Flex align="center" className={styles.logo}>
          <Logo />
          <div className={styles['logo-name']}>{t['title']}</div>
        </Flex>
      </Flex>
      <Flex component="ul" className={styles.right}>
        <Flex component="li" align="center">
          <MessageBox>
            <IconButton icon={<NotificationOutlined />} />
          </MessageBox>
        </Flex>
        <Flex component="li" align="center">
          <Tooltip title="打开专注计时">
            <IconButton icon={<ClockCircleOutlined />} onClick={() => openFocusTimer()} />
          </Tooltip>
        </Flex>
        {workbench && window.electronAPI?.isElectron ? (
          <Flex component="li" align="center">
            <Tooltip title={workbench.open ? t['navbar.workbench.close'] : t['navbar.workbench.open']}>
              <IconButton icon={<CompassOutlined />} onClick={workbench.toggle} />
            </Tooltip>
          </Flex>
        ) : null}
        {userInfo && (
          <Flex component="li" align="center">
            <Dropdown
              menu={userMenu}
              placement="bottomRight"
              disabled={userLoading}
            >
              <Avatar size={32} style={{ cursor: 'pointer' }}>
                {userLoading ? (
                  <LoadingOutlined />
                ) : (
                  <img alt="avatar" src={userInfo.avatar} />
                )}
              </Avatar>
            </Dropdown>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default Navbar;
