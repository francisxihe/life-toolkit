import { Popover } from '@arco-design/web-react';
import { useState } from 'react';
import TaskEditor, { TaskEditorProps } from './TaskEditor';
import TaskCreator, { TaskCreatorProps } from './TaskCreator';
import { openDrawer, IDrawerOption } from '@/layout/Drawer';

export { TaskEditor, TaskCreator };

export function useTaskDetail() {
  const openEditDrawer = (
    props: {
      contentProps: TaskEditorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { contentProps, ...rest } = props;
    openDrawer({
      ...rest,
      title: '编辑任务',
      width: 800,
      content: (props) => {
        return <TaskEditor {...contentProps} onClose={props.onClose} />;
      },
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: TaskCreatorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { contentProps, ...rest } = props;
    openDrawer({
      ...rest,
      title: '新建任务',
      width: 800,
      content: (props) => {
        return <TaskCreator {...contentProps} onClose={props.onClose} />;
      },
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
        popupVisible={createPopoverVisible}
        onVisibleChange={(visible) => {
          setCreatePopoverVisible(visible);
        }}
        position="bl"
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
  };
}
