import { Drawer, Popover } from '@sue/design-web-react';
import { useState } from 'react';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import TaskEditor, { TaskEditorProps } from './TaskEditor';
import TaskCreator, { TaskCreatorProps } from './TaskCreator';

export { TaskEditor, TaskCreator };

type DrawerOptions = Omit<Parameters<typeof Drawer.open>[0], 'content'>;

export function useTaskDetail() {
  const openEditDrawer = (
    props: {
      contentProps: TaskEditorProps;
    } & DrawerOptions,
  ) => {
    const { contentProps, ...rest } = props;
    const instance = Drawer.open({
      ...rest,
      title: '编辑任务',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <TaskEditor
          {...contentProps}
          onClose={async () => {
            instance.destroy();
          }}
        />
      ),
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: TaskCreatorProps;
    } & DrawerOptions,
  ) => {
    const { contentProps, ...rest } = props;
    const instance = Drawer.open({
      ...rest,
      title: '新建任务',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <TaskCreator
          {...contentProps}
          onClose={async () => {
            instance.destroy();
          }}
        />
      ),
    });
  };

  const [createPopoverVisible, setCreatePopoverVisible] = useState(false);

  const CreatePopover = ({
    children,
    creatorProps,
  }: {
    children: React.ReactNode;
    creatorProps: TaskCreatorProps;
  }) => {
    return (
      <Popover
        trigger="click"
        open={createPopoverVisible}
        onOpenChange={(visible) => {
          setCreatePopoverVisible(visible);
        }}
        placement="bottomLeft"
        style={{
          maxWidth: 'unset',
        }}
        content={
          <div className="w-[600px] p-4">
            <TaskCreator
              size="small"
              {...creatorProps}
              onClose={async () => {
                await creatorProps.onClose?.();
                setCreatePopoverVisible(false);
              }}
            />
          </div>
        }
      >
        <span
          className="cursor-pointer"
          onClick={() => setCreatePopoverVisible(true)}
        >
          {children}
        </span>
      </Popover>
    );
  };

  return {
    openEditDrawer,
    openCreateDrawer,
    CreatePopover,
    createPopoverVisible,
  };
}
