export const TOGGLE_CHILDREN = 'TOGGLE_CHILDREN';
export const ADD_CHILD = 'ADD_CHILD';
export const ADD_SIBLING = 'ADD_SIBLING';
export const MOVE_NODE = 'MOVE_NODE';
export const CHANGE_TEXT = 'CHANGE_TEXT';
export const DELETE_NODE = 'DELETE_NODE';
export const EXPAND_ALL = 'EXPAND_ALL';
export const SET_MINDMAP = 'SET_MINDMAP';

export type ActionType =
  | typeof TOGGLE_CHILDREN
  | typeof ADD_CHILD
  | typeof ADD_SIBLING
  | typeof MOVE_NODE
  | typeof CHANGE_TEXT
  | typeof DELETE_NODE
  | typeof EXPAND_ALL
  | typeof SET_MINDMAP;
