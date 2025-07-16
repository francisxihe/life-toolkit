import { useContext } from 'react';
import { context } from '../context';
import { setPosition } from '../context/reducer/global/actionCreator';
import { moveXY, moveReset } from '../context/reducer/global/actionCreator';

export default function useMove() {
  const {
    global: { state: gState, dispatch: gDispatch },
  } = useContext(context);

  const moveUp = () => {
    gDispatch(setPosition(gState.x, gState.y - 1));
  };

  const moveDown = () => {
    gDispatch(setPosition(gState.x, gState.y + 1));
  };

  const moveLeft = () => {
    gDispatch(setPosition(gState.x - 1, gState.y));
  };

  const moveRight = () => {
    gDispatch(setPosition(gState.x + 1, gState.y));
  };

  return {
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    moveReset: () => {
      gDispatch(moveReset());
    },
    moveXY: (x: number, y: number) => {
      gDispatch(moveXY(x, y));
    },
  };
}
