import { useContext } from 'react';
import { context } from '../context';
import { setZoom } from '../context/reducer/global/actionCreator';
import * as globalAction from '../context/reducer/global/actionCreator';

export default function useZoom() {
  const {
    global: { state: gState, dispatch: gDispatch },
  } = useContext(context);

  const zoomIn = () => {
    gDispatch(setZoom(gState.zoom + 0.1));
  };

  const zoomOut = () => {
    gDispatch(setZoom(gState.zoom - 0.1));
  };

  return {
    zoomIn,
    zoomOut,
    zoomReset: () => {
      gDispatch(globalAction.zoomReset());
    },
  };
}
