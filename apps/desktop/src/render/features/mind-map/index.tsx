'use client';

import React, { useEffect } from 'react';
import { Flex, Spin } from '@sue/design-web-react';
import clsx from 'clsx';
import X6MindMap from './X6MindMap';
import { GoalMindMapContextProvider, useGoalMindMapContext } from './context';
import styles from './style.module.less';

interface GoalMindMapProps {
  className?: string;
  'data-product-ref'?: string;
}

const GoalMindMap: React.FC<GoalMindMapProps> = ({ className, 'data-product-ref': productRefAttr }) => {
  const { loading, goalTree, fetchGoalTree } = useGoalMindMapContext();

  useEffect(() => {
    fetchGoalTree();
  }, []);

  return (
    <div className={clsx(styles.root, className)} data-product-ref={productRefAttr}>
      <Spin
        spinning={loading}
        className={styles.spin}
        rootClassName={styles.spin}
        classNames={{ root: styles.spin, container: styles.spin }}
      >
        {goalTree.length > 0 ? (
          <X6MindMap goalTree={goalTree} />
        ) : (
          <Flex align="center" justify="center" className={styles.empty}>
            暂无目标数据
          </Flex>
        )}
      </Spin>
    </div>
  );
};

export default ({ className, 'data-product-ref': productRefAttr }: GoalMindMapProps) => {
  return (
    <GoalMindMapContextProvider>
      <GoalMindMap className={className} data-product-ref={productRefAttr} />
    </GoalMindMapContextProvider>
  );
};
