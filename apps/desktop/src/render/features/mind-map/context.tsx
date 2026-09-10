import { useState } from 'react';
import { GoalVo } from '@true-north/vo';
import { GoalService } from '@true-north/web-service';
import { message } from '@sue/design-web-react';
import { GoalType } from '@true-north/enum';
import { createInjectState } from '@true-north/common-web-utils';
import { Modal } from '@sue/design-web-react';

export const [GoalMindMapContextProvider, useGoalMindMapContext] =
  createInjectState<{
    PropsType: {
      children: React.ReactNode;
    };
    ContextType: {
      loading: boolean;
      goalTree: GoalVo[];
      fetchGoalTree: () => Promise<void>;
    };
  }>(() => {
    const [loading, setLoading] = useState(false);
    const [goalTree, setGoalTree] = useState<GoalVo[]>([]);

    // 获取目标树数据
    const fetchGoalTree = async () => {
      setLoading(true);
      try {
        const data = await GoalService.getTree({});
        setGoalTree(data);
      } catch (error) {
        console.error('获取目标数据失败:', error);
        message.error('获取目标数据失败');
      } finally {
        setLoading(false);
      }
    };

    return {
      loading,
      goalTree,
      fetchGoalTree,
    };
  });
