import * as actionTypes from './actionTypes';
import { GlobalState } from '../../../types';
import { Action } from './actionCreator';

export type { GlobalState };

export const defaultValue_global: GlobalState = {
  zoom: 1,
  x: 0,
  y: 0,
  title: localStorage.getItem('title') || 'Mindmap',
  theme_index: Number(localStorage.getItem('theme_index')) || 0,
  theme_list: [
    { main: '#2f54eb', light: '#f0f5ff', dark: '#061178', ex: '#597ef7', assist: '#85a5ff' },
  ],
};

const ZOOM_STEP = 0.1;

const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const preventMinValue = (obj: any, key: string, min: number) => {
  if (obj[key] <= min) {
    obj[key] = min;
  }
};

export default (state: GlobalState = defaultValue_global, action: Action): GlobalState => {
  switch (action.type) {
    case actionTypes.SET_GLOBAL:
      return { ...state, ...action.data };
    case actionTypes.SET_TITLE:
      return { ...state, ...action.data };
    case actionTypes.SET_THEME:
      return { ...state, ...action.data };
    case actionTypes.SET_POSITION:
      return { ...state, ...action.data };
    case actionTypes.SET_ZOOM:
      return { ...state, ...action.data };
    case actionTypes.RESET_POSITION:
      return { ...state, ...action.data };
    case actionTypes.RESET_ZOOM:
      return { ...state, ...action.data };
    case actionTypes.ZOOM_IN: {
      const newGlobal = deepCopy(state);
      newGlobal.zoom += ZOOM_STEP;
      return newGlobal;
    }
    case actionTypes.ZOOM_OUT: {
      const newGlobal = deepCopy(state);
      newGlobal.zoom -= ZOOM_STEP;
      preventMinValue(newGlobal, 'zoom', 0.3);
      return newGlobal;
    }
    case actionTypes.ZOOM_RESET: {
      const newGlobal = deepCopy(state);
      newGlobal.zoom = 1;
      return newGlobal;
    }
    case actionTypes.MOVE_XY: {
      const newGlobal = deepCopy(state);
      newGlobal.x += (action.data.x || 0) / newGlobal.zoom;
      newGlobal.y += (action.data.y || 0) / newGlobal.zoom;
      return newGlobal;
    }
    case actionTypes.MOVE_RESET: {
      const newGlobal = deepCopy(state);
      newGlobal.x = 0;
      newGlobal.y = 0;
      return newGlobal;
    }
    case actionTypes.MOVE_XY_WHEN_ZOOM: {
      const newGlobal = deepCopy(state);
      newGlobal.x = 0;
      newGlobal.y = 0;
      return newGlobal;
    }
    default:
      return state;
  }
};
