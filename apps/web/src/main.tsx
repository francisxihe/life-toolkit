import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import './style/tailwind.css';
import './style/global.less';
import { BrowserRouter } from 'react-router-dom';
import rootReducer from './store';
import { GlobalContext } from './context';
import checkLogin from './utils/checkLogin';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import './mock';
import Router from './router';
import { generatePermission } from './router/routes';

const store = createStore(rootReducer);

function Index() {
  const [lang, setLang] = useStorage('arco-lang', 'en-US');
  const [theme, setTheme] = useStorage('arco-theme', 'light');

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
          // avatar:
          //   'https://lf1-xgcdn-tos.pstatp.com/obj/vcloud/vadmin/start.8e0e4855ee346a46ccff8ff3e24db27b.png',
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
    // axios.get('/api/user/userInfo').then((res) => {

    // });
  }

  useEffect(() => {
    if (checkLogin()) {
      fetchUserInfo();
    } else if (window.location.pathname.replace(/\//g, '') !== 'login') {
      window.location.pathname = `/login`;
    }
  }, []);

  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  const contextValue = {
    lang,
    setLang,
    theme,
    setTheme,
  };

  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <ConfigProvider
        locale={getArcoLocale()}
        componentConfig={{
          Card: {
            bordered: false,
          },
          List: {
            bordered: false,
          },
          Table: {
            border: false,
          },
        }}
      >
        <Provider store={store}>
          <GlobalContext.Provider value={contextValue}>
            <Router />
          </GlobalContext.Provider>
        </Provider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<Index />);
