/**
 * useHistoryActions - 历史记录操作 Hook
 * 
 * 该 Hook 封装了历史记录相关的操作，提供撤销/重做功能。
 * 它结合了 HistoryContext 和 MindmapContext，使得历史记录的管理更加便捷。
 */
import { useCallback } from 'react';
import { useHistoryContext } from '../HistoryContext';
import { useMindmapContext } from '../MindmapContext';
import { MindmapNode } from '../../types';

/**
 * 封装 History 相关的操作，包括撤销重做功能
 * @returns 历史记录操作方法集合
 */
export const useHistoryActions = () => {
  // 获取历史记录上下文和思维导图上下文
  const historyContext = useHistoryContext();
  const mindmapContext = useMindmapContext();

  /**
   * 添加当前状态到历史记录
   * 
   * @param mindmap 思维导图数据
   * @param curNode 当前操作的节点ID
   */
  const addToHistory = useCallback((mindmap: MindmapNode, curNode?: string | null) => {
    historyContext.addToHistory(mindmap, curNode);
  }, [historyContext]);

  /**
   * 清除所有历史记录
   */
  const clearHistory = useCallback(() => {
    historyContext.clearHistory();
  }, [historyContext]);

  /**
   * 撤销操作
   * 恢复到上一个历史状态
   * 
   * 注意：这是一个简化版本的实现，完整的撤销/重做功能需要更复杂的历史管理逻辑
   */
  const undo = useCallback(() => {
    // 获取上一个状态
    const previousState = historyContext.getPreviousState();
    if (previousState) {
      // 恢复到上一个状态
      mindmapContext.setMindmap(previousState);
      
      // 注意：这里需要更复杂的历史管理逻辑来处理 undo/redo 栈
      // 例如：
      // 1. 从 past 中移除最后一个状态
      // 2. 将当前状态添加到 future 中
      // 3. 更新 cur_node
      // 简化版本，实际使用中可能需要更完善的实现
    }
  }, [historyContext, mindmapContext]);

  // 返回所有操作方法和历史记录状态
  return {
    // 当前历史记录状态
    history: historyContext.history,
    
    // 操作方法
    addToHistory,
    clearHistory,
    undo,
    
    // 状态标志
    canUndo: historyContext.canUndo,
    canRedo: historyContext.canRedo,
    
    // 工具方法
    getPreviousState: historyContext.getPreviousState
  };
};