import * as actionTypes from './actionTypes';
import { MindmapNode } from '../../../types';

interface ActionData {
  cur_select?: string | null;
  cur_edit?: string | null;
  select_by_click?: boolean;
  cur_node_info?: Partial<MindmapNode> & {
    parent?: MindmapNode;
    on_left?: boolean;
  };
}

export interface Action {
  type: actionTypes.ActionType;
  data: ActionData;
}

export const setSelect = (node_id: string | null, select_by_click: boolean = false): Action => ({
  type: actionTypes.SET_SELECT,
  data: {
    cur_select: node_id,
    select_by_click,
    cur_edit: null,
    cur_node_info: {},
  },
});

export const setEdit = (node_id: string | null): Action => ({
  type: actionTypes.SET_EDIT,
  data: {
    cur_select: null,
    cur_edit: node_id,
    cur_node_info: {},
  },
});

export const clearAll = (): Action => ({
  type: actionTypes.CLEAR_ALL,
  data: {
    cur_select: null,
    select_by_click: false,
    cur_edit: null,
    cur_node_info: {},
  },
});

export const getNodeInfo = (node: MindmapNode, parent: MindmapNode, on_left?: boolean): Action => ({
  type: actionTypes.GET_NODE_INFO,
  data: {
    cur_node_info: {
      ...node,
      parent,
      on_left,
    },
  },
});
