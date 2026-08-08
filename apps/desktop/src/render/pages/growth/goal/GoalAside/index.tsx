import React from 'react';
import { Button, Divider, Flex, PlusOutlined } from '@sue/design-web-react';

import GoalFilters from './GoalFilters';
import GoalTree from './GoalTree';
import { useGoalContext } from '../context';
import { useGoalDetail } from '../../components/GoalDetail';
import styles from './style.module.less';

export default function GoalAside() {
  const { refreshData } = useGoalContext();
  const { openCreateDrawer } = useGoalDetail();

  return (
    <Flex vertical container="full" gap={12} className={styles.aside}>
      {/* 头部工具栏 */}
      <Flex
        container="fixed"
        className={styles.toolbar}
      >
        <GoalFilters />
      </Flex>

      <Divider className={styles.divider} />

      <Flex container="fill" className={styles.treeArea}>
        <GoalTree />
      </Flex>

      <Flex container="fixed" className={styles.footer}>
        <Button
          className={styles.createButton}
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            openCreateDrawer({
              title: '新建目标',
              contentProps: {
                afterSubmit: refreshData,
              },
            })
          }
        >
          新建
        </Button>
      </Flex>
    </Flex>
  );
}
