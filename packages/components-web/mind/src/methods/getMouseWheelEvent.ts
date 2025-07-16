import { WheelEvent } from 'react';

interface MouseMoveInfo {
  x: number;
  y: number;
}

interface GlobalDispatch {
  (action: { type: string; data: any }): void;
}

const getMouseWheelEvent = (
  gDispatch: GlobalDispatch,
  container: HTMLElement
) => {
  return (event: Event) => {
    const wheelEvent = event as unknown as WheelEvent;
    wheelEvent.preventDefault();
    
    const delta = wheelEvent.deltaY > 0 ? -0.1 : 0.1;
    const rect = container.getBoundingClientRect();
    const x = wheelEvent.clientX - rect.left;
    const y = wheelEvent.clientY - rect.top;
    
    if (delta > 0) {
      gDispatch({ type: 'ZOOM_IN', data: { x, y } });
    } else {
      gDispatch({ type: 'ZOOM_OUT', data: { x, y } });
    }
  };
};

export default getMouseWheelEvent;
