import React from 'react';
import DefaultPage from '@/components/Layout/DefaultPage';
import HabitListFilter from './HabitListFilter';
import { HabitListProvider, useHabitListContext } from './context';
import HabitListTable from './HabitListTable';
import { Button, Drawer, Flex } from '@sue/design-web-react';
import { Plus } from 'lucide-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';

import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import { CreateHabit } from '../components/CreateHabit';
import styles from './style.module.less';

export const HabitListPage: React.FC = () => {
  const { goals, handleRefresh } = useHabitListContext();
  const openCreateHabitModal = () => {
    const instance = Drawer.open({
      title: '新增习惯',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <CreateHabit
          goals={goals}
          onSuccess={() => {
            handleRefresh();
            instance.destroy();
          }}
          onCancel={() => {
            instance.destroy();
          }}
        />
      ),
    });
  };

  return (
    <DefaultPage title="习惯管理">
      <ProductSurface id={productRef('growth.habit.view.list')}>
      <Flex vertical container="full" className={styles.page}>
        <Flex container="fixed" className={styles.filters}>
          <HabitListFilter />
        </Flex>
        <Flex container="fixed" className={styles.actions} gap={8}>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              openCreateHabitModal();
            }}
          >
            新增习惯
          </Button>
        </Flex>
        <Flex container="fill" className={styles.list}>
          <HabitListTable />
        </Flex>
      </Flex>
      </ProductSurface>
    </DefaultPage>
  );
};

export default () => {
  return (
    <HabitListProvider>
      <HabitListPage />
    </HabitListProvider>
  );
};
