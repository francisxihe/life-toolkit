import * as actionTypes from './actionTypes';
import { MindmapNode } from '../../../types';

export interface Action {
  type: string;
  data?: {
    mindmap?: MindmapNode;
    cur_node?: string;
  } | null;
}

export const setHistory = (mindmap: MindmapNode, cur_node: string): Action => ({
  type: actionTypes.SET_HISTORY,
  data: mindmap ? { mindmap, cur_node } : null,
});

export const clearHistory = (): Action => ({ type: actionTypes.CLEAR_HISTORY });
