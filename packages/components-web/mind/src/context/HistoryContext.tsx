/**
 * HistoryContext - 历史记录管理上下文
 * 
 * 该模块提供了思维导图操作的历史记录管理功能，包括：
 * - 添加历史记录
 * - 清除历史记录
 * - 撤销/重做操作
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { History, MindmapNode } from '../types';

/**
 * 获取默认历史记录状态
 */
const getDefaultHistory = (): History => ({
  past: [],         // 过去的状态列表
  future: [],       // 未来的状态列表（用于重做）
  cur_node: null,   // 当前操作的节点ID
  undo: [],         // 撤销操作列表
  redo: [],         // 重做操作列表
});

/**
 * HistoryContext 类型定义
 * 包含历史记录状态和操作方法
 */
interface HistoryContextType {
  history: History;                                                // 历史记录状态
  addToHistory: (mindmap: MindmapNode, curNode?: string | null) => void; // 添加历史记录
  clearHistory: () => void;                                        // 清除历史记录
  canUndo: boolean;                                                // 是否可以撤销
  canRedo: boolean;                                                // 是否可以重做
  getPreviousState: () => MindmapNode | null;                      // 获取上一个状态
}

// 创建 Context
const HistoryContext = createContext<HistoryContextType | null>(null);

/**
 * HistoryProvider 属性类型
 */
interface HistoryProviderProps {
  children: ReactNode;
  initialValue?: History;  // 可选的初始历史记录状态
}

/**
 * HistoryProvider 组件
 * 提供历史记录状态和操作方法的上下文
 */
export const HistoryProvider: React.FC<HistoryProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  // 历史记录状态
  const [history, setHistoryState] = useState<History>(
    initialValue || getDefaultHistory()
  );

  /**
   * 添加历史记录
   * @param mindmap 思维导图数据
   * @param curNode 当前操作的节点ID
   */
  const addToHistory = useCallback((mindmap: MindmapNode, curNode?: string | null) => {
    setHistoryState(prevHistory => ({
      ...prevHistory,
      past: [...prevHistory.past, JSON.stringify(mindmap)],
      cur_node: curNode || null,
      // 清空 future，因为有新的操作
      future: []
    }));
  }, []);

  /**
   * 清除历史记录
   */
  const clearHistory = useCallback(() => {
    setHistoryState({
      past: [],
      future: [],
      cur_node: null,
      undo: [],
      redo: [],
    });
  }, []);

  /**
   * 获取上一个状态
   * @returns 上一个思维导图状态，如果没有则返回 null
   */
  const getPreviousState = useCallback((): MindmapNode | null => {
    if (history.past.length === 0) return null;
    
    try {
      const previousStateStr = history.past[history.past.length - 1];
      return JSON.parse(previousStateStr) as MindmapNode;
    } catch (error) {
      console.error('Failed to parse history state:', error);
      return null;
    }
  }, [history.past]);

  // 计算是否可以撤销/重做
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // 组合所有方法和状态
  const value: HistoryContextType = {
    history,
    addToHistory,
    clearHistory,
    canUndo,
    canRedo,
    getPreviousState
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

/**
 * 使用历史记录上下文的自定义Hook
 * @returns HistoryContextType 历史记录上下文
 * @throws 如果在 HistoryProvider 外部使用则抛出错误
 */
export const useHistoryContext = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
};