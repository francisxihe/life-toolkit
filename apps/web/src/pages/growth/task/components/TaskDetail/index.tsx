import { Popover } from '@arco-design/web-react';
import { useState } from 'react';
import TaskEditor, { TaskEditorProps } from './TaskEditor';
import TaskCreator, { TaskCreatorProps } from './TaskCreator';
import { openDrawer, IDrawerOption } from '@/layout/Drawer';

export { TaskEditor, TaskCreator };

export function useTaskDetail() {
  let closeEditDrawer: () => void;

  const openEditDrawer = ({
    drawerProps,
    editorProps,
  }: {
    drawerProps?: Omit<IDrawerOption, 'content'>;
    editorProps: TaskEditorProps;
  }) => {
    const { closeDrawer } = openDrawer({
      ...drawerProps,
      title: '编辑任务',
      width: 800,
      content: (props) => {
        return <TaskEditor {...editorProps} onClose={props.onClose} />;
      },
    });
    closeEditDrawer = closeDrawer;
  };

  let closeCreateDrawer: () => void;
  const openCreateDrawer = ({
    drawerProps,
    creatorProps,
  }: {
    drawerProps?: Omit<IDrawerOption, 'content'>;
    creatorProps: TaskCreatorProps;
  }) => {
    const { closeDrawer } = openDrawer({
      ...drawerProps,
      title: '新建任务',
      width: 800,
      content: (props) => {
        return <TaskCreator {...creatorProps} onClose={props.onClose} />;
      },
    });
    closeCreateDrawer = closeDrawer;
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
    closeEditDrawer,
    openCreateDrawer,
    closeCreateDrawer,
    CreateTaskPopover,
  };
}
