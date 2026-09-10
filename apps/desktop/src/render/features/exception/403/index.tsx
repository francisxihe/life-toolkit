import React from 'react';
import { Button, Empty, Flex } from '@sue/design-web-react';
import locale from './locale';
import useLocale from '@/utils/useLocale';
import styles from './style/index.module.less';

function Exception403() {
  const t = useLocale(locale);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Flex
          vertical
          align="center"
          justify="center"
          gap={16}
          className={`${styles.result} p-6 text-center`}
        >
          <Empty description={null} />
          <div className="text-title-1 font-medium">403</div>
          <div className="text-text-3">
            {t['exception.result.403.description']}
          </div>
          <Button key="back" type="primary">
            {t['exception.result.403.back']}
          </Button>
        </Flex>
      </div>
    </div>
  );
}

export default Exception403;
