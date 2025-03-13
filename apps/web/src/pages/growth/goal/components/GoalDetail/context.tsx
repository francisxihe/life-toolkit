'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import {
  GoalVo,
  UpdateGoalVo,
  GoalItemVo,
  GoalStatus,
} from '@life-toolkit/vo/growth';
import { GoalFormData, GoalService, GoalMapping } from '../../../service';
import { createInjectState } from '@/utils/createInjectState';

export type GoalDetailContextProps = {
  children: React.ReactNode;
  goal?: GoalVo | GoalItemVo;
  initialFormData?: Partial<GoalFormData>;
  mode: 'editor' | 'creator';
  size?: 'small' | 'default';
  afterSubmit?: () => Promise<void>;
};

export const [GoalDetailProvider, useGoalDetailContext] = createInjectState<{
  PropsType: GoalDetailContextProps;
  ContextType: {
    currentGoal: GoalVo;
    goalFormData: GoalFormData;
    goalList: GoalItemVo[];
    size: 'small' | 'default';
    loading: boolean;
    setGoalFormData: Dispatch<React.SetStateAction<GoalFormData>>;
    onSubmit: () => Promise<void>;
    showSubGoal: (id: string) => Promise<void>;
    refreshGoalDetail: (id: string) => Promise<void>;
  };
}>((props) => {
  const [level, setLevel] = useState(0);

  const [loading, setLoading] = useState(false);

  const [currentGoal, setCurrentGoal] = useState<GoalVo>();

  const defaultFormData: GoalFormData = {
    name: '',
    status: GoalStatus.TODO,
    planTimeRange: [undefined, undefined],
    children: [],
    ...props.initialFormData,
  };

  const [goalFormData, setGoalFormData] =
    useState<GoalFormData>(defaultFormData);

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

  const { goalList } = GoalService.useGoalList({
    withoutSelf: true,
    id: props.goal?.id,
  });

  const initGoalFormData = useCallback(async () => {
    const goal = await GoalService.getDetail(props.goal.id);
    currentGoalRef.current = goal;
    setCurrentGoal(currentGoalRef.current);
    setGoalFormData(GoalMapping.voToGoalFormData(currentGoalRef.current));
  }, [props.goal]);

  useEffect(() => {
    async function init() {
      if (props.mode === 'editor') {
        setLoading(true);
        await initGoalFormData();
        setLoading(false);
      }
    }
    init();
  }, [initGoalFormData, props.mode]);

  async function handleCreate() {
    if (!goalFormData.name) {
      return;
    }
    await GoalService.addGoal({
      name: goalFormData.name,
      startAt: goalFormData.planTimeRange?.[0] || undefined,
      endAt: goalFormData.planTimeRange?.[1] || undefined,
      parentId: goalFormData.parentId,
    });
    setGoalFormData(defaultFormData);
    await props.afterSubmit?.();
  }

  async function handleUpdate(data: Partial<UpdateGoalVo>) {
    await GoalService.updateGoal(currentGoal.id, data);
  }

  const onSubmit = async () => {
    if (props.mode === 'creator') {
      await handleCreate();
    } else {
      await handleUpdate(GoalMapping.formDataToUpdateVo(goalFormData));
    }
  };

  return {
    currentGoal,
    goalFormData,
    goalList,
    setGoalFormData,
    onSubmit,
    showSubGoal,
    refreshGoalDetail,
    size: props.size || 'default',
    loading,
  };
});
