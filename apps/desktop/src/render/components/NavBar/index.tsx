import { ClockCircleOutlined, DashboardOutlined, ExperimentOutlined, GlobalOutlined, TagOutlined } from '@ant-design/icons';
import { useContext, useEffect } from 'react';
import { Tooltip, Avatar, Dropdown, message, CommentOutlined, LoadingOutlined, MoonOutlined, NotificationOutlined, PoweroffOutlined, SettingOutlined, SunOutlined, UserOutlined, Flex } from '@sue/design-web-react';

import { useSelector, useDispatch } from 'react-redux';
import { GlobalState } from '@/store';
import { GlobalContext } from '@/context';
import useLocale from '@/utils/useLocale';
import Logo from '@/assets/logo.svg';
import MessageBox from '@/components/MessageBox';
import IconButton from './IconButton';
import styles from './style/index.module.less';
import defaultLocale from '@/locale';
import useStorage from '@/utils/useStorage';
import { generatePermission } from '@/router/routes';
import { useFocusTimer } from '@/pages/growth/focus-timer';

function Navbar() {
  const t = useLocale();
  const { userInfo, userLoading } = useSelector((state: GlobalState) => state);
  const dispatch = useDispatch();

  const [_, setUserStatus] = useStorage('userStatus');
  const [role, setRole] = useStorage('userRole', 'admin');

  const { setLang, lang, theme, setTheme } = useContext(GlobalContext);
  const { open: openFocusTimer } = useFocusTimer();

  function logout() {
    setUserStatus('logout');
    window.location.href = `/login`;
  }

  function onMenuItemClick(key: string) {
    if (key === 'logout') {
      logout();
    } else if (key === 'switch role') {
      handleChangeRole();
    } else {
      message.info(`You clicked ${key}`);
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

  const handleChangeRole = () => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    setRole(newRole);
  };

  const userMenu = {
    items: [
      {
        key: 'role',
        label: (
          <span>
            <UserOutlined className={styles['dropdown-icon']} />
            <span className={styles['user-role']}>
              {role === 'admin'
                ? t['menu.user.role.admin']
                : t['menu.user.role.user']}
            </span>
          </span>
        ),
        children: [
          {
            key: 'switch role',
            label: (
              <span>
                <TagOutlined className={styles['dropdown-icon']} />
                {t['menu.user.switchRoles']}
              </span>
            ),
          },
        ],
      },
      {
        key: 'setting',
        label: (
          <span>
            <SettingOutlined className={styles['dropdown-icon']} />
            {t['menu.user.setting']}
          </span>
        ),
      },
      {
        key: 'more',
        label: (
          <span>
            <ExperimentOutlined className={styles['dropdown-icon']} />
            {t['message.seeMore']}
          </span>
        ),
        children: [
          {
            key: 'workplace',
            label: (
              <span>
                <DashboardOutlined className={styles['dropdown-icon']} />
                {t['menu.dashboard.workplace']}
              </span>
            ),
          },
          {
            key: 'card list',
            label: (
              <span>
                <CommentOutlined className={styles['dropdown-icon']} />
                {t['menu.list.cardList']}
              </span>
            ),
          },
        ],
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
          <Dropdown
            trigger={['hover']}
            placement="bottomRight"
            menu={{
              selectedKeys: [lang],
              items: [
                { key: 'zh-CN', label: '中文' },
                { key: 'en-US', label: 'English' },
              ],
              onClick: ({ key }) => {
                setLang(key);
                const nextLang = defaultLocale[key];
                message.info(`${nextLang['message.lang.tips']}${key}`);
              },
            }}
          >
            <span>
              <IconButton icon={<GlobalOutlined />} />
            </span>
          </Dropdown>
        </Flex>
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
        <Flex component="li" align="center">
          <Tooltip
            title={
              theme === 'light'
                ? t['navbar.theme.toDark']
                : t['navbar.theme.toLight']
            }
          >
            <IconButton
              icon={theme !== 'dark' ? <MoonOutlined /> : <SunOutlined />}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          </Tooltip>
        </Flex>
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
