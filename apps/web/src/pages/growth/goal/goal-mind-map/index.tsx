'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Message, Spin, Space } from '@arco-design/web-react';
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
    <Spin loading={loading} className={clsx('w-full h-full')}>
      {/* 脑图组件区域 */}
      {goalTree.length > 0 ? (
        <X6MindMap
          goalTree={goalTree}
          onNodeClick={(nodeId) => {
            console.log('节点点击:', nodeId);
          }}
        />
      ) : (
        <div
          className={clsx(
            'w-full h-full',
            'flex items-center justify-center text-gray-500',
          )}
        >
          暂无目标数据
        </div>
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
