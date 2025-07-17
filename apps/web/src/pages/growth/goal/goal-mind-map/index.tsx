'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Message, Spin, Space } from '@arco-design/web-react';
import { IconRefresh, IconFullscreen } from '@arco-design/web-react/icon';
import { GoalVo, GoalStatus } from '@life-toolkit/vo/growth';
import { GoalService } from '../../service';
// import '@life-toolkit/components-web-mind/src/index.css';
import { Provider, ThemeProvider } from '@life-toolkit/components-web-mind';
import CustomMain from './CustomMain';

interface GoalMindMapProps {
  className?: string;
}

// 适配 GoalVo[] 为 mindmap 结构
function goalTreeToMindmap(goals: GoalVo[]): any {
  if (!goals || goals.length === 0) {
    return {
      id: 'root',
      text: '暂无目标数据',
      showChildren: true,
      children: [],
    };
  }

  // 如果只有一个根节点，直接转换
  if (goals.length === 1) {
    return convert(goals[0]);
  }

  // 如果有多个根节点，创建一个虚拟根节点
  return {
    id: 'virtual-root',
    text: '我的目标',
    showChildren: true,
    children: goals.map(convert),
    style: {
      color: '#000',
      backgroundColor: '#f0f2f5',
    },
  };

  function convert(node: GoalVo): any {
    return {
      id: node.id?.toString() || `goal-${Date.now()}`,
      text: node.name || '未命名目标',
      showChildren: true,
      children: (node.children || []).map(convert),
      style: {
        color: '#000',
        backgroundColor: '#f0f2f5',
        marginLeft: '40px',
      },
      info: {
        description: node.description,
        status: node.status,
        importance: node.importance,
        startAt: node.startAt,
        endAt: node.endAt,
        type: node.type,
      },
    };
  }
}

const GoalMindMap: React.FC<GoalMindMapProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [goalTree, setGoalTree] = useState<GoalVo[]>([]);
  const [mindmapData, setMindmapData] = useState<any>(null);

  // 获取目标树数据
  const fetchGoalTree = async () => {
    setLoading(true);
    try {
      const data = await GoalService.getGoalTree({
        status: GoalStatus.TODO,
      });
      setGoalTree(data);

      // 适配为 mindmap 数据格式
      const adaptedData = goalTreeToMindmap(data);
      setMindmapData(adaptedData);

      // 同时更新 localStorage 以便后续使用
      localStorage.setItem('mindmap', JSON.stringify(adaptedData));

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
      className={className}
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
      <Spin loading={loading}>
        {/* 脑图组件区域 */}
        <div style={{ minHeight: 600 }}>
          <Provider>
            <ThemeProvider>
              <CustomMain mindmapData={mindmapData} />
            </ThemeProvider>
          </Provider>
        </div>
      </Spin>
    </Card>
  );
};

export default GoalMindMap;
