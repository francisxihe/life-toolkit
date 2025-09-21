import React, { createContext, useContext, useState, useCallback } from 'react';
import { TabsProps } from './';

export interface TabItem {
  id: string;
  children: React.ReactElement;
  element: HTMLElement;
}

export interface TabsState {
  activeKey: string;
  data: TabItem[];
  onTabClick?: TabsProps['onTabClick'];
  onTabDrop?: TabsProps['onTabDrop'];
}

interface TabsContextValue {
  state: TabsState;
  setActiveKey: (key: string) => void;
  setData: (data: TabItem[]) => void;
  addTab: (tab: TabItem) => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, tab: Partial<TabItem>) => void;
}

const initialState: TabsState = {
  activeKey: '',
  data: [],
};

const TabsContext = createContext<TabsContextValue | null>(null);

export const TabsProvider: React.FC<React.PropsWithChildren<{ init?: Partial<TabsState> }>> = ({ children, init }) => {
  const [state, setState] = useState<TabsState>({
    ...initialState,
    ...init,
  });

  const setActiveKey = useCallback((key: string) => {
    setState((prev) => ({ ...prev, activeKey: key }));
  }, []);

  const setData = useCallback((data: TabItem[]) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const addTab = useCallback((tab: TabItem) => {
    setState((prev) => ({
      ...prev,
      data: [...prev.data, tab],
    }));
  }, []);

  const removeTab = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.filter((item) => item.id !== id),
      activeKey: prev.activeKey === id ? '' : prev.activeKey,
    }));
  }, []);

  const updateTab = useCallback((id: string, tab: Partial<TabItem>) => {
    setState((prev) => ({
      ...prev,
      data: prev.data.map((item) => (item.id === id ? { ...item, ...tab } : item)),
    }));
  }, []);

  const value = {
    state,
    setActiveKey,
    setData,
    addTab,
    removeTab,
    updateTab,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};
