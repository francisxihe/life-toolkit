export interface ZoomHook {
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface MoveHook {
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

interface MouseMoveInfo {
  startX: number;
  startY: number;
}

const mousemoveInfo: MouseMoveInfo = {
  startX: 0,
  startY: 0,
};

export default function getMouseWheelEvent(
  hook: ZoomHook | MoveHook,
  zoom: number
): (event: WheelEvent | MouseEvent) => void {
  return (event: WheelEvent | MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if ('zoomIn' in hook) {
      // Zoom hook
      if (event instanceof WheelEvent) {
        if (event.deltaY < 0) {
          hook.zoomIn();
        } else {
          hook.zoomOut();
        }
      }
    } else {
      // Move hook
      if (event instanceof MouseEvent) {
        if (event.type === 'mousemove' && event.buttons === 1) {
          if (event.movementX > 0) {
            hook.moveRight();
          } else if (event.movementX < 0) {
            hook.moveLeft();
          }
          if (event.movementY > 0) {
            hook.moveDown();
          } else if (event.movementY < 0) {
            hook.moveUp();
          }
        }
      }
    }
  };
}
