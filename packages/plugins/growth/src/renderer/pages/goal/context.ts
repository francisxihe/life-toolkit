import { useState, useCallback } from 'react';
import { GoalVo } from '@true-north/vo';
import { GoalService, TaskService } from '../../../client';
import { message } from '@sue/design-web-react';
import { GoalStatus, GoalType, Importance, Difficulty } from '@true-north/enum';
import { createInjectState } from '@true-north/common-web-utils';

interface GoalFilters {
  status?: GoalStatus[];
  type?: GoalType;
  importance?: Importance;
  difficulty?: Difficulty;
  dateRange?: string[];
}

export const [GoalProvider, useGoalContext] = createInjectState<{
  PropsType: {
    children: React.ReactNode;
  };
  ContextType: {
    searchValue: string;
    setSearchValue: (value: string) => void;

    filters: GoalFilters;
    setFilters: (filters: GoalFilters) => void;
    clearFilters: () => void;

    loading: boolean;
    goalTree: GoalVo[];
    selectedGoal: GoalVo | null;
    selectedGoalId: string | null;
    setSelectedGoalId: (goalId: string | null) => void;
    fetchGoalTree: () => Promise<void>;
    fetchGoalDetail: (goalId: string) => Promise<void>;
    loadChildren: (parentId: string) => Promise<void>;
    refreshData: () => Promise<void>;
  };
}>(() => {
  const [searchValue, setSearchValue] = useState('');

  const [filters, setFilters] = useState<GoalFilters>({});

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const [loading, setLoading] = useState(false);
  const [goalTree, setGoalTree] = useState<GoalVo[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalVo | null>(null);

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // 获取目标树数据 - 只获取根节点
  const fetchGoalTree = useCallback(async () => {
    setLoading(true);
    try {
      // 目标树筛选必须保留命中节点的父级路径。
      if (searchValue || Object.keys(filters).length > 0) {
        // 构建筛选条件
        const filterParams: any = {
          keyword: searchValue || undefined,
          type: filters.type || undefined,
          importance: filters.importance || undefined,
          difficulty: filters.difficulty || undefined,
        };

        // 处理状态筛选
        if (filters.status && filters.status.length > 0) {
          filterParams.status = filters.status;
        }

        // 查询与所选计划区间有重叠的目标。
        if (filters.dateRange && filters.dateRange.length === 2) {
          filterParams.startDateEnd = filters.dateRange[1];
          filterParams.endDateStart = filters.dateRange[0];
        }

        const response = await GoalService.getTree(filterParams);
        const data = response || [];
        const treeData = Array.isArray(data) ? data : [];
        setGoalTree(treeData);
      } else {
        // 没有筛选条件时，只获取根节点
        const rootGoals = await GoalService.findRoots();
        const rootData = Array.isArray(rootGoals) ? rootGoals : [];
        // 为每个根节点添加 children 数组，标记为未加载
        const treeData = rootData.map((goal) => ({
          ...goal,
          children: [], // 空数组表示未加载子节点
          hasChildren: true, // 标记可能有子节点，需要异步加载
        }));
        setGoalTree(treeData);
      }
    } catch (error) {
      console.error('获取目标数据失败:', error);
      message.error('获取目标数据失败');
    } finally {
      setLoading(false);
    }
  }, [searchValue, filters]);

  // 获取目标详情
  const fetchGoalDetail = useCallback(async (goalId: string) => {
    try {
      const goal = await GoalService.find(goalId);
      setSelectedGoal(goal);
      // 同时获取关联任务
    } catch (error) {
      console.error('获取目标详情失败:', error);
      message.error('获取目标详情失败');
    }
  }, []);

  // 异步加载子节点
  const loadChildren = useCallback(async (parentId: string) => {
    try {
      const children = await GoalService.findChildren(parentId);
      const childrenData = Array.isArray(children) ? children : [];

      // 更新树形数据，将子节点添加到对应的父节点
      const updateTree = (nodes: GoalVo[]): GoalVo[] => {
        return nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: childrenData.map((child) => ({
                ...child,
                children: [],
                hasChildren: true, // 假设子节点也可能有子节点
              })),
              hasChildren: childrenData.length > 0,
            };
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateTree(node.children),
            };
          }
          return node;
        });
      };

      setGoalTree((prevTree) => updateTree(prevTree));
    } catch (error) {
      console.error('加载子节点失败:', error);
      message.error('加载子节点失败');
    }
  }, []);

  // 刷新数据
  const refreshData = useCallback(async () => {
    await fetchGoalTree();
    if (selectedGoal) {
      await fetchGoalDetail(selectedGoal.id);
    }
  }, [fetchGoalTree, fetchGoalDetail, selectedGoal]);

  return {
    searchValue,
    setSearchValue,

    filters,
    setFilters,
    clearFilters,

    loading,
    goalTree,
    selectedGoal,
    selectedGoalId,
    setSelectedGoalId,
    fetchGoalTree,
    fetchGoalDetail,
    loadChildren,
    refreshData,
  };
});
