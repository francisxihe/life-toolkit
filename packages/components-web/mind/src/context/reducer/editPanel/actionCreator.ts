import * as actionTypes from './actionTypes';

export interface Action {
  type: string;
  data?: {
    isShow?: boolean;
  };
}

export const togglePanelShow = (isShow: boolean): Action => ({
  type: actionTypes.TOGGLE_PANEL_SHOW,
  data: {
    isShow,
  },
});

// export const openPanel = theme_index => ({
//     type: actionTypes.OPEN_PANEL,
// });
