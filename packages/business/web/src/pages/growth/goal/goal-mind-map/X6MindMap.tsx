import React, { useState, useEffect, useRef } from 'react';
import { GoalVo } from '@life-toolkit/vo';
import {
  MindMap,
  createGoalConverter,
  exportUtils,
  MindMapData,
} from '@life-toolkit/components-web-mind/src/index';
import {
  Button,
  Space,
  Tooltip,
  Message,
  Switch,
} from '@arco-design/web-react';
import MindMapNode from './MindMapNode';
import { useGoalMindMapContext } from './context';

interface X6MindMapProps {
  goalTree: GoalVo[];
  onNodeClick?: (nodeId: string) => void;
  showToolbar?: boolean;
}

const X6MindMap: React.FC<X6MindMapProps> = ({
  goalTree,
  onNodeClick,
  showToolbar = true,
}) => {
  const { fetchGoalTree } = useGoalMindMapContext();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
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
      containerRef.current.style.height = '100%';
      initializedRef.current = true;
    }
  }, []);

  // 保存图形实例的引用
  const handleGraphInstance = (graph: any) => {
    graphRef.current = graph;
  };

  // 处理全屏
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 处理导出
  const handleExport = () => {
    if (graphRef.current) {
      exportUtils.exportToPNG(graphRef.current, 'goal-mind-map');
      Message.success('已导出PNG图片');
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: '600px', minWidth: '300px', overflow: 'hidden' }}
    >
      {/* 思维导图内容 */}
      {mindMapData ? (
        <MindMap
          data={mindMapData}
          options={{
            editable: false,
            enableShortcuts: true,
            centerOnResize: true,
            hGap: 50,
            vGap: 25,
          }}
          showToolbar={showToolbar}
          onGraphReady={handleGraphInstance}
          MindMapNode={(props: any) => {
            return <MindMapNode {...props} fetchGoalTree={fetchGoalTree} />;
          }}
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
