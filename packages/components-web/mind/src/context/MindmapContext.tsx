import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import defaultMindmap from '../statics/defaultMindmap';
import { MindmapNode } from '../types';
import { findNode, deepCopy, setShowChildrenTrue } from '../methods/assistFunctions';

const getDefaultMindmap = (): MindmapNode => 
  JSON.parse(localStorage.getItem('mindmap') || 'null') || defaultMindmap;

interface MindmapContextType {
  mindmap: MindmapNode;
  toggleChildren: (nodeId: string, node: Partial<MindmapNode>) => void;
  addChild: (nodeId: string, node: MindmapNode) => void;
  addSibling: (nodeId: string, parentId: string, node: MindmapNode) => void;
  moveNode: (nodeId: string, parentId: string, targetId: string, isSibling: boolean) => void;
  changeText: (nodeId: string, node: Partial<MindmapNode>) => void;
  deleteNode: (nodeId: string, parentId: string) => void;
  expandAll: (nodeId: string) => void;
  setMindmap: (mindmap: MindmapNode) => void;
}

const MindmapContext = createContext<MindmapContextType | null>(null);

interface MindmapProviderProps {
  children: ReactNode;
  initialValue?: MindmapNode;
}

export const MindmapProvider: React.FC<MindmapProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  const [mindmap, setMindmapState] = useState<MindmapNode>(
    initialValue || getDefaultMindmap()
  );

  const toggleChildren = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      if (nodeFound.children.length > 0 && nodeFound !== newMindmap) {
        Object.assign(nodeFound, node);
      }
      return newMindmap;
    });
  }, []);

  const addChild = useCallback((nodeId: string, node: MindmapNode) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      nodeFound.children.push(node);
      return newMindmap;
    });
  }, []);

  const addSibling = useCallback((nodeId: string, parentId: string, node: MindmapNode) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const parentNode = findNode(newMindmap, parentId);
      const insertIndex = parentNode.children.findIndex(child => child.id === nodeId) + 1;
      parentNode.children.splice(insertIndex, 0, node);
      return newMindmap;
    });
  }, []);

  const moveNode = useCallback((
    nodeId: string, 
    parentId: string, 
    targetId: string, 
    isSibling: boolean
  ) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const parent = findNode(newMindmap, parentId);
      const nodeIndex = parent.children.findIndex(node => node.id === nodeId);
      const nodeCopy = parent.children[nodeIndex];
      
      parent.children.splice(nodeIndex, 1);
      
      if (isSibling) {
        const targetIndex = parent.children.findIndex(node => node.id === targetId) + 1 || 
                           parent.children.length + 1;
        parent.children.splice(targetIndex - 1, 0, nodeCopy);
      } else {
        const targetNode = findNode(newMindmap, targetId);
        targetNode.children.push(nodeCopy);
      }
      
      return newMindmap;
    });
  }, []);

  const changeText = useCallback((nodeId: string, node: Partial<MindmapNode>) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      Object.assign(nodeFound, node);
      return newMindmap;
    });
  }, []);

  const deleteNode = useCallback((nodeId: string, parentId: string) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const parentNode = findNode(newMindmap, parentId);
      const deleteIndex = parentNode.children.findIndex(node => node.id === nodeId);
      parentNode.children.splice(deleteIndex, 1);
      return newMindmap;
    });
  }, []);

  const expandAll = useCallback((nodeId: string) => {
    setMindmapState(prevMindmap => {
      const newMindmap = deepCopy(prevMindmap);
      const nodeFound = findNode(newMindmap, nodeId);
      setShowChildrenTrue(nodeFound);
      return newMindmap;
    });
  }, []);

  const setMindmap = useCallback((newMindmap: MindmapNode) => {
    setMindmapState(newMindmap);
  }, []);

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

export const useMindmapContext = (): MindmapContextType => {
  const context = useContext(MindmapContext);
  if (!context) {
    throw new Error('useMindmapContext must be used within a MindmapProvider');
  }
  return context;
};