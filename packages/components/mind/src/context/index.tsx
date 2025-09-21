import React, { useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react';
import { MindMapData } from '../types';
import { useNodeOperations } from './hooks';
import { createInjectState } from '@life-toolkit/common-web-utils';

// 创建 Context

export const [MindMapProvider, useMindMapContext] = createInjectState<{
  PropsType: {
    children: ReactNode;
    initialData?: MindMapData | null;
    onChange?: (data: MindMapData | null) => void;
  };
  ContextType: {
    containerRef: React.RefObject<HTMLDivElement>;
    // 数据状态
    mindMapData: MindMapData | null;
    selectedNodeId: string | null;

    // 数据操作方法
    setMindMapData: Dispatch<SetStateAction<MindMapData | null>>;
    setSelectedNodeId: Dispatch<SetStateAction<string | null>>;

    minimapVisible: boolean;
    setMinimapVisible: Dispatch<SetStateAction<boolean>>;

    // 节点操作方法
    addChild: (nodeId: string, label: string) => void;
    addSibling: (nodeId: string, label: string) => void;
    updateNode: (nodeId: string, label: string) => void;
    deleteNode: (nodeId: string) => void;
  };
}>(({ children, initialData, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(initialData || null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [minimapVisible, setMinimapVisible] = useState(false);

  // 初始化数据
  useEffect(() => {
    console.log('Setting initial data in provider:', initialData);
    setMindMapData(initialData);
  }, [initialData]);

  // 使用自定义 hooks
  const nodeOperations = useNodeOperations({
    mindMapData,
    setMindMapData,
    selectedNodeId,
    setSelectedNodeId,
    onChange,
  });

  return {
    containerRef,
    mindMapData,
    selectedNodeId,
    setMindMapData,
    setSelectedNodeId,
    minimapVisible,
    setMinimapVisible,
    ...nodeOperations,
  };
});
