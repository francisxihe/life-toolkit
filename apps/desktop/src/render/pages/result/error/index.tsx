import React from 'react';
import { Button, Empty, Flex, LinkOutlined } from '@sue/design-web-react';

import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/index.module.less';

function Success() {
  const t = useLocale(locale);

  return (
    <div>
      <div className={styles.wrapper}>
        <Flex
          vertical
          align="center"
          justify="center"
          gap={16}
          className={`${styles.result} p-6 text-center`}>

          <Empty description={null} />
          <div className="text-title-1 font-medium">
            {t['error.result.title']}
          </div>
          <div className="text-text-3">{t['error.result.subTitle']}</div>
          <div>
            <Button key="again" type="default" style={{ marginRight: 16 }}>
              {t['error.result.goBack']}
            </Button>
            <Button key="back" type="primary">
              {t['error.result.retry']}
            </Button>
          </div>
        </Flex>
        <div className={styles['details-wrapper']}>
          <h6 className="text-title-1 font-medium" style={{ marginTop: 0 }}>
            {t['error.detailTitle']}
          </h6>
          <p style={{ marginBottom: 0 }}>
            <ol>
              <li>
                {t['error.detailLine.record']}
                <a style={{ color: "var(--color-primary-6)" }}>
                  <LinkOutlined />
                  {t['error.detailLine.record.link']}
                </a>
              </li>
              <li>
                {t['error.detailLine.auth']}
                <a style={{ color: "var(--color-primary-6)" }}>{t['error.detailLine.auth.link']}</a>
              </li>
            </ol>
          </p>
        </div>
      </div>
    </div>);

}

export default Success;