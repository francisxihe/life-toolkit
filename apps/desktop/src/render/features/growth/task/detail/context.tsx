'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskVo } from '@true-north/vo';
import { TaskService, TodoService, TrackTimeController } from '@true-north/web-service';
import { TrackTimeRelatedType } from '@true-north/enum';
import { message } from '@sue/design-web-react';
import { createInjectState } from '@/utils/createInjectState';

export type TaskDetailContextProps = {
  taskId: string;
  fromGoal?: string;
  onRefresh?: () => Promise<void>;
  children: React.ReactNode;
};

export const [TaskDetailProvider, useTaskDetailContext] = createInjectState<{
  PropsType: TaskDetailContextProps;
  ContextType: {
    currentTask: TaskVo | null;
    selectedTaskId: string;
    setSelectedTaskId: (id: string) => void;
    taskTree: TaskVo[];
    loading: boolean;
    fromGoal?: string;
    fetchTaskDetail: (id: string) => Promise<void>;
    fetchTaskTree: () => Promise<void>;
    refreshData: () => Promise<void>;
  };
}>((props) => {
  const [currentTask, setCurrentTask] = useState<TaskVo | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(props.taskId);
  const [taskTree, setTaskTree] = useState<TaskVo[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取任务详情
  const fetchTaskDetail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const [task, todoResult, trackTimeResult] = await Promise.all([
        TaskService.taskWithRelations(id),
        TodoService.list({ taskIds: [id] }),
        TrackTimeController.findByRelatedId(TrackTimeRelatedType.TASK, id),
      ]);
      if (!task) return;
      setCurrentTask({
        ...task,
        todoList: (todoResult?.list || []) as TaskVo['todoList'],
        trackTimeList: (trackTimeResult?.list || []) as TaskVo['trackTimeList'],
      });
      setSelectedTaskId(id);
    } catch (error) {
      console.error('获取任务详情失败:', error);
      message.error('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取任务树
  const fetchTaskTree = useCallback(async () => {
    try {
      const { list } = await TaskService.getTree({});
      const containsTask = (task: TaskVo, id: string): boolean =>
        task.id === id || Boolean(task.children?.some((child) => containsTask(child, id)));
      const root = list.find((task) => containsTask(task, props.taskId));
      setTaskTree(root ? [root] : []);
    } catch (error) {
      console.error('获取任务树失败:', error);
      message.error('获取任务树失败');
    }
  }, [props.taskId]);

  // 刷新数据
  const refreshData = useCallback(async () => {
    await Promise.all([fetchTaskDetail(selectedTaskId), fetchTaskTree()]);
    await props.onRefresh?.();
  }, [selectedTaskId, fetchTaskDetail, fetchTaskTree, props.onRefresh]);

  // 初始化数据
  useEffect(() => {
    fetchTaskDetail(props.taskId);
    fetchTaskTree();
  }, [props.taskId, fetchTaskDetail, fetchTaskTree]);

  return {
    currentTask,
    selectedTaskId,
    setSelectedTaskId,
    taskTree,
    loading,
    fromGoal: props.fromGoal,
    fetchTaskDetail,
    fetchTaskTree,
    refreshData,
  };
});
