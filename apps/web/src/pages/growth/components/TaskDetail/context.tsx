'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type {
  TaskVo,
  UpdateTaskVo,
  GoalItemVo,
  TaskItemVo,
} from '@life-toolkit/vo/growth';
import {
  TaskFormData,
  TaskService,
  TaskMapping,
  GoalService,
} from '../../service';
import { createInjectState } from '@/utils/createInjectState';

export type TaskDetailContextProps = {
  children: React.ReactNode;
  task?: TaskVo | TaskItemVo;
  initialFormData?: Partial<TaskFormData>;
  mode: 'editor' | 'creator';
  size?: 'small' | 'default';
  afterSubmit?: () => Promise<void>;
};

export const [TaskDetailProvider, useTaskDetailContext] = createInjectState<{
  PropsType: TaskDetailContextProps;
  ContextType: {
    currentTask: TaskVo;
    taskFormData: TaskFormData;
    goalList: GoalItemVo[];
    taskList: TaskItemVo[];
    loading: boolean;
    size: 'small' | 'default';
    setTaskFormData: Dispatch<React.SetStateAction<TaskFormData>>;
    showSubTask: (id: string) => Promise<void>;
    refreshTaskDetail: (id: string) => Promise<void>;
    onSubmit: () => Promise<void>;
  };
}>((props) => {
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskVo>();

  const defaultFormData: TaskFormData = {
    name: '',
    planTimeRange: [undefined, undefined],
    children: [],
    trackTimeList: [],
    isSubTask: false,
    ...props.initialFormData,
  };

  const [taskFormData, setTaskFormData] =
    useState<TaskFormData>(defaultFormData);

  const { taskList } = TaskService.useTaskList({
    withoutSelf: true,
    id: props.task?.id,
  });
  const { goalList } = GoalService.useGoalList();

  const currentTaskRef = useRef<TaskVo>();

  const showSubTask = async (id: string) => {
    await refreshTaskDetail(id);
  };

  const refreshTaskDetail = async (id: string) => {
    const task = await TaskService.getTaskWithTrackTime(id);
    setCurrentTask(task);
    setTaskFormData(TaskMapping.voToFormData(task));
  };

  const initTaskFormData = useCallback(async () => {
    await refreshTaskDetail(props.task.id);
  }, [props.task]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      if (props.mode === 'editor') {
        await initTaskFormData();
      }
      setLoading(false);
    }
    init();
  }, [props.mode, initTaskFormData]);

  async function handleCreate() {
    if (!taskFormData.name) {
      return;
    }
    await TaskService.addTask({
      name: taskFormData.name,
      startAt: taskFormData.planTimeRange?.[0] || undefined,
      endAt: taskFormData.planTimeRange?.[1] || undefined,
      parentId: taskFormData.parentId,
      children: [],
    });
    setTaskFormData(defaultFormData);
  }

  async function handleUpdate(data: Partial<UpdateTaskVo>) {
    await TaskService.updateTask(currentTask.id, data);
  }

  const onSubmit = async () => {
    if (props.mode === 'creator') {
      await handleCreate();
    } else {
      await handleUpdate(TaskMapping.formDataToUpdateVo(taskFormData));
    }
    await props.afterSubmit?.();
  };

  return {
    currentTask,
    taskFormData,
    goalList,
    taskList,
    setTaskFormData,
    showSubTask,
    refreshTaskDetail,
    onSubmit,
    loading,
    size: props.size || 'default',
  };
});
