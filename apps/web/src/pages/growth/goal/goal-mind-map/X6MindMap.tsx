import React, { useState, useEffect, useRef } from 'react';
import { GoalVo } from '@life-toolkit/vo/growth';
import { openDrawer } from '@/layout/Drawer';
import GoalEditor from '../../components/GoalDetail/GoalEditor';
import { EnhancedMindMap, createGoalConverter } from '@life-toolkit/components-web-mind';

interface X6MindMapProps {
  goalTree: GoalVo[];
  onNodeClick?: (nodeId: string) => void;
}

const X6MindMap: React.FC<X6MindMapProps> = ({ goalTree, onNodeClick }) => {
  const [mindMapData, setMindMapData] = useState(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef<boolean>(false);

  // 当goalTree变化时转换数据
  useEffect(() => {
    if (goalTree && goalTree.length > 0) {
      const converter = createGoalConverter();
      const data = converter.convert(goalTree);
      console.log('Converted mind map data:', data); // 调试日志
      setMindMapData(data);
    } else {
      setMindMapData(null);
    }
  }, [goalTree]);

  // 防止缩放问题，只初始化一次尺寸
  useEffect(() => {
    if (!initializedRef.current && containerRef.current) {
      // 设置固定尺寸
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '600px';
      initializedRef.current = true;
    }
  }, []);

  // 处理节点点击
  const handleNodeClick = (nodeId: string) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }

    // 打开目标编辑器
    openDrawer({
      title: '编辑目标',
      width: 800,
      content: (props) => {
        return <GoalEditor goalId={nodeId} onClose={props.onClose} />;
      },
    });
  };

  return (
    <div 
      ref={containerRef}
      className="w-full border border-gray-200 rounded-lg bg-white"
      style={{ minHeight: '600px', minWidth: '300px', overflow: 'hidden' }}
    >
      {mindMapData ? (
        <EnhancedMindMap
          data={mindMapData}
          onNodeClick={handleNodeClick}
          options={{
            editable: false,
            enableShortcuts: true,
            centerOnResize: true,
            hGap: 50,
            vGap: 25,
          }}
          showToolbar={false}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          暂无目标数据
        </div>
      )}
    </div>
  );
};

export default X6MindMap;
