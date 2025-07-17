import { useCallback } from 'react';
import { useHistoryContext } from '../HistoryContext';
import { useMindmapContext } from '../MindmapContext';
import { MindmapNode } from '../../types';

/**
 * 封装 History 相关的操作，包括撤销重做功能
 */
export const useHistoryActions = () => {
  const historyContext = useHistoryContext();
  const mindmapContext = useMindmapContext();

  const addToHistory = useCallback((mindmap: MindmapNode, curNode?: string | null) => {
    historyContext.addToHistory(mindmap, curNode);
  }, [historyContext]);

  const clearHistory = useCallback(() => {
    historyContext.clearHistory();
  }, [historyContext]);

  const undo = useCallback(() => {
    const previousState = historyContext.getPreviousState();
    if (previousState) {
      mindmapContext.setMindmap(previousState);
      // 注意：这里需要更复杂的历史管理逻辑来处理 undo/redo 栈
      // 简化版本，实际使用中可能需要更完善的实现
    }
  }, [historyContext, mindmapContext]);

  return {
    history: historyContext.history,
    addToHistory,
    clearHistory,
    undo,
    canUndo: historyContext.canUndo,
    canRedo: historyContext.canRedo,
    getPreviousState: historyContext.getPreviousState
  };
};