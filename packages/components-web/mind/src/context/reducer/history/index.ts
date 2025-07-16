import * as actionTypes from './actionTypes';
import { History } from '../../../types';
import { Action } from './actionCreator';

export const defaultValue_history: History = {
  past: [],
  future: [],
  cur_node: null,
  undo: [],
  redo: [],
};

export default (history: History, action: Action): History => {
  switch (action.type) {
    case actionTypes.SET_HISTORY:
      return {
        ...history,
        past: action.data?.mindmap ? [...history.past, JSON.stringify(action.data.mindmap)] : history.past,
        cur_node: action.data?.cur_node || history.cur_node,
      };
    case actionTypes.CLEAR_HISTORY:
      return {
        ...history,
        past: [],
        future: [],
        cur_node: null,
        undo: [],
        redo: [],
      };
    default:
      return history;
  }
};
