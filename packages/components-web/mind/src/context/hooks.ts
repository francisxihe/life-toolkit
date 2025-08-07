import { useCallback } from 'react';
import { Graph } from '@antv/x6';
import { ENodeType, MindMapData } from '../types';
import { generateId, findNode, findParentNode, cloneMindMapData } from './utils';

interface UseNodeOperationsParams {
  mindMapData: MindMapData | null;
  setMindMapData: (
    data: MindMapData | null | ((prevData: MindMapData | null) => MindMapData | null)
  ) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  onChange?: (data: MindMapData | null) => void;
}

/**
 * 节点操作相关的hooks
 */
export const useNodeOperations = ({
  mindMapData,
  setMindMapData,
  selectedNodeId,
  setSelectedNodeId,
  onChange,
}: UseNodeOperationsParams) => {
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
          const childType =
            node.type === ENodeType.topic ? ENodeType.topicBranch : ENodeType.topicChild;
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

        onChange?.(newData);
        return newData;
      });
    },
    [mindMapData, setMindMapData, onChange]
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

        onChange?.(newData);
        return newData;
      });
    },
    [mindMapData, setMindMapData, onChange]
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

        onChange?.(newData);
        return newData;
      });
    },
    [mindMapData, setMindMapData, onChange]
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

        onChange?.(newData);
        return newData;
      });
    },
    [mindMapData, setMindMapData, onChange]
  );

  return {
    addChild,
    addSibling,
    updateNode,
    deleteNode,
  };
};
