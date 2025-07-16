import { useContext } from 'react';
import { context } from '../context';
import * as editPanelAction from '../context/reducer/editPanel/actionCreator';

const useEditPanel = () => {
  const {
    editPanel: { state: epState, dispatch: epDispatch },
  } = useContext(context);
  return {
    togglePanelShow: (bool: boolean) => {
      if (epState.isShow === bool) {
        return;
      }
      epDispatch(editPanelAction.togglePanelShow(bool));
    },
    savePanel: (bool: boolean) => {
      epDispatch(editPanelAction.togglePanelShow(bool));
    },
  };
};

export default useEditPanel;
