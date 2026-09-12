'use client';

import { Flex } from '@sue/design-web-react';
import styles from './DefaultPage.module.less';

export default function DefaultPage(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Flex
      vertical
      container="full"
      className={styles.page}
    >
      <Flex
        container="fixed"
        className={styles.header}
      >
        <h1 className={styles.title}>{props.title}</h1>
      </Flex>

      <Flex
        container="fill"
        className={styles.content}
      >
        {props.children}
      </Flex>
    </Flex>
  );
}
