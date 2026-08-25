'use client';

import { GoalProvider } from './context';
import React, { useState } from 'react';
import { Flex, Tabs } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-server';
import { productRef } from '@true-north/product-wiki';
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
      <ProductSurface id={productRef('growth.goal.view.tree')}>
        <Flex container="fixed" className={styles.sider}>
          <GoalAside />
        </Flex>
      </ProductSurface>

      <ProductSurface id={productRef('growth.goal.view.detail')}>
        <Flex container="fill" className={styles.content}>
          <GoalMain />
        </Flex>
      </ProductSurface>
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
            children: (
              <ProductSurface id={productRef('growth.goal.view.mindmap')}>
                <GoalMindMap />
              </ProductSurface>
            ),
          },
        ]}
      />
    </Flex>
  );
}
