/**
 * MindmapContext - 思维导图数据管理上下文
 * 
 * 该模块提供了思维导图数据的状态管理和操作方法，包括：
 * - 节点的添加、删除、修改
 * - 节点层级关系的调整
 * - 节点展开/折叠状态的控制
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import defaultMindmap from '../statics/defaultMindmap';
import { MindmapNode } from '../types';
import { findNode, deepCopy, setShowChildrenTrue } from '../methods/assistFunctions';

/**
 * 获取默认思维导图数据
 * 优先从 localStorage 获取，如果没有则使用默认数据
 */
const getDefaultMindmap = (): MindmapNode => 
  JSON.parse(localStorage.getItem('mindmap') || 'null') || defaultMindmap;

/**
 * MindmapContext 类型定义
 * 包含思维导图数据和操作方法
 */
interface MindmapContextType {
  mindmap: MindmapNode;                                                   // 思维导图数据
  toggleChildren: (nodeId: string, node: Partial<MindmapNode>) => void;   // 切换子节点显示/隐藏
  addChild: (nodeId: string, node: MindmapNode) => void;                  // 添加子节点
  addSibling: (nodeId: string, parentId: string, node: MindmapNode) => void; // 添加兄弟节点
  moveNode: (nodeId: string, parentId: string, targetId: string, isSibling: boolean) => void; // 移动节点
  changeText: (nodeId: string, node: Partial<MindmapNode>) => void;       // 修改节点文本
  deleteNode: (nodeId: string, parentId: string) => void;                 // 删除节点
  expandAll: (nodeId: string) => void;                                    // 展开所有子节点
  setMindmap: (mindmap: MindmapNode) => void;                             // 设置整个思维导图
}

// 创建 Context
const MindmapContext = createContext<MindmapContextType | null>(null);

/**
 * MindmapProvider 属性类型
 */
interface MindmapProviderProps {
  children: ReactNode;
  initialValue?: MindmapNode;  // 可选的初始思维导图数据
}

/**
 * MindmapProvider 组件
 * 提供思维导图数据和操作方法的上下文
 */
export const MindmapProvider: React.FC<MindmapProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  // 思维导图状态
  const [mindmap, setMindmapState] = useState<MindmapNode>(
    initialValue || getDefaultMindmap()
  );

  /**
   * 切换节点的子节点显示/隐藏状态
   * @param nodeId 节点ID
   * @param node 要更新的节点属性
   */
  const toggleChildren = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      // 只有当节点有子节点且不是根节点时才更新
      if (nodeFound.children.length > 0 && nodeFound !== newMindmap) {
        Object.assign(nodeFound, node);
      }
      return newMindmap;
    });
  }, []);

  /**
   * 添加子节点
   * @param nodeId 父节点ID
   * @param node 要添加的子节点
   */
  const addChild = useCallback((nodeId: string, node: MindmapNode) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      nodeFound.children.push(node);
      return newMindmap;
    });
  }, []);

  /**
   * 添加兄弟节点
   * @param nodeId 参考节点ID
   * @param parentId 父节点ID
   * @param node 要添加的兄弟节点
   */
  const addSibling = useCallback((nodeId: string, parentId: string, node: MindmapNode) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const parentNode = findNode(newMindmap, parentId);
      // 在参考节点后插入新节点
      const insertIndex = parentNode.children.findIndex(child => child.id === nodeId) + 1;
      parentNode.children.splice(insertIndex, 0, node);
      return newMindmap;
    });
  }, []);

  /**
   * 移动节点
   * @param nodeId 要移动的节点ID
   * @param parentId 当前父节点ID
   * @param targetId 目标节点ID
   * @param isSibling 是否作为兄弟节点插入
   */
  const moveNode = useCallback((
    nodeId: string, 
    parentId: string, 
    targetId: string, 
    isSibling: boolean
  ) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      // 从原位置移除节点
      const parent = findNode(newMindmap, parentId);
      const nodeIndex = parent.children.findIndex(node => node.id === nodeId);
      const nodeCopy = parent.children[nodeIndex];
      parent.children.splice(nodeIndex, 1);
      
      if (isSibling) {
        // 作为兄弟节点插入
        const targetIndex = parent.children.findIndex(node => node.id === targetId) + 1 || 
                           parent.children.length + 1;
        parent.children.splice(targetIndex - 1, 0, nodeCopy);
      } else {
        // 作为子节点插入
        const targetNode = findNode(newMindmap, targetId);
        targetNode.children.push(nodeCopy);
      }
      
      return newMindmap;
    });
  }, []);

  /**
   * 修改节点文本或其他属性
   * @param nodeId 节点ID
   * @param node 要更新的节点属性
   */
  const changeText = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      Object.assign(nodeFound, node);
      return newMindmap;
    });
  }, []);

  /**
   * 删除节点
   * @param nodeId 要删除的节点ID
   * @param parentId 父节点ID
   */
  const deleteNode = useCallback((nodeId: string, parentId: string) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const parentNode = findNode(newMindmap, parentId);
      const deleteIndex = parentNode.children.findIndex(node => node.id === nodeId);
      parentNode.children.splice(deleteIndex, 1);
      return newMindmap;
    });
  }, []);

  /**
   * 展开指定节点的所有子节点
   * @param nodeId 节点ID
   */
  const expandAll = useCallback((nodeId: string) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      setShowChildrenTrue(nodeFound);
      return newMindmap;
    });
  }, []);

  /**
   * 设置整个思维导图
   * @param newMindmap 新的思维导图数据
   */
  const setMindmap = useCallback((newMindmap: MindmapNode) => {
    setMindmapState(newMindmap);
  }, []);

  // 组合所有方法和状态
  const value: MindmapContextType = {
    mindmap,
    toggleChildren,
    addChild,
    addSibling,
    moveNode,
    changeText,
    deleteNode,
    expandAll,
    setMindmap
  };

  return (
    <MindmapContext.Provider value={value}>
      {children}
    </MindmapContext.Provider>
  );
};

/**
 * 使用思维导图上下文的自定义Hook
 * @returns MindmapContextType 思维导图上下文
 * @throws 如果在 MindmapProvider 外部使用则抛出错误
 */
export const useMindmapContext = (): MindmapContextType => {
  const context = useContext(MindmapContext);
  if (!context) {
    throw new Error('useMindmapContext must be used within a MindmapProvider');
  }
  return context;
};