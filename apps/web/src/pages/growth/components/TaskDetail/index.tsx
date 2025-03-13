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
    const { closeDrawer } = openDrawer({
      ...props,
      title: '编辑任务',
      width: 800,
      content: () => {
        return <TaskEditor {...props.contentProps} onClose={props.onClose} />;
      },
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: TaskCreatorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    openDrawer({
      ...props,
      title: '新建任务',
      width: 800,
      content: () => {
        return <TaskCreator {...props.contentProps} onClose={props.onClose} />;
      },
    });
  };

  const [createPopoverVisible, setCreatePopoverVisible] = useState(false);

  const CreateTaskPopover = ({
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
            <TaskCreator size="small" {...creatorProps} />
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
    CreateTaskPopover,
  };
}
