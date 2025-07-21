/**
 * EditPanelContext - 编辑面板管理上下文
 * 
 * 该模块提供了编辑面板的状态管理功能，包括：
 * - 显示/隐藏面板
 * - 切换面板类型
 * - 更新面板数据
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EditPanel } from '../types';

/**
 * 获取默认编辑面板状态
 */
const getDefaultEditPanel = (): EditPanel => ({
  isShow: false,  // 是否显示面板
  type: '',       // 面板类型
  data: null,     // 面板数据
});

/**
 * EditPanelContext 类型定义
 * 包含编辑面板状态和操作方法
 */
interface EditPanelContextType {
  editPanel: EditPanel;                          // 编辑面板状态
  showPanel: (type: string, data?: any) => void; // 显示面板
  hidePanel: () => void;                         // 隐藏面板
  togglePanel: (type: string, data?: any) => void; // 切换面板显示状态
  updatePanelData: (data: any) => void;          // 更新面板数据
}

// 创建 Context
const EditPanelContext = createContext<EditPanelContextType | null>(null);

/**
 * EditPanelProvider 属性类型
 */
interface EditPanelProviderProps {
  children: ReactNode;
  initialValue?: EditPanel;  // 可选的初始编辑面板状态
}

/**
 * EditPanelProvider 组件
 * 提供编辑面板状态和操作方法的上下文
 */
export const EditPanelProvider: React.FC<EditPanelProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  // 编辑面板状态
  const [editPanel, setEditPanelState] = useState<EditPanel>(
    initialValue || getDefaultEditPanel()
  );

  /**
   * 显示面板
   * @param type 面板类型
   * @param data 可选的面板数据
   */
  const showPanel = useCallback((type: string, data?: any) => {
    setEditPanelState({
      isShow: true,
      type,
      data: data || null
    });
  }, []);

  /**
   * 隐藏面板
   */
  const hidePanel = useCallback(() => {
    setEditPanelState(prev => ({
      ...prev,
      isShow: false
    }));
  }, []);

  /**
   * 切换面板显示状态
   * @param type 面板类型
   * @param data 可选的面板数据
   */
  const togglePanel = useCallback((type: string, data?: any) => {
    setEditPanelState(prev => {
      // 如果当前面板已显示且类型相同，则隐藏面板
      if (prev.isShow && prev.type === type) {
        return {
          ...prev,
          isShow: false
        };
      }
      // 否则显示指定类型的面板
      return {
        isShow: true,
        type,
        data: data || null
      };
    });
  }, []);

  /**
   * 更新面板数据
   * @param data 新的面板数据
   */
  const updatePanelData = useCallback((data: any) => {
    setEditPanelState(prev => ({
      ...prev,
      data
    }));
  }, []);

  // 组合所有方法和状态
  const value: EditPanelContextType = {
    editPanel,
    showPanel,
    hidePanel,
    togglePanel,
    updatePanelData
  };

  return (
    <EditPanelContext.Provider value={value}>
      {children}
    </EditPanelContext.Provider>
  );
};

/**
 * 使用编辑面板上下文的自定义Hook
 * @returns EditPanelContextType 编辑面板上下文
 * @throws 如果在 EditPanelProvider 外部使用则抛出错误
 */
export const useEditPanelContext = (): EditPanelContextType => {
  const context = useContext(EditPanelContext);
  if (!context) {
    throw new Error('useEditPanelContext must be used within a EditPanelProvider');
  }
  return context;
};