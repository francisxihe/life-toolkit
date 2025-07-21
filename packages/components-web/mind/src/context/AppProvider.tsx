/**
 * AppProvider - 应用程序上下文提供者
 * 
 * 该模块组合了所有的 Context Provider，为应用程序提供完整的状态管理功能。
 * 采用组合模式而不是单一大 Context，可以避免不必要的重渲染，提高性能。
 */
import React, { ReactNode } from 'react';
import { MindmapProvider } from './MindmapContext';
import { NodeStatusProvider } from './NodeStatusContext';
import { HistoryProvider } from './HistoryContext';
import { GlobalProvider } from './GlobalContext';
import { EditPanelProvider } from './EditPanelContext';

/**
 * AppProvider 属性类型
 */
interface AppProviderProps {
  children: ReactNode;  // 子组件
}

/**
 * AppProvider 组件
 * 
 * 组合所有的 Context Provider，按照依赖关系嵌套：
 * 1. GlobalProvider - 全局状态（最外层，因为其他 Provider 可能依赖全局状态）
 * 2. MindmapProvider - 思维导图数据
 * 3. NodeStatusProvider - 节点状态
 * 4. HistoryProvider - 历史记录（依赖思维导图数据和节点状态）
 * 5. EditPanelProvider - 编辑面板（最内层，因为它可能依赖其他所有状态）
 * 
 * 这种嵌套结构确保了各个 Provider 之间的依赖关系正确，同时也避免了不必要的重渲染。
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