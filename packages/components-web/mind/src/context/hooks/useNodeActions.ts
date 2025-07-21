/**
 * useNodeActions - 节点操作 Hook
 * 
 * 该 Hook 封装了节点状态相关的操作，提供更便捷的 API。
 * 它基于 NodeStatusContext，为节点的选择、编辑等操作提供了更友好的接口。
 */
import { useCallback } from 'react';
import { useNodeStatusContext } from '../NodeStatusContext';

/**
 * 封装 NodeStatus 相关的操作，提供便捷的 API
 * @returns 节点操作方法集合
 */
export const useNodeActions = () => {
  // 获取节点状态上下文
  const nodeStatusContext = useNodeStatusContext();

  /**
   * 选择节点
   * 
   * @param nodeId 要选择的节点ID
   * @param byClick 是否通过点击选择
   * @param nodeInfo 可选的节点信息
   */
  const selectNode = useCallback((nodeId: string, byClick = false, nodeInfo?: any) => {
    nodeStatusContext.setSelect(nodeId, byClick, nodeInfo);
  }, [nodeStatusContext]);

  /**
   * 设置节点为编辑状态
   * 
   * @param nodeId 要编辑的节点ID
   */
  const editNode = useCallback((nodeId: string) => {
    nodeStatusContext.setEdit(nodeId);
  }, [nodeStatusContext]);

  /**
   * 清除节点选择状态
   */
  const clearSelection = useCallback(() => {
    nodeStatusContext.clearSelection();
  }, [nodeStatusContext]);

  /**
   * 清除节点编辑状态
   */
  const clearEdit = useCallback(() => {
    nodeStatusContext.clearEdit();
  }, [nodeStatusContext]);

  /**
   * 清除所有节点状态
   * 包括选择状态、编辑状态和节点信息
   */
  const clearAll = useCallback(() => {
    nodeStatusContext.clearAll();
  }, [nodeStatusContext]);

  /**
   * 设置当前节点的附加信息
   * 
   * @param nodeInfo 节点信息
   */
  const setNodeInfo = useCallback((nodeInfo: any) => {
    nodeStatusContext.setNodeInfo(nodeInfo);
  }, [nodeStatusContext]);

  // 返回所有操作方法和节点状态
  return {
    // 当前节点状态
    nodeStatus: nodeStatusContext.nodeStatus,
    
    // 便捷方法
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