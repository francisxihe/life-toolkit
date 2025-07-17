import { useCallback } from 'react';
import { useNodeStatusContext } from '../NodeStatusContext';

/**
 * 封装 NodeStatus 相关的操作，提供便捷的 API
 */
export const useNodeActions = () => {
  const nodeStatusContext = useNodeStatusContext();

  // 便捷方法，直接使用 context 提供的方法
  const selectNode = useCallback((nodeId: string, byClick = false, nodeInfo?: any) => {
    nodeStatusContext.setSelect(nodeId, byClick, nodeInfo);
  }, [nodeStatusContext]);

  const editNode = useCallback((nodeId: string) => {
    nodeStatusContext.setEdit(nodeId);
  }, [nodeStatusContext]);

  const clearSelection = useCallback(() => {
    nodeStatusContext.clearSelection();
  }, [nodeStatusContext]);

  const clearEdit = useCallback(() => {
    nodeStatusContext.clearEdit();
  }, [nodeStatusContext]);

  const clearAll = useCallback(() => {
    nodeStatusContext.clearAll();
  }, [nodeStatusContext]);

  const setNodeInfo = useCallback((nodeInfo: any) => {
    nodeStatusContext.setNodeInfo(nodeInfo);
  }, [nodeStatusContext]);

  return {
    nodeStatus: nodeStatusContext.nodeStatus,
    selectNode,
    editNode,
    clearSelection,
    clearEdit,
    clearAll,
    setNodeInfo,
    // 直接暴露 context 方法以保持灵活性
    setSelect: nodeStatusContext.setSelect,
    setEdit: nodeStatusContext.setEdit
  };
};