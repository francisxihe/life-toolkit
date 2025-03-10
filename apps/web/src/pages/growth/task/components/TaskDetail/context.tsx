'use client';

import { useState, useEffect, Dispatch, useRef, useCallback } from 'react';
import type { TaskVo, UpdateTaskVo } from '@life-toolkit/vo/growth';
import { TaskFormData, TaskService, TaskMapping } from '../../../service';
import { createInjectState } from '@/utils/createInjectState';
import type { TaskDetailProps } from '.';

export const [TaskDetailProvider, useTaskDetailContext] = createInjectState<{
  PropsType: {
    children: React.ReactNode;
    task: TaskDetailProps['task'];
    onClose: TaskDetailProps['onClose'];
    onChange: TaskDetailProps['onChange'];
  };
  ContextType: {
    currentTask: TaskVo;
    taskFormData: TaskFormData;
    setTaskFormData: Dispatch<React.SetStateAction<TaskFormData>>;
    onClose: () => Promise<void> | null;
    onChange: (data: Partial<UpdateTaskVo>) => Promise<void>;
    showSubTask: (id: string) => Promise<void>;
    refreshTaskDetail: (id: string) => Promise<void>;
  };
}>((props) => {
  const [currentTask, setCurrentTask] = useState<TaskVo>(props.task);

  const [taskFormData, setTaskFormData] = useState<TaskFormData>();

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
    setTaskFormData(TaskMapping.taskVoToTaskFormData(currentTaskRef.current));
  };

  const initTaskFormData = useCallback(async () => {
    const task = await TaskService.getTaskWithTrackTime(props.task.id);
    currentTaskRef.current = task;
    setCurrentTask(currentTaskRef.current);
    setTaskFormData(TaskMapping.taskVoToTaskFormData(currentTaskRef.current));
  }, [props.task]);

  useEffect(() => {
    initTaskFormData();
  }, [initTaskFormData]);

  let onClose = null;
  if (props.onClose) {
    onClose = async () => {
      setTaskFormData(null);
      await props.onClose();
    };
  }

  async function onChange(data: Partial<UpdateTaskVo>) {
    const updatedTask = await TaskService.updateTask(currentTask.id, data);
    await props.onChange(updatedTask);
  }

  return {
    currentTask,
    taskFormData,
    setTaskFormData,
    onClose,
    onChange,
    showSubTask,
    refreshTaskDetail,
  };
});
