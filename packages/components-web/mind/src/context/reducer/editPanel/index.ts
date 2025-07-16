import * as actionTypes from './actionTypes';
import { EditPanel } from '../../../types';
import { Action } from './actionCreator';

export const defaultValue_editPanel: EditPanel = {
  isShow: false,
  type: '',
  data: null,
};

export default (panel: EditPanel, action: Action): EditPanel => {
  switch (action.type) {
    case actionTypes.TOGGLE_PANEL_SHOW:
      return { ...panel, ...action.data };
    default:
      return panel;
  }
};
