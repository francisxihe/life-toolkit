/**
 * NodeStatusContext - 节点状态管理上下文
 * 
 * 该模块提供了节点状态的管理功能，包括：
 * - 节点的选中状态
 * - 节点的编辑状态
 * - 节点的附加信息
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NodeStatus } from '../types';

/**
 * 获取默认节点状态
 */
const getDefaultNodeStatus = (): NodeStatus => ({
  cur_select: '',           // 当前选中的节点ID
  cur_edit: '',             // 当前编辑的节点ID
  select_by_click: false,   // 是否通过点击选中
  cur_node_info: {},        // 当前节点的附加信息
});

/**
 * NodeStatusContext 类型定义
 * 包含节点状态和操作方法
 */
interface NodeStatusContextType {
  nodeStatus: NodeStatus;                                         // 节点状态
  setSelect: (nodeId: string, byClick?: boolean, nodeInfo?: any) => void; // 设置选中节点
  setEdit: (nodeId: string) => void;                              // 设置编辑节点
  clearSelection: () => void;                                     // 清除选中状态
  clearEdit: () => void;                                          // 清除编辑状态
  clearAll: () => void;                                           // 清除所有状态
  setNodeInfo: (nodeInfo: any) => void;                           // 设置节点信息
}

// 创建 Context
const NodeStatusContext = createContext<NodeStatusContextType | null>(null);

/**
 * NodeStatusProvider 属性类型
 */
interface NodeStatusProviderProps {
  children: ReactNode;
  initialValue?: NodeStatus;  // 可选的初始节点状态
}

/**
 * NodeStatusProvider 组件
 * 提供节点状态和操作方法的上下文
 */
export const NodeStatusProvider: React.FC<NodeStatusProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  // 节点状态
  const [nodeStatus, setNodeStatusState] = useState<NodeStatus>(
    initialValue || getDefaultNodeStatus()
  );

  /**
   * 设置选中节点
   * @param nodeId 节点ID
   * @param byClick 是否通过点击选中
   * @param nodeInfo 可选的节点信息
   */
  const setSelect = useCallback((nodeId: string, byClick = false, nodeInfo?: any) => {
    setNodeStatusState(prevStatus => {
      // 避免 cur_select 未变更时 info 被清空
      if (prevStatus.cur_select === nodeId && nodeInfo === undefined) {
        return {
          ...prevStatus,
          cur_select: nodeId,
          select_by_click: byClick
        };
      }
      
      return {
        ...prevStatus,
        cur_select: nodeId,
        select_by_click: byClick,
        cur_node_info: nodeInfo !== undefined ? nodeInfo : prevStatus.cur_node_info
      };
    });
  }, []);

  /**
   * 设置编辑节点
   * @param nodeId 节点ID
   */
  const setEdit = useCallback((nodeId: string) => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_edit: nodeId
    }));
  }, []);

  /**
   * 清除选中状态
   */
  const clearSelection = useCallback(() => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_select: '',
      select_by_click: false
    }));
  }, []);

  /**
   * 清除编辑状态
   */
  const clearEdit = useCallback(() => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_edit: ''
    }));
  }, []);

  /**
   * 清除所有状态
   */
  const clearAll = useCallback(() => {
    setNodeStatusState({
      cur_select: '',
      cur_edit: '',
      select_by_click: false,
      cur_node_info: {}
    });
  }, []);

  /**
   * 设置节点信息
   * @param nodeInfo 节点信息
   */
  const setNodeInfo = useCallback((nodeInfo: any) => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_node_info: nodeInfo
    }));
  }, []);

  // 组合所有方法和状态
  const value: NodeStatusContextType = {
    nodeStatus,
    setSelect,
    setEdit,
    clearSelection,
    clearEdit,
    clearAll,
    setNodeInfo
  };

  return (
    <NodeStatusContext.Provider value={value}>
      {children}
    </NodeStatusContext.Provider>
  );
};

/**
 * 使用节点状态上下文的自定义Hook
 * @returns NodeStatusContextType 节点状态上下文
 * @throws 如果在 NodeStatusProvider 外部使用则抛出错误
 */
export const useNodeStatusContext = (): NodeStatusContextType => {
  const context = useContext(NodeStatusContext);
  if (!context) {
    throw new Error('useNodeStatusContext must be used within a NodeStatusProvider');
  }
  return context;
};