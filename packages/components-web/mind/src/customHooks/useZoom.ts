import { useContext } from 'react';
import { context } from '../context';
import { setZoom } from '../context/reducer/global/actionCreator';
import { ZoomHook } from '../methods/getMouseWheelEvent';

export default function useZoom(): ZoomHook {
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
  };
}
