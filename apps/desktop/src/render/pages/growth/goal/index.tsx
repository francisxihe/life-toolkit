'use client';

import { GoalProvider } from './context';
import React, { useState } from 'react';
import { Flex, Tabs } from '@sue/design-web-react';
import GoalMain from './GoalMain';
import GoalAside from './GoalAside';
import GoalMindMap from '@/pages/mind-map';
import styles from './style.module.less';

interface GoalTreeViewProps {
  className?: string;
}

const GoalTreeView: React.FC<GoalTreeViewProps> = () => {
  return (
    <Flex container="full" className={styles.treeLayout}>
      {/* 左侧目标树 */}
      <Flex container="fixed" className={styles.sider}>
        <GoalAside />
      </Flex>

      {/* 右侧详情面板 */}
      <Flex container="fill" className={styles.content}>
        <GoalMain />
      </Flex>
    </Flex>
  );
};

export default function Goal() {
  const [activeTab, setActiveTab] = useState('tree');

  return (
    <Flex vertical container="full" className={styles.page}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles.tabs}
        tabBarStyle={{ padding: '0 16px' }}
        items={[
          {
            key: 'tree',
            label: '目标树',
            children: (
              <GoalProvider>
                <GoalTreeView />
              </GoalProvider>
            ),
          },
          {
            key: 'mindmap',
            label: '目标脑图',
            children: <GoalMindMap />,
          },
        ]}
      />
    </Flex>
  );
}
