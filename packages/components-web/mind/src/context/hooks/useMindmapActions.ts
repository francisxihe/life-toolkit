/**
 * useMindmapActions - 思维导图操作 Hook
 * 
 * 该 Hook 封装了思维导图相关的操作，提供更高级的 API，并自动处理历史记录。
 * 它结合了 MindmapContext 和 HistoryContext，使得思维导图的操作更加便捷。
 */
import { useCallback } from 'react';
import { useMindmapContext } from '../MindmapContext';
import { useHistoryContext } from '../HistoryContext';
import { MindmapNode } from '../../types';

/**
 * 封装 Mindmap 相关的操作，提供更高级的 API，自动处理历史记录
 * @returns 思维导图操作方法集合
 */
export const useMindmapActions = () => {
  // 获取思维导图上下文和历史记录上下文
  const mindmapContext = useMindmapContext();
  const { addToHistory } = useHistoryContext();

  /**
   * 添加历史记录的包装函数
   * 在执行操作前先保存当前状态到历史记录
   * 
   * @param action 要执行的操作函数
   * @param nodeId 操作相关的节点ID
   */
  const withHistory = useCallback((action: () => void, nodeId?: string) => {
    // 先保存当前状态到历史
    addToHistory(mindmapContext.mindmap, nodeId || null);
    // 执行操作
    action();
  }, [mindmapContext.mindmap, addToHistory]);

  /**
   * 切换节点的子节点显示/隐藏状态，并记录历史
   * 
   * @param nodeId 节点ID
   * @param node 要更新的节点属性
   */
  const toggleChildren = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    withHistory(() => {
      mindmapContext.toggleChildren(nodeId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  /**
   * 添加子节点，并记录历史
   * 
   * @param nodeId 父节点ID
   * @param node 要添加的子节点
   */
  const addChild = useCallback((nodeId: string, node: MindmapNode) => {
    withHistory(() => {
      mindmapContext.addChild(nodeId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  /**
   * 添加兄弟节点，并记录历史
   * 
   * @param nodeId 参考节点ID
   * @param parentId 父节点ID
   * @param node 要添加的兄弟节点
   */
  const addSibling = useCallback((nodeId: string, parentId: string, node: MindmapNode) => {
    withHistory(() => {
      mindmapContext.addSibling(nodeId, parentId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  /**
   * 移动节点，并记录历史
   * 
   * @param nodeId 要移动的节点ID
   * @param parentId 当前父节点ID
   * @param targetId 目标节点ID
   * @param isSibling 是否作为兄弟节点插入
   */
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

  /**
   * 修改节点文本或其他属性，并记录历史
   * 
   * @param nodeId 节点ID
   * @param node 要更新的节点属性
   */
  const changeText = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    withHistory(() => {
      mindmapContext.changeText(nodeId, node);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  /**
   * 删除节点，并记录历史
   * 
   * @param nodeId 要删除的节点ID
   * @param parentId 父节点ID
   */
  const deleteNode = useCallback((nodeId: string, parentId: string) => {
    withHistory(() => {
      mindmapContext.deleteNode(nodeId, parentId);
    }, nodeId);
  }, [mindmapContext, withHistory]);

  /**
   * 展开指定节点的所有子节点
   * 展开操作不需要历史记录，因为它不改变思维导图的结构
   * 
   * @param nodeId 节点ID
   */
  const expandAll = useCallback((nodeId: string) => {
    mindmapContext.expandAll(nodeId);
  }, [mindmapContext]);

  /**
   * 设置整个思维导图
   * 设置整个思维导图通常不需要历史记录（比如加载文件时）
   * 
   * @param mindmap 新的思维导图数据
   */
  const setMindmap = useCallback((mindmap: MindmapNode) => {
    mindmapContext.setMindmap(mindmap);
  }, [mindmapContext]);

  // 返回所有操作方法和思维导图数据
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