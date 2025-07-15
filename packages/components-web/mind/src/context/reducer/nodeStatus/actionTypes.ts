export const SET_SELECT = 'SET_SELECT';
export const SET_EDIT = 'SET_EDIT';
export const GET_NODE_INFO = 'GET_NODE_INFO';
export const CLEAR_ALL = 'CLEAR_ALL';

export interface NodeStatusAction {
  type: typeof SET_SELECT | typeof SET_EDIT | typeof GET_NODE_INFO | typeof CLEAR_ALL;
  data: {
    cur_select?: string;
    cur_edit?: string;
    select_by_click?: boolean;
    cur_node_info?: Record<string, unknown>;
  };
}

export type ActionType = NodeStatusAction['type'];
