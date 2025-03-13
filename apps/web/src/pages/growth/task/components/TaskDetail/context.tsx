'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type {
  TaskVo,
  UpdateTaskVo,
  GoalItemVo,
  TaskItemVo,
} from '@life-toolkit/vo/growth';
import { TaskFormData, TaskService, TaskMapping } from '../../../service';
import { createInjectState } from '@/utils/createInjectState';
import { GoalService } from '../../../service';

export type TaskDetailContextProps = {
  children: React.ReactNode;
  task?: TaskVo | TaskItemVo;
  initialFormData?: Partial<TaskFormData>;
  mode: 'editor' | 'creator';
  afterSubmit?: () => Promise<void>;
  size?: 'small' | 'default';
};

export const [TaskDetailProvider, useTaskDetailContext] = createInjectState<{
  PropsType: TaskDetailContextProps;
  ContextType: {
    currentTask: TaskVo;
    taskFormData: TaskFormData;
    setTaskFormData: Dispatch<React.SetStateAction<TaskFormData>>;
    showSubTask: (id: string) => Promise<void>;
    refreshTaskDetail: (id: string) => Promise<void>;
    onSubmit: () => Promise<void>;
    goalList: GoalItemVo[];
    taskList: TaskItemVo[];
    loading: boolean;
    size: 'small' | 'default';
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
    const fetched = await TaskService.getTaskWithTrackTime(id);
    currentTaskRef.current = {
      ...fetched,
    };
    setCurrentTask(currentTaskRef.current);
    setTaskFormData(TaskMapping.voToFormData(currentTaskRef.current));
  };

  const initTaskFormData = useCallback(async () => {
    const task = await TaskService.getTaskWithTrackTime(props.task.id);
    currentTaskRef.current = task;
    setCurrentTask(currentTaskRef.current);
    setTaskFormData(TaskMapping.voToFormData(currentTaskRef.current));
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
    await props.afterSubmit?.();
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
