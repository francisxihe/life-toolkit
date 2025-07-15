export const SET_GLOBAL = 'SET_GLOBAL';
export const SET_TITLE = 'SET_TITLE';
export const SET_THEME = 'SET_THEME';
export const SET_POSITION = 'SET_POSITION';
export const SET_ZOOM = 'SET_ZOOM';
export const RESET_POSITION = 'RESET_POSITION';
export const RESET_ZOOM = 'RESET_ZOOM';
export const ZOOM_IN = 'ZOOM_IN';
export const ZOOM_OUT = 'ZOOM_OUT';
export const ZOOM_RESET = 'ZOOM_RESET';
export const MOVE_XY = 'MOVE_XY';
export const MOVE_RESET = 'MOVE_RESET';
export const MOVE_XY_WHEN_ZOOM = 'MOVE_XY_WHEN_ZOOM';

export type ActionType =
  | typeof SET_GLOBAL
  | typeof SET_TITLE
  | typeof SET_THEME
  | typeof SET_POSITION
  | typeof SET_ZOOM
  | typeof RESET_POSITION
  | typeof RESET_ZOOM
  | typeof ZOOM_IN
  | typeof ZOOM_OUT
  | typeof ZOOM_RESET
  | typeof MOVE_XY
  | typeof MOVE_RESET
  | typeof MOVE_XY_WHEN_ZOOM;
