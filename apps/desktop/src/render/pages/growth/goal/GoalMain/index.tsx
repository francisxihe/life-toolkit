import React, { useEffect, useState } from 'react';
import { Empty, Spin, Tabs, Flex } from '@sue/design-web-react';
import { useGoalContext } from '../context';
import {
  GoalDetailProvider,
  GoalForm,
  GoalForeign,
} from '../../components/GoalDetail';
import GoalMainHeader from './GoalMainHeader';
import styles from './style.module.less';

const GoalDetail: React.FC = () => {
  const {
    selectedGoal,
    fetchGoalDetail,
    refreshData,
    selectedGoalId,
    setSelectedGoalId,
    isEditing,
    setIsEditing,
  } = useGoalContext();
  const [activeTab, setActiveTab] = useState('overview');

  // 当选中的目标ID变化时，获取详情
  useEffect(() => {
    if (selectedGoalId) {
      fetchGoalDetail(selectedGoalId);
      setIsEditing(false); // 切换目标时退出编辑模式
      setActiveTab('overview');
    }
  }, [selectedGoalId]);

  // 编辑完成后的回调
  const handleEditComplete = async () => {
    setIsEditing(false);
    await refreshData();
  };

  if (!selectedGoalId) {
    return (
      <Flex align="center" justify="center" className={styles.emptyState}>
        <Empty description="请从左侧选择一个目标查看详情" />
      </Flex>
    );
  }

  if (!selectedGoal) {
    return (
      <Flex align="center" justify="center" className={styles.emptyState}>
        <Spin size={40} />
      </Flex>
    );
  }

  return (
    <GoalDetailProvider
      size="small"
      goalId={selectedGoal.id}
      readonly={!isEditing}
      onClose={handleEditComplete}
      afterSubmit={handleEditComplete}
    >
      <Flex vertical container="full" className={styles.detail}>
        <GoalMainHeader />
        <Flex container="fill" className={styles.body}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className={styles.tabs}
            items={[
              {
                key: 'overview',
                label: '概览',
                children: <GoalForm />,
              },
              {
                key: 'children',
                label: '子目标',
                children: (
                  <GoalForeign
                    goalId={selectedGoal.id}
                    activeTab="children"
                    onChangeGoal={async (id) => {
                      setSelectedGoalId(id);
                    }}
                  />
                ),
              },
              {
                key: 'tasks',
                label: '关联任务',
                children: <GoalForeign goalId={selectedGoal.id} activeTab="taskList" />,
              },
            ]}
          />
        </Flex>
      </Flex>
    </GoalDetailProvider>
  );
};

export default GoalDetail;
