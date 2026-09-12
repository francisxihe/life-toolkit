import 'reflect-metadata';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
import { GlobalContext, type ThemePreference } from './context';
import checkLogin from './utils/checkLogin';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import './mock';
import { bootRendererPlugins } from './plugin/catalog';
import { RendererPlatform, RendererPlatformProvider } from '@true-north/plugin-sdk/renderer';
import Router from './router';
import { generatePermission } from './router/routes';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import '@true-north/web-service/electron-types';
import dayjs from 'dayjs';
import { registerMessage } from '@true-north/web-service';
import { DevDockAttach } from '../dev/DevDockAttach';
import defaultLocale from './locale';

const messageApi = {
  error: (params: string) => message.error(params),
  success: (params: string) => message.success(params),
  warning: (params: string) => message.warning(params),
  info: (params: string) => message.info(params),
};

registerMessage(messageApi);

const store = createStore(rootReducer);

function mediaTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function isThemeOverride(value: string): value is 'light' | 'dark' {
  return value === 'light' || value === 'dark';
}

if (process.env.NODE_ENV === 'development') {
  document.title = '知止 True North - Development';
} else {
  document.title = '知止 True North';
}

function LifeToolkitApp() {
  const [platform, setPlatform] = useState<RendererPlatform | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    void bootRendererPlugins()
      .then(setPlatform)
      .catch((error) => setBootError(error instanceof Error ? error.message : String(error)));
  }, []);
  const [lang, setLang] = useStorage('arco-lang', 'en-US');
  const [themePreference, setThemePreference] = useStorage('arco-theme', 'system');
  const [systemTheme, setSystemTheme] = useState(mediaTheme);

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

  const themeMode = isThemeOverride(themePreference) ? themePreference : systemTheme;
  const sueThemeConfig = useMemo(
    () => ({
      algorithm: themeMode === 'dark' ? sueTheme.darkAlgorithm : sueTheme.defaultAlgorithm,
    }),
    [themeMode],
  );
  const setThemePreferenceValue = useCallback(
    (value: ThemePreference) => {
      if (value === 'system' || value === 'light' || value === 'dark') {
        setThemePreference(value);
      }
    },
    [setThemePreference],
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
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const source: ThemePreference = isThemeOverride(themePreference) ? themePreference : 'system';
    void window.electronAPI?.setNativeThemeSource?.(source);
  }, [themePreference]);

  useLayoutEffect(() => {
    ConfigProvider.config({ theme: sueThemeConfig });
    changeTheme(themeMode);
  }, [themeMode, sueThemeConfig]);

  useEffect(() => {
    dayjs.locale(lang === 'zh-CN' ? 'zh-cn' : 'en');
  }, [lang]);

  const contextValue = {
    lang,
    setLang,
    theme: themeMode,
    themePreference: (themePreference === 'light' || themePreference === 'dark'
      ? themePreference
      : 'system') as ThemePreference,
    setThemePreference: setThemePreferenceValue,
  };

  const livePlatform = useMemo(() => {
    if (!platform) return null;
    return new RendererPlatform({
      ...platform.state,
      lang,
      hostMessages: defaultLocale,
    });
  }, [platform, lang]);

  if (bootError) {
    return (
      <div className="p-8">
        <h1 className="text-title-1">插件启动失败</h1>
        <pre className="mt-4 whitespace-pre-wrap text-text-3">{bootError}</pre>
      </div>
    );
  }

  if (!livePlatform) {
    return null;
  }

  return (
    <RendererPlatformProvider platform={livePlatform}>
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
            {import.meta.env.DEV ? <DevDockAttach theme={themeMode} /> : null}
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
    </RendererPlatformProvider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<LifeToolkitApp />);
