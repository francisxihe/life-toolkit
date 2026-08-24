import 'reflect-metadata';
import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ConfigProvider, message, theme as sueTheme } from '@sue/design-web-react';
import zhCN from '@sue/design-web-react/locale/zh_CN';
import enUS from '@sue/design-web-react/locale/en_US';
import '@sue/design-web-react/dist/sue.css';
import './style/tailwind.css';
import './style/global.less';
import { HashRouter } from 'react-router-dom';
import rootReducer from './store';
import { GlobalContext } from './context';
import checkLogin from './utils/checkLogin';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import './mock';
import Router from './router';
import { generatePermission } from './router/routes';
import 'dayjs/locale/zh-cn';
import '@true-north/web-service/electron-types';
import dayjs from 'dayjs';
import { registerMessage } from '@true-north/web-service';

const messageApi = {
  error: (params: string) => message.error(params),
  success: (params: string) => message.success(params),
  warning: (params: string) => message.warning(params),
  info: (params: string) => message.info(params),
};

registerMessage(messageApi);

dayjs.locale('zh-cn');

const store = createStore(rootReducer);

if (process.env.NODE_ENV === 'development') {
  document.title = '知止 True North - Development';
} else {
  document.title = '知止 True North';
}

function LifeToolkitApp() {
  const [lang, setLang] = useStorage('arco-lang', 'en-US');
  const [themeMode, setThemeMode] = useStorage('arco-theme', 'light');

  function getArcoLocale() {
    switch (lang) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return zhCN;
    }
  }

  const sueThemeConfig = useMemo(
    () => ({
      algorithm: themeMode === 'dark' ? sueTheme.darkAlgorithm : sueTheme.defaultAlgorithm,
    }),
    [themeMode],
  );

  function fetchUserInfo() {
    store.dispatch({
      type: 'update-userInfo',
      payload: { userLoading: true },
    });
    store.dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          name: 'admin',
          email: 'wangliqun@email.com',
          job: 'frontend',
          jobName: '前端开发工程师',
          organization: 'Frontend',
          organizationName: '前端',
          location: 'beijing',
          locationName: '北京',
          introduction: '王力群并非是一个真实存在的人。',
          personalWebsite: 'https://www.arco.design',
          verified: true,
          phoneNumber: /177[*]{6}[0-9]{2}/,
          accountId: /[a-z]{4}[-][0-9]{8}/,
          registrationTime: '2024-01-01 00:00:00',
          permissions: generatePermission('admin'),
        },
        userLoading: false,
      },
    });
  }

  useEffect(() => {
    if (checkLogin()) {
      fetchUserInfo();
    }
  }, []);

  useEffect(() => {
    changeTheme(themeMode);
  }, [themeMode]);

  const contextValue = {
    lang,
    setLang,
    theme: themeMode,
    setTheme: setThemeMode,
  };

  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ConfigProvider locale={getArcoLocale()} theme={sueThemeConfig}>
        <Provider store={store}>
          <GlobalContext.Provider value={contextValue}>
            <Router />
            {process.env.NODE_ENV === 'development' && (
              <div
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  zIndex: 9999,
                }}
              >
                测试环境
              </div>
            )}
          </GlobalContext.Provider>
        </Provider>
      </ConfigProvider>
    </HashRouter>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<LifeToolkitApp />);

if (import.meta.env.DEV) {
  void import('@true-north/product-server/inspector/bridge').then((module) =>
    module.bootstrapProductInspectorBridge(),
  );
}
