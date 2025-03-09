import { createContext } from 'react';
import { HabitVo } from '@life-toolkit/vo/growth/habit';

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