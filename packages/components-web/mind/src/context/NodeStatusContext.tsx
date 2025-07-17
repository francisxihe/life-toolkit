import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NodeStatus } from '../types';

const getDefaultNodeStatus = (): NodeStatus => ({
  cur_select: '',
  cur_edit: '',
  select_by_click: false,
  cur_node_info: {},
});

interface NodeStatusContextType {
  nodeStatus: NodeStatus;
  setSelect: (nodeId: string, byClick?: boolean, nodeInfo?: any) => void;
  setEdit: (nodeId: string) => void;
  clearSelection: () => void;
  clearEdit: () => void;
  clearAll: () => void;
  setNodeInfo: (nodeInfo: any) => void;
}

const NodeStatusContext = createContext<NodeStatusContextType | null>(null);

interface NodeStatusProviderProps {
  children: ReactNode;
  initialValue?: NodeStatus;
}

export const NodeStatusProvider: React.FC<NodeStatusProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  const [nodeStatus, setNodeStatusState] = useState<NodeStatus>(
    initialValue || getDefaultNodeStatus()
  );

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

  const setEdit = useCallback((nodeId: string) => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_edit: nodeId
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_select: '',
      select_by_click: false
    }));
  }, []);

  const clearEdit = useCallback(() => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_edit: ''
    }));
  }, []);

  const clearAll = useCallback(() => {
    setNodeStatusState({
      cur_select: '',
      cur_edit: '',
      select_by_click: false,
      cur_node_info: {}
    });
  }, []);

  const setNodeInfo = useCallback((nodeInfo: any) => {
    setNodeStatusState(prevStatus => ({
      ...prevStatus,
      cur_node_info: nodeInfo
    }));
  }, []);

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

export const useNodeStatusContext = (): NodeStatusContextType => {
  const context = useContext(NodeStatusContext);
  if (!context) {
    throw new Error('useNodeStatusContext must be used within a NodeStatusProvider');
  }
  return context;
};