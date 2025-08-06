import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Graph } from '@antv/x6';
import { MindMapData } from '../types';
import { MindMapContextType, MindMapProviderProps } from './types';
import { useNodeOperations, useGraphOperations } from './hooks';

// 创建 Context
const MindMapContext = createContext<MindMapContextType | null>(null);

/**
 * MindMapProvider 组件
 * 提供思维导图数据和操作方法的上下文
 */
export const MindMapProvider: React.FC<MindMapProviderProps> = ({
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

  const graphRef = useRef<HTMLDivElement>(null);

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
  const value: MindMapContextType = {
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
    graphRef,
  };

  return <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>;
};

/**
 * 使用思维导图上下文的自定义Hook
 */
export const useMindMap = (): MindMapContextType => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
};
