import { useCallback } from 'react';
import { useMindmapContext } from '../MindmapContext';
import { useHistoryContext } from '../HistoryContext';
import { MindmapNode } from '../../types';

/**
 * 封装 Mindmap 相关的操作，提供更高级的 API，自动处理历史记录
 */
export const useMindmapActions = () => {
  const mindmapContext = useMindmapContext();
  const { addToHistory } = useHistoryContext();

  // 添加历史记录的包装函数
  const withHistory = useCallback((action: () => void, nodeId?: string) => {
    // 先保存当前状态到历史
    addToHistory(mindmapContext.mindmap, nodeId || null);
    // 执行操作
    action();
  }, [mindmapContext.mindmap, addToHistory]);

  const toggleChildren = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    withHistory(() => {
      mindmapContext.toggleChildren(nodeId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  const addChild = useCallback((nodeId: string, node: MindmapNode) => {
    withHistory(() => {
      mindmapContext.addChild(nodeId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  const addSibling = useCallback((nodeId: string, parentId: string, node: MindmapNode) => {
    withHistory(() => {
      mindmapContext.addSibling(nodeId, parentId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  const moveNode = useCallback((
    nodeId: string, 
    parentId: string, 
    targetId: string, 
    isSibling: boolean
  ) => {
    withHistory(() => {
      mindmapContext.moveNode(nodeId, parentId, targetId, isSibling);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  const changeText = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    withHistory(() => {
      mindmapContext.changeText(nodeId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  const deleteNode = useCallback((nodeId: string, parentId: string) => {
    withHistory(() => {
      mindmapContext.deleteNode(nodeId, parentId);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  const expandAll = useCallback((nodeId: string) => {
    // 展开操作不需要历史记录
    mindmapContext.expandAll(nodeId);
  }, [mindmapContext]);

  const setMindmap = useCallback((mindmap: MindmapNode) => {
    // 设置整个思维导图通常不需要历史记录（比如加载文件时）
    mindmapContext.setMindmap(mindmap);
  }, [mindmapContext]);

  return {
    mindmap: mindmapContext.mindmap,
    toggleChildren,
    addChild,
    addSibling,
    moveNode,
    changeText,
    deleteNode,
    expandAll,
    setMindmap
  };
};