import * as actionTypes from './actionTypes';

interface GlobalState {
  zoom: number;
  x: number;
  y: number;
  title?: string;
  theme_index?: number;
}

export interface Action {
  type: actionTypes.ActionType;
  data: Partial<GlobalState>;
}

export const setGlobal = (state: Partial<GlobalState>): Action => ({
  type: actionTypes.SET_GLOBAL,
  data: state,
});

export const setTitle = (title: string): Action => ({
  type: actionTypes.SET_TITLE,
  data: { title },
});

export const setTheme = (theme_index: number): Action => ({
  type: actionTypes.SET_THEME,
  data: { theme_index },
});

export const setPosition = (x: number, y: number): Action => ({
  type: actionTypes.SET_POSITION,
  data: { x, y },
});

export const setZoom = (zoom: number): Action => ({
  type: actionTypes.SET_ZOOM,
  data: { zoom },
});

export const resetPosition = (): Action => ({
  type: actionTypes.RESET_POSITION,
  data: { x: 0, y: 0 },
});

export const resetZoom = (): Action => ({
  type: actionTypes.RESET_ZOOM,
  data: { zoom: 1 },
});

export const zoomIn = (x, y): Action => ({
  type: actionTypes.ZOOM_IN,
  data: {
    x,
    y,
  },
});

export const zoomOut = (x, y): Action => ({
  type: actionTypes.ZOOM_OUT,
  data: {
    x,
    y,
  },
});

export const zoomReset = (zoomRate: number): Action => ({
  type: actionTypes.ZOOM_RESET,
  data: {
    zoomRate,
  },
});

export const moveReset = (): Action => ({
  type: actionTypes.MOVE_RESET,
  data: {},
});

export const moveXY = (x, y): Action => ({
  type: actionTypes.MOVE_XY,
  data: {
    x,
    y,
  },
});

export const moveXYWhenZoom = (x, y): Action => ({
  type: actionTypes.MOVE_XY,
  data: {
    x,
    y,
  },
});
