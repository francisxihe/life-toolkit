import * as actionTypes from './actionTypes';
import { GlobalState } from '../../../types';

export interface Action {
  type: string;
  data: Partial<GlobalState> & {
    x?: number;
    y?: number;
  };
}

export const setGlobal = (data: Partial<GlobalState>): Action => ({
  type: actionTypes.SET_GLOBAL,
  data,
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

export const zoomIn = (x: number, y: number): Action => ({
  type: actionTypes.ZOOM_IN,
  data: { x, y },
});

export const zoomOut = (x: number, y: number): Action => ({
  type: actionTypes.ZOOM_OUT,
  data: { x, y },
});

export const zoomReset = (): Action => ({
  type: actionTypes.ZOOM_RESET,
  data: { zoom: 1 },
});

export const moveXY = (x: number, y: number): Action => ({
  type: actionTypes.MOVE_XY,
  data: { x, y },
});

export const moveReset = (): Action => ({
  type: actionTypes.MOVE_RESET,
  data: { x: 0, y: 0 },
});

export const moveXYWhenZoom = (x: number, y: number): Action => ({
  type: actionTypes.MOVE_XY_WHEN_ZOOM,
  data: { x, y },
});
