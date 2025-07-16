import * as actionTypes from './actionTypes';
import { MindmapNode } from '../../../types';

interface ActionData {
  node_id?: string;
  parent_id?: string;
  target_id?: string;
  is_sibling?: boolean;
  node?: Partial<MindmapNode>;
  mindmap?: MindmapNode;
}

export interface Action {
  type: actionTypes.ActionType;
  data: ActionData;
}

export const toggleChildren = (node_id: string, node: Partial<MindmapNode>): Action => ({
  type: actionTypes.TOGGLE_CHILDREN,
  data: { node_id, node },
});

export const addChild = (node_id: string, node: MindmapNode): Action => ({
  type: actionTypes.ADD_CHILD,
  data: { node_id, node },
});

export const addSibling = (node_id: string, parent_id: string, node: MindmapNode): Action => ({
  type: actionTypes.ADD_SIBLING,
  data: { node_id, parent_id, node },
});

export const moveNode = (
  node_id: string,
  parent_id: string,
  target_id: string,
  is_sibling: boolean
): Action => ({
  type: actionTypes.MOVE_NODE,
  data: { node_id, parent_id, target_id, is_sibling },
});

export const changeText = (node_id: string, node: Partial<MindmapNode>): Action => ({
  type: actionTypes.CHANGE_TEXT,
  data: { node_id, node },
});

export const setNodeInfo = (node_id: string, info: Partial<MindmapNode>): Action => ({
  type: actionTypes.CHANGE_TEXT,
  data: { node_id, node: info },
});

export const deleteNode = (node_id: string, parent_id: string): Action => ({
  type: actionTypes.DELETE_NODE,
  data: { node_id, parent_id },
});

export const expandAll = (node_id: string): Action => ({
  type: actionTypes.EXPAND_ALL,
  data: { node_id },
});

export const setMindmap = (mindmap: MindmapNode): Action => ({
  type: actionTypes.SET_MINDMAP,
  data: { mindmap },
});
