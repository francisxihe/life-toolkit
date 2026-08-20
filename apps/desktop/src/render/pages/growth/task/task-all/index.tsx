'use client';

import { useEffect } from 'react';
import { TaskFilters } from './TaskFilters';
import { Flex } from '@sue/design-web-react';
import { TaskAllProvider } from './context';
import TaskTable from './TaskTable';
import { useTaskAllContext } from './context';
import styles from './style.module.less';
import { onTaskChanged } from '../../events';

function TaskAll() {
  const { getTaskPage } = useTaskAllContext();
  useEffect(() => {
    void getTaskPage();
    return onTaskChanged(() => { void getTaskPage(); });
  }, []);

  return (
    <Flex vertical container="full" className={styles.page}>
      <Flex container="fixed" className={styles.filters}>
        <TaskFilters />
      </Flex>

      <Flex container="fill" className={styles.table}>
        <TaskTable />
      </Flex>
    </Flex>
  );
}

export default function TaskAllLayout() {
  return (
    <TaskAllProvider>
      <TaskAll></TaskAll>
    </TaskAllProvider>
  );
}
