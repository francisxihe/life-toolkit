import { MindMapData } from '../types';

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

/**
 * 寻找节点的辅助函数
 */
export const findNode = (data: MindMapData, nodeId: string): MindMapData | null => {
  if (data.id === nodeId) {
    return data;
  }

  if (data.children) {
    for (const child of data.children) {
      const found = findNode(child, nodeId);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

/**
 * 寻找父节点的辅助函数
 */
export const findParentNode = (data: MindMapData, nodeId: string): MindMapData | null => {
  if (data.children) {
    for (const child of data.children) {
      if (child.id === nodeId) {
        return data;
      }
      const found = findParentNode(child, nodeId);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

/**
 * 深拷贝思维导图数据
 */
export const cloneMindMapData = (data: MindMapData): MindMapData => {
  return JSON.parse(JSON.stringify(data));
};
