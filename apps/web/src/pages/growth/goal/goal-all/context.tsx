'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useRef,
  useEffect,
} from 'react';
import {
  GoalVo,
  GoalItemVo,
  GoalPageFiltersVo,
  GoalStatus,
  GoalType,
} from '@life-toolkit/vo/goal';
import GoalService from '../service';
import { createInjectState } from '@/utils/createInjectState';

function useSyncState<T>(
  initialValue: T,
): [T, (newValue: T) => void, React.MutableRefObject<T>] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);

  const setSyncState = (newValue: T) => {
    setState(newValue);
    stateRef.current = newValue;
  };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, setSyncState, stateRef];
}

export const [GoalAllProvider, useGoalAllContext] = createInjectState<{
  ContextType: {
    goalList: GoalItemVo[];
    getGoalPage: () => Promise<void>;
    filters: GoalPageFiltersVo;
    setFilters: Dispatch<SetStateAction<GoalPageFiltersVo>>;
    clearFilters: () => Promise<void>;
  };
}>(() => {
  const [goalList, setGoalList] = useState<GoalItemVo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<GoalPageFiltersVo>({
    keyword: undefined,
    importance: undefined,
    urgency: undefined,
    status: GoalStatus.TODO,
    type: undefined,
    startAt: undefined,
    endAt: undefined,
  });

  async function getGoalPage() {
    const { list, total } = await GoalService.getGoalPage(filtersRef.current);
    setGoalList(list);
  }

  const clearFilters = async () => {
    setFilters({
      keyword: undefined,
      importance: undefined,
      urgency: undefined,
      status: undefined,
      type: undefined,
      startAt: undefined,
      endAt: undefined,
    });
    await getGoalPage();
  };

  return { goalList, getGoalPage, filters, setFilters, clearFilters };
});
