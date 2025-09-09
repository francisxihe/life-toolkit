import { createContext, useContext } from 'react';
import { HabitVo } from '@life-toolkit/vo';

export interface HabitContextType {
  selectedHabit: HabitVo | null;
  setSelectedHabit: (habit: HabitVo | null) => void;
  refreshHabits: () => void;
}

export const HabitContext = createContext<HabitContextType>({
  selectedHabit: null,
  setSelectedHabit: () => {},
  refreshHabits: () => {},
});

export const useHabitContext = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error(
      'useHabitContext must be used within a HabitContext.Provider',
    );
  }
  return context;
};
