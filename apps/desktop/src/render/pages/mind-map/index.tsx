'use client';

import React, { useEffect } from 'react';
import { Flex, Spin } from '@sue/design-web-react';
import X6MindMap from './X6MindMap';
import clsx from 'clsx';
import { GoalMindMapContextProvider, useGoalMindMapContext } from './context';

interface GoalMindMapProps {
  className?: string;
}

const GoalMindMap: React.FC<GoalMindMapProps> = ({ className }) => {
  const { loading, goalTree, fetchGoalTree } = useGoalMindMapContext();

  useEffect(() => {
    fetchGoalTree();
  }, []);

  return (
    <Spin spinning={loading} className={clsx('w-full h-full')}>
      {/* 脑图组件区域 */}
      {goalTree.length > 0 ? (
        <X6MindMap
          goalTree={goalTree}
          onNodeClick={(nodeId) => {
            console.log('节点点击:', nodeId);
          }}
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          className={clsx('w-full h-full', 'text-gray-500')}
        >
          暂无目标数据
        </Flex>
      )}
    </Spin>
  );
};

export default (props: GoalMindMapProps) => {
  return (
    <GoalMindMapContextProvider {...props}>
      <GoalMindMap {...props} />
    </GoalMindMapContextProvider>
  );
};
