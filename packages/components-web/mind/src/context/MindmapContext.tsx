import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { Graph } from '@antv/x6';
import { MindMapData } from '../types';

/**
 * MindMapContext 类型定义
 * 包含思维导图数据和操作方法
 */
interface MindMapContextType {
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

// 创建 Context
const MindMapContext = createContext<MindMapContextType | null>(null);

/**
 * MindMapProvider 属性类型
 */
interface MindMapProviderProps {
  children: ReactNode;
  initialData?: MindMapData | null;
}

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * 寻找节点的辅助函数
 */
const findNode = (data: MindMapData, nodeId: string): MindMapData | null => {
  if (data.id === nodeId) {
    return data;
  }

  if (data.children) {
    for (const child of data.children) {
      const found = findNode(child, nodeId);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

/**
 * 寻找父节点的辅助函数
 */
const findParentNode = (
  data: MindMapData,
  nodeId: string,
): MindMapData | null => {
  if (data.children) {
    for (const child of data.children) {
      if (child.id === nodeId) {
        return data;
      }
      const found = findParentNode(child, nodeId);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

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
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // 初始化数据
  useEffect(() => {
    console.log('Setting initial data in provider:', initialData);
    setMindMapData(initialData);
  }, [initialData]);

  /**
   * 添加子节点
   */
  const addChild = useCallback(
    (nodeId: string, label: string) => {
      if (!mindMapData) return;

      setMindMapData((prevData) => {
        if (!prevData) return prevData;

        const newData = JSON.parse(JSON.stringify(prevData));
        const node = findNode(newData, nodeId);

        if (node) {
          const childType =
            node.type === 'topic' ? 'topic-branch' : 'topic-child';
          const newNode: MindMapData = {
            id: generateId(),
            label,
            type: childType,
            width: childType === 'topic-branch' ? 120 : 80,
            height: childType === 'topic-branch' ? 40 : 30,
            children: [],
          };

          if (!node.children) {
            node.children = [];
          }

          node.children.push(newNode);
        }

        return newData;
      });
    },
    [mindMapData],
  );

  /**
   * 添加兄弟节点
   */
  const addSibling = useCallback(
    (nodeId: string, label: string) => {
      if (!mindMapData || nodeId === mindMapData.id) return; // 不能给根节点添加兄弟

      setMindMapData((prevData) => {
        if (!prevData) return prevData;

        const newData = JSON.parse(JSON.stringify(prevData));
        const parentNode = findParentNode(newData, nodeId);
        const node = findNode(newData, nodeId);

        if (parentNode && node) {
          const newNode: MindMapData = {
            id: generateId(),
            label,
            type: node.type,
            width: node.width,
            height: node.height,
            children: [],
          };

          const index =
            parentNode.children?.findIndex((child) => child.id === nodeId) || 0;
          parentNode.children?.splice(index + 1, 0, newNode);
        }

        return newData;
      });
    },
    [mindMapData],
  );

  /**
   * 更新节点
   */
  const updateNode = useCallback(
    (nodeId: string, label: string) => {
      if (!mindMapData) return;

      setMindMapData((prevData) => {
        if (!prevData) return prevData;

        const newData = JSON.parse(JSON.stringify(prevData));
        const node = findNode(newData, nodeId);

        if (node) {
          node.label = label;
        }

        return newData;
      });
    },
    [mindMapData],
  );

  /**
   * 删除节点
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      if (!mindMapData || nodeId === mindMapData.id) return; // 不能删除根节点

      setMindMapData((prevData) => {
        if (!prevData) return prevData;

        const newData = JSON.parse(JSON.stringify(prevData));
        const parentNode = findParentNode(newData, nodeId);

        if (parentNode && parentNode.children) {
          const index = parentNode.children.findIndex(
            (child) => child.id === nodeId,
          );
          if (index !== -1) {
            parentNode.children.splice(index, 1);
          }
        }

        return newData;
      });
    },
    [mindMapData],
  );

  /**
   * 居中内容
   */
  const centerContent = useCallback(() => {
    if (graph) {
      graph.centerContent();
    }
  }, [graph]);

  /**
   * 放大
   */
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoom(newZoom);

    if (graph) {
      graph.zoom(newZoom);
    }
  }, [zoom, graph]);

  /**
   * 缩小
   */
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);

    if (graph) {
      graph.zoom(newZoom);
    }
  }, [zoom, graph]);

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
  };

  return (
    <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>
  );
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
