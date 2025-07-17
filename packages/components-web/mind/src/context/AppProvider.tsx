import React, { ReactNode } from 'react';
import { MindmapProvider } from './MindmapContext';
import { NodeStatusProvider } from './NodeStatusContext';
import { HistoryProvider } from './HistoryContext';
import { GlobalProvider } from './GlobalContext';
import { EditPanelProvider } from './EditPanelContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * 组合所有的 Context Provider
 * 使用组合模式而不是单一大 Context，避免不必要的重渲染
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <MindmapProvider>
        <NodeStatusProvider>
          <HistoryProvider>
            <EditPanelProvider>
              {children}
            </EditPanelProvider>
          </HistoryProvider>
        </NodeStatusProvider>
      </MindmapProvider>
    </GlobalProvider>
  );
};

export default AppProvider;