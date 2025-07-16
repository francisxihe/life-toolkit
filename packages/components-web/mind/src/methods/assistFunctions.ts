import { MouseEvent } from 'react';
import { MindmapNode } from '../types';

export const handlePropagation = (e: MouseEvent<HTMLElement>) => {
  e.stopPropagation();
};

export const findNode = (root: MindmapNode, node_id: string): MindmapNode => {
  if (root.id === node_id) {
    return root;
  }
  for (const child of root.children) {
    const node_found = findNode(child, node_id);
    if (node_found) {
      return node_found;
    }
  }
  return root;
};

export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const setShowChildrenTrue = (node: MindmapNode) => {
  node.showChildren = true;
  node.children.forEach(child => {
    setShowChildrenTrue(child);
  });
};

export const download = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: NodeJS.Timeout | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};
