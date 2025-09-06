import React from 'react';
import DefaultPage from '@/components/Layout/DefaultPage';
import HabitListFilter from './HabitListFilter';
import { HabitListProvider, useHabitListContext } from './context';
import { FlexibleContainer } from 'francis-component-react';
import HabitListTable from './HabitListTable';
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { openDrawer } from '@/layout/Drawer';
import { CreateHabit } from '../components/CreateHabit';

const { Fixed, Shrink } = FlexibleContainer;

export const HabitListPage: React.FC = () => {
  const { goals, handleRefresh } = useHabitListContext();
  const openCreateHabitModal = () => {
    openDrawer({
      title: '新增习惯',
      content: () => (
        <CreateHabit
          goals={goals}
          onSuccess={() => {
            handleRefresh();
          }}
          onCancel={() => {}}
        />
      ),
      width: 800,
      height: 600,
    });
  };

  return (
    <DefaultPage title="习惯管理">
      <FlexibleContainer>
        <Fixed>
          <HabitListFilter />
        </Fixed>
        <Fixed>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={() => {
              openCreateHabitModal();
            }}
          >
            新增习惯
          </Button>
        </Fixed>
        <Shrink>
          <HabitListTable />
        </Shrink>
      </FlexibleContainer>
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
