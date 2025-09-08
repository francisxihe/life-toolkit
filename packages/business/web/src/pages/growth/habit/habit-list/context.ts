import { createInjectState } from '@/utils/createInjectState';
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  Message,
  Modal,
  Tag,
  Progress,
  Table,
} from '@arco-design/web-react';
import { HabitController, GoalController } from '@life-toolkit/api';
import {
  HabitWithoutRelationsVo,
  HabitPageFilterVo,
  GoalVo,
} from '@life-toolkit/vo';
import { useHabitContext } from '../context';

export const [HabitListProvider, useHabitListContext] = createInjectState<{
  PropsType: {
    children: ReactNode;
  };
  ContextType: {
    habits: HabitWithoutRelationsVo[];
    goals: GoalVo[];
    loading: boolean;
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
    filters: HabitPageFilterVo;
    handlePageChange: (page: number, pageSize: number) => void;
    handleHabitComplete: (habitId: string) => void;
    handleHabitDelete: (habitId: string) => void;
    handleRefresh: () => Promise<void>;
  };
}>((props) => {
  const { refreshHabits } = useHabitContext();

  // 状态管理
  const [habits, setHabits] = useState<HabitWithoutRelationsVo[]>([]);
  const [goals, setGoals] = useState<GoalVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState<HabitPageFilterVo>({
    pageNum: 1,
    pageSize: 12,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // 获取习惯列表
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await HabitController.page(filters);
      setHabits(response.list);
      setPagination({
        current: response.pageNum,
        pageSize: response.pageSize,
        total: response.total,
      });
    } catch (error) {
      console.error('获取习惯列表失败:', error);
      Message.error('获取习惯列表失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 获取目标列表
  const fetchGoals = useCallback(async () => {
    try {
      const response = await GoalController.getGoalList({});
      setGoals(
        response.list.map((goal) => ({
          ...goal,
          children: [],
          taskList: [],
        })),
      );
    } catch (error) {
      console.error('获取目标列表失败:', error);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchHabits();
    fetchGoals();
  }, [fetchHabits, fetchGoals]);

  // 处理分页变更
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageNum: page,
      pageSize,
    }));
  }, []);

  // 处理习惯完成
  const handleHabitComplete = useCallback(
    async (habitId: string) => {
      try {
        await HabitController.doneBatchHabit({ includeIds: [habitId] });
        Message.success('习惯已完成');
        fetchHabits();
        refreshHabits();
      } catch (error) {
        console.error('完成习惯失败:', error);
        Message.error('完成习惯失败');
      }
    },
    [fetchHabits, refreshHabits],
  );

  // 处理习惯删除
  const handleHabitDelete = useCallback(
    async (habitId: string) => {
      Modal.confirm({
        title: '确认删除习惯',
        content: '删除后无法恢复，确定要删除这个习惯吗？',
        onOk: async () => {
          try {
            await HabitController.deleteHabit(habitId);
            Message.success('习惯已删除');
            fetchHabits();
            refreshHabits();
          } catch (error) {
            console.error('删除习惯失败:', error);
            Message.error('删除习惯失败');
          }
        },
      });
    },
    [fetchHabits, refreshHabits],
  );

  // 刷新数据
  const handleRefresh = useCallback(async () => {
    await fetchHabits();
    await fetchGoals();
  }, [fetchHabits, fetchGoals]);

  return {
    habits,
    goals,
    loading,
    pagination,
    filters,
    handlePageChange,
    handleHabitComplete,
    handleHabitDelete,
    handleRefresh,
  };
});
