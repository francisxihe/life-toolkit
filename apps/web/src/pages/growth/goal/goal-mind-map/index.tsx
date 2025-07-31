'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Message, Spin, Space } from '@arco-design/web-react';
import { IconRefresh, IconFullscreen } from '@arco-design/web-react/icon';
import { GoalVo, GoalStatus } from '@life-toolkit/vo/growth';
import { GoalService } from '../../service';
import X6MindMap from './X6MindMap';
import clsx from 'clsx';

interface GoalMindMapProps {
  className?: string;
}

const GoalMindMap: React.FC<GoalMindMapProps> = ({ className }) => {
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

  useEffect(() => {
    fetchGoalTree();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => {
    fetchGoalTree();
  };

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  return (
    <Card
      className={clsx(className, 'w-full h-full')}
      title={<span>目标脑图</span>}
      extra={
        <Space>
          <Button
            icon={<IconRefresh />}
            onClick={handleRefresh}
            loading={loading}
          />
          <Button icon={<IconFullscreen />} onClick={handleFullscreen} />
        </Space>
      }
      style={{ minHeight: 600 }}
    >
      <Spin loading={loading} className={clsx('w-full h-full')}>
        {/* 脑图组件区域 */}
        <div className="w-full h-full">
          {goalTree.length > 0 ? (
            <X6MindMap
              goalTree={goalTree}
              onNodeClick={(nodeId) => {
                console.log('节点点击:', nodeId);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              暂无目标数据
            </div>
          )}
        </div>
      </Spin>
    </Card>
  );
};

export default GoalMindMap;
