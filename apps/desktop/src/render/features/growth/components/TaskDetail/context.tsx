'use client';

import { useState, useEffect, Dispatch, useCallback } from 'react';
import type {
  TaskVo,
  UpdateTaskVo,
  TaskWithoutRelationsVo,
  CreateTaskVo,
} from '@true-north/vo';
import {
  TaskFormData,
  TaskService,
  TaskMapping,
} from '@true-north/web-service';
import { createInjectState } from '@/utils/createInjectState';
import dayjs from 'dayjs';
import { message } from '@sue/design-web-react';
import { emitTaskChanged } from '../../events';

function toValidDayjs(value?: string | dayjs.Dayjs) {
  const date = value ? dayjs(value) : undefined;
  return date?.isValid() ? date : undefined;
}

export function normalizeTaskPlanTimeRange(
  planTimeRange?: TaskFormData['planTimeRange'],
) {
  return [
    toValidDayjs(planTimeRange?.[0]),
    toValidDayjs(planTimeRange?.[1]),
  ] as TaskFormData['planTimeRange'];
}

function normalizeTaskFormData(formData: TaskFormData): TaskFormData {
  return {
    ...formData,
    planTimeRange: normalizeTaskPlanTimeRange(formData.planTimeRange),
  };
}

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
    taskList: TaskWithoutRelationsVo[];
    loading: boolean;
    size: 'small' | 'default';
    setTaskFormData: Dispatch<React.SetStateAction<TaskFormData>>;
    showSubTask: (id: string) => Promise<void>;
    refreshTaskDetail: (id: string) => Promise<void>;
    onSubmit: () => Promise<boolean>;
  };
}>((props) => {
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskVo>();

  const defaultFormData = normalizeTaskFormData({
    name: '',
    children: [],
    trackTimeList: [],
    ...props.initialFormData,
    isSubTask: props.initialFormData?.isSubTask ?? Boolean(props.initialFormData?.parentId),
    planTimeRange: props.initialFormData?.planTimeRange ?? [undefined, undefined],
  } as TaskFormData);

  const [taskFormData, setTaskFormData] =
    useState<TaskFormData>(defaultFormData);
  const [taskList, setTaskList] = useState<TaskWithoutRelationsVo[]>([]);

  const fetchTaskList = useCallback(async () => {
    const result = await TaskService.findByFilter({});
    setTaskList((result?.list || []).filter((task) => task.id !== props.task?.id));
  }, [props.task?.id]);

  const showSubTask = async (id: string) => {
    await refreshTaskDetail(id);
  };

  const refreshTaskDetail = async (id: string) => {
    const task = await TaskService.find(id);
    setCurrentTask(task);
    setTaskFormData(normalizeTaskFormData(TaskMapping.voToFormData(task)));
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

  useEffect(() => {
    fetchTaskList();
  }, [fetchTaskList]);

  async function handleCreate(createTaskVo: CreateTaskVo): Promise<boolean> {
    if (!taskFormData.name) {
      message.error('请输入任务名称');
      return false;
    }
    if (Boolean(createTaskVo.parentId) === Boolean(createTaskVo.goalId)) {
      message.error('请选择一个直接归属：父任务或目标');
      return false;
    }
    const task = await TaskService.create(createTaskVo);
    if (!task) return false;
    setTaskFormData(defaultFormData);
    emitTaskChanged();
    return true;
  }

  async function handleUpdate(data: Partial<UpdateTaskVo>): Promise<boolean> {
    if (!taskFormData.name) {
      message.error('请输入任务名称');
      return false;
    }
    if (Boolean(data.parentId) === Boolean(data.goalId)) {
      message.error('请选择一个直接归属：父任务或目标');
      return false;
    }
    const task = await TaskService.update(currentTask.id, data);
    if (task) emitTaskChanged();
    return Boolean(task);
  }

  const onSubmit = async (): Promise<boolean> => {
    const isSuccess = props.mode === 'creator'
      ? await handleCreate(TaskMapping.formDataToCreateVo(taskFormData))
      : await handleUpdate(TaskMapping.formDataToUpdateVo(taskFormData));
    if (isSuccess) {
      await props.afterSubmit?.();
    } else {
      return false;
    }
    return true;
  };

  return {
    currentTask,
    taskFormData,
    taskList,
    setTaskFormData,
    showSubTask,
    refreshTaskDetail,
    onSubmit,
    loading,
    size: props.size || 'default',
  };
});
