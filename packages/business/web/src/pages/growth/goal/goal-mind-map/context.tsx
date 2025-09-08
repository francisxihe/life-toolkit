import { createInjectState } from '@life-toolkit/common-web-utils';
import { useState } from 'react';
import { GoalVo } from '@life-toolkit/vo';
import { GoalService } from '../../service';
import { Message } from '@arco-design/web-react';
import { GoalType, GoalStatus } from '@life-toolkit/enum';

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
        const data = await GoalService.getGoalTree({
          status: GoalStatus.TODO,
        });
        setGoalTree(data);
        Message.success('目标数据加载成功');
      } catch (error) {
        console.error('获取目标数据失败:', error);
        Message.error('获取目标数据失败');
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
