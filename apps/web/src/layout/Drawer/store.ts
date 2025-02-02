import { atom } from 'nanostores';
import { DrawerProps } from '@arco-design/web-react';

export type IDrawerOption = Omit<DrawerProps, 'visible'> & {
  param?: Record<string, unknown>;
  content: (props: {
    param?: Record<string, unknown>;
    onConfirm: (data: unknown) => void;
    onClose: () => void;
  }) => JSX.Element;
  onConfirm?: (data: unknown) => void;
  onClose?: () => void;
};

export const drawerQueueStore = atom<
  (IDrawerOption & {
    visible: boolean;
  })[]
>([]);

export function openDrawer(drawerOption: IDrawerOption) {
  let flag = false;
  let index = 0;

  const drawerQueue = drawerQueueStore.get();
  while (!flag && index < drawerQueue.length) {
    if (!drawerQueue[index].visible) {
      flag = true;
      drawerQueue[index] = {
        ...drawerOption,
        visible: true,
      };
      drawerQueueStore.set([...drawerQueue]);
    } else {
      index++;
    }
  }

  if (!flag) {
    drawerQueueStore.set([
      ...drawerQueue,
      {
        ...drawerOption,
        visible: true,
      },
    ]);
  }

  function closeDrawer() {
    drawerQueue[index].visible = false;
    drawerQueueStore.set([...drawerQueue]);
  }

  return {
    closeDrawer,
  };
}

export function closeDrawer(index: number) {
  const drawerQueue = drawerQueueStore.get();
  drawerQueue[index].visible = false;
  drawerQueue[index].onClose?.();
  drawerQueueStore.set([...drawerQueue]);
}
