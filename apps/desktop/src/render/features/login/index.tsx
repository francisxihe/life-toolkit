import React, { useEffect } from 'react';
import { Flex } from '@sue/design-web-react';
import Footer from '@/components/Footer';
import Logo from '@/assets/logo.svg';
import LoginForm from './form';
import LoginBanner from './banner';
import styles from './style/index.module.less';

function Login() {
  useEffect(() => {
    document.body.setAttribute('data-theme', 'light');
  }, []);

  return (
    <Flex className={styles.container}>
      <Flex className={styles.logo} align="center">
        <Logo />
        <div className={styles['logo-text']}>Arco Design Pro</div>
      </Flex>
      <Flex className={styles.banner} justify="center" align="center">
        <div className={styles['banner-inner']}>
          <LoginBanner />
        </div>
      </Flex>
      <Flex className={styles.content} flex={1} justify="center" align="center">
        <LoginForm />
        <div className={styles.footer}>
          <Footer />
        </div>
      </Flex>
    </Flex>
  );
}
Login.displayName = 'LoginPage';

export default Login;
