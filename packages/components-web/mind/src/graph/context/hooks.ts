import { useCallback } from 'react';
import { Graph } from '@antv/x6';
import { ENodeType, MindMapData } from '../types';
import { generateId, findNode, findParentNode, cloneMindMapData } from './utils';

/**
 * 节点操作相关的hooks
 */
export const useNodeOperations = (
  mindMapData: MindMapData | null,
  setMindMapData: (data: MindMapData | null | ((prevData: MindMapData | null) => MindMapData | null)) => void
) => {
  /**
   * 添加子节点
   */
  const addChild = useCallback(
    (nodeId: string, label: string) => {
      if (!mindMapData) return;

      setMindMapData(prevData => {
        if (!prevData) return prevData;

        const newData = cloneMindMapData(prevData);
        const node = findNode(newData, nodeId);

        if (node) {
          const childType = node.type === ENodeType.topic ? ENodeType.topicBranch : ENodeType.topicChild;
          const newNode: MindMapData = {
            id: generateId(),
            label,
            type: childType,
            width: childType === ENodeType.topicBranch ? 120 : 80,
            height: childType === ENodeType.topicBranch ? 40 : 30,
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
    [mindMapData, setMindMapData]
  );

  /**
   * 添加兄弟节点
   */
  const addSibling = useCallback(
    (nodeId: string, label: string) => {
      if (!mindMapData || nodeId === mindMapData.id) return; // 不能给根节点添加兄弟

      setMindMapData(prevData => {
        if (!prevData) return prevData;

        const newData = cloneMindMapData(prevData);
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

          const index = parentNode.children?.findIndex(child => child.id === nodeId) || 0;
          parentNode.children?.splice(index + 1, 0, newNode);
        }

        return newData;
      });
    },
    [mindMapData, setMindMapData]
  );

  /**
   * 更新节点
   */
  const updateNode = useCallback(
    (nodeId: string, label: string) => {
      if (!mindMapData) return;

      setMindMapData(prevData => {
        if (!prevData) return prevData;

        const newData = cloneMindMapData(prevData);
        const node = findNode(newData, nodeId);

        if (node) {
          node.label = label;
        }

        return newData;
      });
    },
    [mindMapData, setMindMapData]
  );

  /**
   * 删除节点
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      if (!mindMapData || nodeId === mindMapData.id) return; // 不能删除根节点

      setMindMapData(prevData => {
        if (!prevData) return prevData;

        const newData = cloneMindMapData(prevData);
        const parentNode = findParentNode(newData, nodeId);

        if (parentNode && parentNode.children) {
          const index = parentNode.children.findIndex(child => child.id === nodeId);
          if (index !== -1) {
            parentNode.children.splice(index, 1);
          }
        }

        return newData;
      });
    },
    [mindMapData, setMindMapData]
  );

  return {
    addChild,
    addSibling,
    updateNode,
    deleteNode,
  };
};

/**
 * 图形操作相关的hooks
 */
export const useGraphOperations = (
  graph: Graph | null,
  zoom: number,
  setZoom: (zoom: number) => void
) => {
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
  }, [zoom, graph, setZoom]);

  /**
   * 缩小
   */
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);

    if (graph) {
      graph.zoom(newZoom);
    }
  }, [zoom, graph, setZoom]);

  return {
    centerContent,
    zoomIn,
    zoomOut,
  };
};