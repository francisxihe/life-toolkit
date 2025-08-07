import { ReactNode } from 'react';
import { Graph } from '@antv/x6';
import { MindMapData } from '../../types';

/**
 * MindMapContext 类型定义
 * 包含思维导图数据和操作方法
 */
export interface MindMapGraphContextType {
  // 状态
  mindMapData: MindMapData | null;
  graph: Graph | null;
  selectedNodeId: string | null;
  zoom: number;
  position: { x: number; y: number };

  // 设置方法
  setMindMapData: (data: MindMapData | null) => void;
  setGraph: (graph: Graph | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setPosition: (position: { x: number; y: number }) => void;

  // 操作方法
  addChild: (nodeId: string, label: string) => void;
  addSibling: (nodeId: string, label: string) => void;
  updateNode: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  centerContent: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

/**
 * MindMapProvider 属性类型
 */
export interface MindMapGraphProviderProps {
  children: ReactNode;
  initialData?: MindMapData | null;
}