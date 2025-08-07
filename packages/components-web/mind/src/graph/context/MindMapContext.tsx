import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Graph } from '@antv/x6';
import { MindMapData } from '../../types';
import { MindMapGraphContextType, MindMapGraphProviderProps } from './types';
import { useNodeOperations, useGraphOperations } from './hooks';

// 创建 Context
const MindMapGraphContext = createContext<MindMapGraphContextType | null>(null);

/**
 * MindMapProvider 组件
 * 提供思维导图数据和操作方法的上下文
 */
export const MindMapGraphProvider: React.FC<MindMapGraphProviderProps> = ({
  children,
  initialData = null,
}) => {
  // 状态
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.8);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // 初始化数据
  useEffect(() => {
    console.log('Setting initial data in provider:', initialData);
    setMindMapData(initialData);
  }, [initialData]);

  // 使用节点操作hooks
  const { addChild, addSibling, updateNode, deleteNode } = useNodeOperations(
    mindMapData,
    setMindMapData
  );

  // 使用图形操作hooks
  const { centerContent, zoomIn, zoomOut } = useGraphOperations(
    graph,
    zoom,
    setZoom
  );

  // 组合所有方法和状态
  const value: MindMapGraphContextType = {
    mindMapData,
    graph,
    selectedNodeId,
    zoom,
    position,
    setMindMapData,
    setGraph,
    setSelectedNodeId,
    setZoom,
    setPosition,
    addChild,
    addSibling,
    updateNode,
    deleteNode,
    centerContent,
    zoomIn,
    zoomOut,
  };

  return <MindMapGraphContext.Provider value={value}>{children}</MindMapGraphContext.Provider>;
};

/**
 * 使用思维导图上下文的自定义Hook
 */
export const useMindMapGraphContext = (): MindMapGraphContextType => {
  const context = useContext(MindMapGraphContext);
  if (!context) {
    throw new Error('useMindMapGraphContext must be used within a MindMapGraphProvider');
  }
  return context;
};
