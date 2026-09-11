import React from 'react';
import type { GrowthTab } from '@true-north/plugin-growth/contract';
import { HabitContext } from './context';
import { HabitVo } from '@true-north/vo';
import HabitList from './habit-list';
import HabitDetailPage from './habit-detail';

const HabitPage: React.FC<{ tab: GrowthTab; id?: string }> = ({ tab, id }) => {
  const [selectedHabit, setSelectedHabit] = React.useState<HabitVo | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const refreshHabits = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <HabitContext.Provider
      value={{
        selectedHabit,
        setSelectedHabit,
        refreshHabits,
      }}
    >
      {tab === 'detail' && id ? <HabitDetailPage /> : <HabitList />}
    </HabitContext.Provider>
  );
};

export default HabitPage;
