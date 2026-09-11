import { createInjectState } from '@/utils/createInjectState';
import React, { useState, useEffect, useCallback, ReactNode, Dispatch, SetStateAction } from 'react';
import { Card, Button, Space, Empty, Spin, message, Modal, Tag, Progress, Table } from '@sue/design-web-react';
import { HabitController, GoalController, TodoController } from '@true-north/web-service';
import {
  HabitWithoutRelationsVo,
  HabitPageFilterVo,
  GoalVo,
} from '@true-north/vo';
import { useHabitContext } from '../context';
import { HabitStatus, TodoRelatedType } from '@true-north/enum';
import { emitHabitChanged } from '../../events';

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
    setFilters: Dispatch<SetStateAction<HabitPageFilterVo>>;
    handlePageChange: (page: number, pageSize: number) => void;
    handleHabitComplete: (habitId: string) => void;
    handleHabitIncomplete: (habitId: string) => void;
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
      message.error('获取习惯列表失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 获取目标列表
  const fetchGoals = useCallback(async () => {
    try {
      const response = await GoalController.findByFilter({});
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
        const habit = habits.find((item) => item.id === habitId);
        if (!habit?.cycleTodoId) throw new Error('当前没有可结算的习惯待办');
        await TodoController.done(TodoRelatedType.HABIT, habit.cycleTodoId);
        message.success('习惯本次打卡已完成');
        fetchHabits();
        refreshHabits();
        emitHabitChanged();
      } catch (error) {
        console.error('完成习惯失败:', error);
        message.error('完成习惯失败');
      }
    },
    [fetchHabits, habits, refreshHabits],
  );

  const handleHabitIncomplete = useCallback(
    async (habitId: string) => {
      try {
        const habit = habits.find((item) => item.id === habitId);
        if (!habit?.cycleTodoId) throw new Error('当前没有可结算的习惯待办');
        await TodoController.abandon(TodoRelatedType.HABIT, habit.cycleTodoId);
        message.success('已记录未完成');
        fetchHabits();
        refreshHabits();
        emitHabitChanged();
      } catch (error) {
        console.error('标记习惯未完成失败:', error);
        message.error('标记习惯未完成失败');
      }
    },
    [fetchHabits, habits, refreshHabits],
  );

  // 处理习惯删除
  const handleHabitDelete = useCallback(
    async (habitId: string) => {
      Modal.confirm({
        title: '确认删除习惯',
        content: '删除后无法恢复，确定要删除这个习惯吗？',
        onOk: async () => {
          try {
            await HabitController.delete(habitId);
            message.success('习惯已删除');
            fetchHabits();
            refreshHabits();
            emitHabitChanged();
          } catch (error) {
            console.error('删除习惯失败:', error);
            message.error('删除习惯失败');
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
    setFilters,
    handlePageChange,
    handleHabitComplete,
    handleHabitIncomplete,
    handleHabitDelete,
    handleRefresh,
  };
});
