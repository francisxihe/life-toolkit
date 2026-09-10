import React, { useEffect, useState } from 'react';
import { Empty, Spin, Tabs, Flex } from '@sue/design-web-react';
import { useGoalContext } from '../context';
import { GoalDetailProvider, GoalForeign } from '../../components/GoalDetail';
import GoalMainHeader from './GoalMainHeader';
import GoalOverview from './GoalOverview';
import styles from './style.module.less';

const GoalDetail: React.FC = () => {
  const {
    selectedGoal,
    fetchGoalDetail,
    selectedGoalId,
    setSelectedGoalId,
  } = useGoalContext();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (selectedGoalId) {
      fetchGoalDetail(selectedGoalId);
      setActiveTab('overview');
    }
  }, [selectedGoalId]);

  if (!selectedGoalId) {
    return (
      <Flex container="fill" align="center" justify="center">
        <Empty description="请从左侧选择一个目标查看详情" />
      </Flex>
    );
  }

  if (!selectedGoal) {
    return (
      <Flex container="fill" align="center" justify="center">
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <GoalDetailProvider
      key={`${selectedGoal.id}-${selectedGoal.updatedAt ?? ''}`}
      size="small"
      goalId={selectedGoal.id}
      readonly
    >
      <Flex vertical container="full" className={styles.detail}>
        <GoalMainHeader />
        <Flex container="fill" className={styles.body}>
          <Tabs
            tabBarStyle={{ padding: '0 12px' }}
            styles={{
              body: {
                padding: '8px 12px',
              },
            }}
            size='small'
            activeKey={activeTab}
            onChange={setActiveTab}
            className={styles.tabs}
            items={[
              {
                key: 'overview',
                label: '概览',
                children: <GoalOverview />,
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
                children: (
                  <GoalForeign
                    goalId={selectedGoal.id}
                    activeTab="taskList"
                  />
                ),
              },
            ]}
          />
        </Flex>
      </Flex>
    </GoalDetailProvider>
  );
};

export default GoalDetail;
