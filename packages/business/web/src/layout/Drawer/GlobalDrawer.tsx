import { Drawer } from '@arco-design/web-react';
import { useStore } from '@nanostores/react';
import { drawerQueueStore, closeDrawer } from './store';

const GlobalDrawer = () => {
  const drawerQueue = useStore(drawerQueueStore);

  //   function closeWhenRouteChange() {
  //     drawerQueue.value.forEach((drawerOption, index) => {
  //       closeDrawer(index);
  //     });
  //   }

  //   window.addEventListener('popstate', closeWhenRouteChange);

  //   onUnmounted(() => {
  //     window.removeEventListener('popstate', closeWhenRouteChange);
  //   });

  return (
    <>
      {drawerQueue.map((drawerOption, index) => {
        const { content: DrawerContent, ...restProps } = drawerOption;
        return (
          <Drawer
            {...restProps}
            key={index}
            footer={null}
            onCancel={() => closeDrawer(index)}
          >
            {drawerOption.visible && (
              <DrawerContent
                param={drawerOption.param}
                onConfirm={(data) => {
                  drawerOption.onConfirm?.(data);
                  closeDrawer(index);
                }}
                onClose={() => closeDrawer(index)}
              />
            )}
          </Drawer>
        );
      })}
    </>
  );
};

export default GlobalDrawer;
