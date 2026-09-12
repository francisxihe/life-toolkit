import { Button, Empty, Flex } from '@sue/design-web-react';
import { useNavigate } from 'react-router-dom';
import locale from './locale';
import useLocale from '@/utils/useLocale';
import { pluginPaths } from '@/plugin/paths';
import styles from '../403/style/index.module.less';

function Exception404() {
  const t = useLocale(locale);
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <Flex vertical align="center" justify="center" gap={16} className={`${styles.result} p-6 text-center`}>
        <Empty description={null} />
        <div className="text-title-1 font-medium">404</div>
        <div className="text-text-3">{t['exception.result.404.description']}</div>
        <Button type="primary" onClick={() => navigate(pluginPaths.root)}>
          {t['exception.result.404.back']}
        </Button>
      </Flex>
    </div>
  );
}

export default Exception404;
