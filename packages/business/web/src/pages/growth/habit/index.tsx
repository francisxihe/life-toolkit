import React from 'react';
import { Outlet } from 'react-router-dom';
import { HabitContext } from './context';
import { HabitVo } from '@life-toolkit/vo/growth/habit';

const HabitPage: React.FC = () => {
  const [selectedHabit, setSelectedHabit] = React.useState<HabitVo | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const refreshHabits = React.useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <HabitContext.Provider
      value={{
        selectedHabit,
        setSelectedHabit,
        refreshHabits,
      }}
    >
      <Outlet />
    </HabitContext.Provider>
  );
};

export default HabitPage; 