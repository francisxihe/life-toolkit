import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { History, MindmapNode } from '../types';

const getDefaultHistory = (): History => ({
  past: [],
  future: [],
  cur_node: null,
  undo: [],
  redo: [],
});

interface HistoryContextType {
  history: History;
  addToHistory: (mindmap: MindmapNode, curNode?: string | null) => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getPreviousState: () => MindmapNode | null;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

interface HistoryProviderProps {
  children: ReactNode;
  initialValue?: History;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  const [history, setHistoryState] = useState<History>(
    initialValue || getDefaultHistory()
  );

  const addToHistory = useCallback((mindmap: MindmapNode, curNode?: string | null) => {
    setHistoryState(prevHistory => ({
      ...prevHistory,
      past: [...prevHistory.past, JSON.stringify(mindmap)],
      cur_node: curNode || null,
      // 清空 future，因为有新的操作
      future: []
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryState({
      past: [],
      future: [],
      cur_node: null,
      undo: [],
      redo: [],
    });
  }, []);

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

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

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

export const useHistoryContext = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
};