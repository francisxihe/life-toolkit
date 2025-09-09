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
  GoalWithoutRelationsVo,
  GoalPageFilterVo,
} from '@life-toolkit/vo';
import { GoalService } from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import { GoalType, GoalStatus } from '@life-toolkit/enum';

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
    goalList: GoalWithoutRelationsVo[];
    filters: GoalPageFilterVo;
    setFilters: Dispatch<SetStateAction<GoalPageFilterVo>>;
    clearFilters: () => Promise<void>;
    getGoalPage: () => Promise<void>;
  };
}>(() => {
  const [goalList, setGoalList] = useState<GoalWithoutRelationsVo[]>([]);

  const [filters, setFilters, filtersRef] = useSyncState<GoalPageFilterVo>({
    keyword: undefined,
    importance: undefined,
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
      status: undefined,
      type: undefined,
      startAt: undefined,
      endAt: undefined,
    });
    await getGoalPage();
  };

  return { goalList, getGoalPage, filters, setFilters, clearFilters };
});
