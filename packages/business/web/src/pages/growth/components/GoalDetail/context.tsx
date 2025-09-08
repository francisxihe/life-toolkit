'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import { GoalVo, GoalWithoutRelationsVo } from '@life-toolkit/vo';
import { GoalFormData, GoalService, GoalMapping } from '../../service';
import { createInjectState } from '@/utils/createInjectState';
import { GoalType, GoalStatus, Importance } from '@life-toolkit/enum';

export type GoalDetailContextProps = {
  goalId?: string;
  children: React.ReactNode;
  initialFormData?: Partial<GoalFormData>;
  size?: 'small' | 'default';
  onClose?: () => Promise<void>;
  afterSubmit?: () => Promise<void>;
};

export const [GoalDetailProvider, useGoalDetailContext] = createInjectState<{
  PropsType: GoalDetailContextProps;
  ContextType: {
    currentGoal: GoalVo;
    goalFormData: GoalFormData;
    goalList: GoalWithoutRelationsVo[];
    size: 'small' | 'default';
    setGoalFormData: Dispatch<React.SetStateAction<GoalFormData>>;
    onSubmit: () => Promise<void>;
    onClose?: () => Promise<void>;
    handleUpdate: () => Promise<void>;
    handleCreate: () => Promise<void>;
    showGoalChildren: (id: string) => Promise<void>;
    refreshGoalDetail: (id: string) => Promise<void>;
  };
}>((props) => {
  const [currentGoal, setCurrentGoal] = useState<GoalVo>();

  const defaultFormData: GoalFormData = {
    name: '',
    type: props.initialFormData?.type || GoalType.KEY_RESULT,
    status: props.initialFormData?.status || GoalStatus.TODO,
    importance: props.initialFormData?.importance || Importance.Helpful,
    planTimeRange: [undefined, undefined],
    children: [],
    ...props.initialFormData,
  };

  const [goalFormData, setGoalFormData] =
    useState<GoalFormData>(defaultFormData);

  const showGoalChildren = async (id: string) => {
    await refreshGoalDetail(id);
  };

  const refreshGoalDetail = useCallback(
    async (id: string) => {
      const goal = await GoalService.getDetail(id);
      setCurrentGoal(goal);
    },
    [setCurrentGoal],
  );

  const { goalList } = GoalService.useGoalList({
    excludeIds: [props.goalId],
  });

  async function handleCreate() {
    await GoalService.createGoal(GoalMapping.formDataToCreateVo(goalFormData));
    setGoalFormData(defaultFormData);
  }

  async function handleUpdate() {
    await GoalService.updateGoal(
      currentGoal.id,
      GoalMapping.formDataToUpdateVo(goalFormData),
    );
  }

  const onSubmit = async () => {
    await props.afterSubmit?.();
  };

  return {
    currentGoal,
    goalFormData,
    goalList,
    size: props.size || 'default',
    setGoalFormData,
    onSubmit,
    handleUpdate,
    handleCreate,
    showGoalChildren,
    refreshGoalDetail,
    onClose: props.onClose,
  };
});
