'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type {
  TaskVo,
  UpdateTaskVo,
  GoalWithoutRelationsVo,
  TaskWithoutRelationsVo,
  CreateTaskVo,
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
  task?: TaskVo | TaskWithoutRelationsVo;
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
    goalList: GoalWithoutRelationsVo[];
    taskList: TaskWithoutRelationsVo[];
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
    excludeIds: [props.task?.id],
  });

  const { goalList } = GoalService.useGoalList();

  const showSubTask = async (id: string) => {
    await refreshTaskDetail(id);
  };

  const refreshTaskDetail = async (id: string) => {
    const task = await TaskService.getTaskDetail(id);
    setCurrentTask(task);
    setTaskFormData(TaskMapping.voToFormData(task));
  };

  const initTaskFormData = useCallback(async () => {
    await refreshTaskDetail(props.task.id);
  }, [props.task]);

  useEffect(() => {
    async function init() {
      if (props.mode === 'editor') {
        setLoading(true);
        await initTaskFormData();
        setLoading(false);
      }
    }
    init();
  }, [props.mode, initTaskFormData]);

  async function handleCreate(createTaskVo: CreateTaskVo) {
    if (!taskFormData.name) {
      return;
    }
    await TaskService.createTask(createTaskVo);
    setTaskFormData(defaultFormData);
  }

  async function handleUpdate(data: Partial<UpdateTaskVo>) {
    await TaskService.updateTask(currentTask.id, data);
  }

  const onSubmit = async () => {
    if (props.mode === 'creator') {
      await handleCreate(TaskMapping.formDataToCreateVo(taskFormData));
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
