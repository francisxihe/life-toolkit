import React from 'react';
import { Button, Empty, Flex } from '@sue/design-web-react';

import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/index.module.less';

function Success() {
  const t = useLocale(locale);
  const current = 2;
  const steps = [
  {
    title: t['success.submitApplication'],
    description: '2020/10/10 14:00:39'
  },
  {
    title: t['success.leaderReview'],
    description: t['success.processing']
  },
  {
    title: t['success.purchaseCertificate'],
    description: t['success.waiting']
  },
  {
    title: t['success.safetyTest'],
    description: t['success.waiting']
  },
  {
    title: t['success.launched'],
    description: t['success.waiting']
  }];

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
            {t['success.result.title']}
          </div>
          <div className="text-text-3">{t['success.result.subTitle']}</div>
          <div>
            <Button key="again" type="default" style={{ marginRight: 16 }}>
              {t['success.result.printResult']}
            </Button>
            <Button key="back" type="primary">
              {t['success.result.projectList']}
            </Button>
          </div>
        </Flex>
        <div className={styles['steps-wrapper']}>
          <p style={{ fontWeight: "bold" }}>
            {t['success.result.progress']}
          </p>
          <Flex gap={8} wrap="wrap">
            {steps.map((step, index) => {
              const active = index === current;
              const done = index < current;
              return (
                <Flex key={index} vertical gap={4} style={{ minWidth: 120 }}>
                  <Flex align="center" gap={8}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        background: active ?
                        'var(--color-primary-6, #165dff)' :
                        done ?
                        'var(--color-primary-3, #94bfff)' :
                        'var(--color-fill-3, #f2f3f5)',
                        color:
                        active || done ? '#fff' : 'var(--color-text-2)'
                      }}>

                      {index + 1}
                    </span>
                    <span style={{ fontWeight: active ? 600 : 400 }}>
                      {step.title}
                    </span>
                  </Flex>
                  {step.description &&
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-3)',
                      paddingLeft: 32
                    }}>

                      {step.description}
                    </span>
                  }
                </Flex>);

            })}
          </Flex>
        </div>
      </div>
    </div>);

}

export default Success;