'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type { GoalVo, UpdateGoalVo } from '@life-toolkit/vo/goal';
import { GoalFormData } from '../../types';
import GoalService from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import type { GoalDetailProps } from '.';
import { GoalMapping } from '../../mapping';
export const [GoalDetailProvider, useGoalDetailContext] = createInjectState<{
  PropsType: {
    children: React.ReactNode;
    goal: GoalDetailProps['goal'];
    onClose: GoalDetailProps['onClose'];
    onChange: GoalDetailProps['onChange'];
  };
  ContextType: {
    currentGoal: GoalVo;
    goalFormData: GoalFormData;
    setGoalFormData: Dispatch<React.SetStateAction<GoalFormData>>;
    onClose: () => Promise<void> | null;
    onChange: (data: Partial<UpdateGoalVo>) => Promise<void>;
    showSubGoal: (id: string) => Promise<void>;
    refreshGoalDetail: (id: string) => Promise<void>;
  };
}>((props) => {
  const [level, setLevel] = useState(0);

  const [currentGoal, setCurrentGoal] = useState<GoalVo>(props.goal);

  const [goalFormData, setGoalFormData] = useState<GoalFormData>();

  const currentGoalRef = useRef<GoalVo>();

  const showSubGoal = async (id: string) => {
    setLevel(level + 1);
    await refreshGoalDetail(id);
  };

  const refreshGoalDetail = async (id: string) => {
    const fetched = await GoalService.getDetail(id);
    currentGoalRef.current = {
      ...fetched,
    };
    setCurrentGoal(currentGoalRef.current);
    setGoalFormData(GoalMapping.voToGoalFormData(currentGoalRef.current));
  };

  const initGoalFormData = useCallback(async () => {
    const goal = await GoalService.getDetail(props.goal.id);
    currentGoalRef.current = goal;
    setGoalFormData(GoalMapping.voToGoalFormData(currentGoalRef.current));
  }, [props.goal]);

  useEffect(() => {
    initGoalFormData();
  }, [initGoalFormData]);

  let onClose = null;
  if (props.onClose) {
    onClose = async () => {
      setGoalFormData(null);
      await props.onClose();
    };
  }

  async function onChange(data: Partial<UpdateGoalVo>) {
    if (level > 0) {
      const updatedGoal = await GoalService.updateGoal(currentGoal.id, data);
      await refreshGoalDetail(updatedGoal.id);
    } else {
      const updatedGoal = await GoalService.updateGoal(currentGoal.id, data);
      await props.onChange(updatedGoal);
    }
  }

  return {
    currentGoal,
    goalFormData,
    setGoalFormData,
    onClose,
    onChange,
    showSubGoal,
    refreshGoalDetail,
  };
});
