import { useContext } from 'react';
import { context } from '../context';
import * as globalAction from '../context/reducer/global/actionCreator';

interface ZoomHookReturn {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

const useZoom = (): ZoomHookReturn => {
  const {
    global: { dispatch: gDispatch },
  } = useContext(context);

  return {
    zoomIn: () => {
      gDispatch(globalAction.zoomIn(0, 0));
    },
    zoomOut: () => {
      gDispatch(globalAction.zoomOut(0, 0));
    },
    zoomReset: () => {
      gDispatch(globalAction.zoomReset());
    },
  };
};

export default useZoom;
