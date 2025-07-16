import * as actionTypes from './actionTypes';
import { NodeStatus } from '../../../types';
import { Action } from './actionCreator';

export const defaultValue_nodeStatus: NodeStatus = {
  cur_select: '',
  cur_edit: '',
  select_by_click: false,
  cur_node_info: {},
};

export default (nodeStatus: NodeStatus, action: Action): NodeStatus => {
  switch (action.type) {
    case actionTypes.SET_SELECT:
      if (nodeStatus.cur_select === action.data?.cur_select) {
        // 避免 cur_select 未变更时 info 被清空
        const newData = { ...action.data };
        delete newData.cur_node_info;
        return { ...nodeStatus, ...newData };
      }
      return { ...nodeStatus, ...action.data };
    case actionTypes.SET_EDIT:
    case actionTypes.CLEAR_ALL:
    case actionTypes.GET_NODE_INFO:
      return { ...nodeStatus, ...action.data };
    default:
      return nodeStatus;
  }
};
